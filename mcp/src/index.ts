#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { PlantUMLClient } from './client.js';
import {
  GenerateDiagramArgsSchema,
  GetFormatsArgsSchema,
  GenerateDiagramZodSchema,
  SUPPORTED_FORMATS,
} from './types.js';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { promises as fs } from 'fs';
import { dirname } from 'path';

// 初始化 AJV 验证器
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

// 统一的响应格式化函数
function ok(data: any) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

// 统一的参数解析和验证函数
function parseArgs<T>(args: unknown, schema: any): T {
  const validate = ajv.compile(schema);
  if (!validate(args)) {
    throw new McpError(ErrorCode.InvalidParams, 
      `Invalid parameters: ${ajv.errorsText(validate.errors)}. ` +
      `Please check the required fields and data types in your request.`
    );
  }
  return args as T;
}

// 保存文件的辅助函数
async function saveFileIfRequested(data: string, savePath?: string, format?: string): Promise<string | undefined> {
  if (!savePath) return undefined;
  
  try {
    // 确保目录存在
    const dir = dirname(savePath);
    await fs.mkdir(dir, { recursive: true });
    
    // 将 Base64 数据转换为二进制
    const buffer = Buffer.from(data, 'base64');
    await fs.writeFile(savePath, buffer);
    
    const stats = await fs.stat(savePath);
    return `File saved successfully to ${savePath} (${stats.size} bytes)`;
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 工具定义对象 - 集中管理所有工具的描述和 schema
const tools = {
  "plantuml-generate": {
    description: "Generate PlantUML diagrams from code. Returns Base64 encoded image data, or saves to file if save_path/savePath is provided (Base64 data omitted when saving to reduce bandwidth).\n\nParameters:\n- code (required): PlantUML source code including @startuml/@enduml tags\n- format (optional): Output format - png|svg|pdf|eps (default: png)\n- save_path or savePath (optional): Local file path to save diagram (supports both naming conventions)\n\nExample: {\"code\": \"@startuml\\nAlice -> Bob: Hello\\n@enduml\", \"format\": \"png\", \"savePath\": \"./diagram.png\"}",
    inputSchema: GenerateDiagramArgsSchema
  },
  "plantuml-formats": {
    description: "Get list of supported diagram output formats from the PlantUML server.\n\nParameters: None required\n\nReturns: Array of supported formats with recommendations for each format.",
    inputSchema: GetFormatsArgsSchema
  },
  "plantuml-health": {
    description: "Check PlantUML server health and connectivity status.\n\nParameters: None required\n\nReturns: Server status, health information, and connection details. Call this first to verify server accessibility.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  }
} as const;

// 解析命令行参数
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  let serverUrl = process.env.PLANTUML_SERVER_URL || 'http://localhost:9090';
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--server-url' || arg === '-s') {
      if (i + 1 < args.length) {
        serverUrl = args[i + 1];
        i++; // 跳过下一个参数
      } else {
        console.error('Error: --server-url requires a URL argument');
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
PlantUML MCP Server v0.2.0

Usage: plantuml-mcp-server [options]

Options:
  -s, --server-url <url>    PlantUML server URL (default: http://localhost:9090)
  -h, --help               Show this help message
  -v, --version            Show version information

Environment Variables:
  PLANTUML_SERVER_URL      PlantUML server URL (overridden by --server-url)

Examples:
  plantuml-mcp-server
  plantuml-mcp-server --server-url http://plantuml.example.com:8080
  PLANTUML_SERVER_URL=http://remote-server:9090 plantuml-mcp-server

MCP Tools Available:
  • plantuml-generate - Generate diagrams with optional file saving
  • plantuml-formats - Query available output formats
  • plantuml-health - Monitor server health status
      `);
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log('PlantUML MCP Server v0.3.2');
      process.exit(0);
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option ${arg}`);
      console.error('Use --help for usage information');
      process.exit(1);
    }
  }
  
  return { serverUrl };
}

class PlantUMLMCPServer {
  private server: Server;
  private client: PlantUMLClient;

  constructor(serverUrl: string) {
    this.server = new Server(
      {
        name: 'plantuml-mcp-server',
        version: '0.3.2',
        description: 'PlantUML diagram generation server for AI agents with file saving support.',
        capabilities: { 
          tools: {}
        }
      }
    );

    this.client = new PlantUMLClient(serverUrl);
    this.setupToolHandlers();
    
    // 输出启动信息到 stderr（不干扰 MCP 协议通信）
    console.error(`🚀 PlantUML MCP Server v0.3.2 starting...`);
    console.error(`📡 PlantUML Server URL: ${serverUrl}`);
  }

  private setupToolHandlers() {
    // 设置工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema as any
      }))
    }));

    // 设置工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'plantuml-generate': {
            const { code, format, save_path, savePath } = parseArgs<{ code: string; format?: string; save_path?: string; savePath?: string }>(
              args, 
              tools['plantuml-generate'].inputSchema
            );
            
            // 支持两种命名约定：save_path 和 savePath
            const finalSavePath = save_path || savePath;
            
            console.error(`🎨 Generating diagram (format: ${format || 'png'}${finalSavePath ? `, saving to: ${finalSavePath}` : ''})`);
            const result = await this.client.generateDiagram(code, format as any);
            
            if (result.success) {
              let saveMessage: string | undefined;
              let shouldReturnData = !finalSavePath; // 如果有保存路径，默认不返回 Base64 数据
              
              // 如果提供了保存路径，则保存文件
              if (finalSavePath && result.data) {
                try {
                  saveMessage = await saveFileIfRequested(result.data, finalSavePath, format);
                  console.error(`💾 File saved successfully, not returning Base64 data to save bandwidth`);
                } catch (error) {
                  console.error(`⚠️ Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
                  // 保存失败时返回 Base64 数据作为备用
                  saveMessage = `Warning: Failed to save file - ${error instanceof Error ? error.message : String(error)}`;
                  shouldReturnData = true;
                }
              }
              
              const responseData: any = {
                success: true,
                format: result.format,
                message: `Diagram generated successfully in ${result.format} format`,
                size: result.data ? `${Math.round(result.data.length * 0.75)} bytes` : 'unknown'
              };
              
              // 只在需要时包含 Base64 数据
              if (shouldReturnData && result.data) {
                responseData.data = result.data;
              } else if (finalSavePath) {
                responseData.note = "Base64 data not included because file was saved locally. Use save_path=null if you need both file saving and Base64 response.";
              }
              
              if (saveMessage) {
                responseData.file_save = saveMessage;
              }
              
              return ok(responseData);
            } else {
              return ok({
                success: false,
                error: result.message,
                suggestion: "Check your PlantUML syntax. Common issues: missing @startuml/@enduml tags, invalid element names, or syntax errors."
              });
            }
          }

          case 'plantuml-formats': {
            console.error(`📋 Fetching supported formats`);
            const formats = await this.client.getSupportedFormats();
            
            return ok({
              formats,
              default: 'png',
              recommendations: {
                'png': 'Best for web display and sharing',
                'svg': 'Best for scalable graphics and printing',
                'pdf': 'Best for documents and reports',
                'eps': 'Best for publications and LaTeX'
              }
            });
          }

          case 'plantuml-health': {
            console.error(`🔍 Checking server health`);
            const health = await this.client.healthCheck();
            
            return ok({
              healthy: health.healthy,
              message: health.message,
              server_url: this.client.getBaseUrl(),
              status: health.healthy ? 'Server is ready for diagram generation' : 'Server is unavailable'
            });
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        console.error(`❌ Error in ${name}:`, error.message);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError, 
          `Tool ${name} failed: ${error?.message ?? String(error)}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`✅ PlantUML MCP Server connected and ready`);
    
    // 优雅关闭处理
    process.on('SIGINT', async () => {
      console.error(`🛑 Shutting down PlantUML MCP Server...`);
      await this.server.close();
      process.exit(0);
    });
  }
}

// 启动服务器
async function main() {
  try {
    const { serverUrl } = parseCommandLineArgs();
    const server = new PlantUMLMCPServer(serverUrl);
    await server.run();
  } catch (error) {
    console.error('❌ Failed to start PlantUML MCP Server:', error);
    process.exit(1);
  }
}

// 只有在直接运行时才启动服务器（不是被import时）
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  main();
}
