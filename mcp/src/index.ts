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
  ValidateCodeArgsSchema,
  GetFormatsArgsSchema,
  SUPPORTED_FORMATS,
} from './types.js';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

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
    throw new McpError(ErrorCode.InvalidParams, ajv.errorsText(validate.errors));
  }
  return args as T;
}

// 工具定义对象 - 集中管理所有工具的描述和 schema
const tools = {
  "plantuml-generate": {
    description: "Generate PlantUML diagrams and return Base64 encoded images. WORKFLOW: 1) Use plantuml-health first to verify server connectivity, 2) Optionally call plantuml-validate to check syntax, 3) Generate diagram with preferred format.",
    inputSchema: GenerateDiagramArgsSchema
  },
  "plantuml-validate": {
    description: "Validate PlantUML code syntax before generating diagrams. RECOMMENDED: Always validate complex diagrams before generation to catch syntax errors early.",
    inputSchema: ValidateCodeArgsSchema
  },
  "plantuml-formats": {
    description: "Get list of supported output formats from the PlantUML server. Use this to check available formats before generating diagrams.",
    inputSchema: GetFormatsArgsSchema
  },
  "plantuml-health": {
    description: "Check PlantUML server health and connectivity. IMPORTANT: Call this first to ensure the server is accessible before using other tools.",
    inputSchema: { type: "object", properties: {} }
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
  • generate_plantuml_diagram - Generate diagrams with AJV validation
  • validate_plantuml_code - Validate syntax with detailed error reporting  
  • get_supported_formats - Query available output formats
  • plantuml_health_check - Monitor server health status
      `);
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log('PlantUML MCP Server v0.2.0');
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
        version: '0.2.0',
        description: 'PlantUML diagram generation server for AI agents. WORKFLOW: Start with plantuml-health to verify connectivity, then use other tools as needed.',
        capabilities: { 
          tools: {}
        }
      }
    );

    this.client = new PlantUMLClient(serverUrl);
    this.setupToolHandlers();
    
    // 输出启动信息到 stderr（不干扰 MCP 协议通信）
    console.error(`🚀 PlantUML MCP Server v0.2.0 starting...`);
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
            const { code, format } = parseArgs<{ code: string; format?: string }>(
              args, 
              tools['plantuml-generate'].inputSchema
            );
            
            console.error(`🎨 Generating diagram (format: ${format || 'png'})`);
            const result = await this.client.generateDiagram(code, format as any);
            
            if (result.success) {
              return ok({
                success: true,
                format: result.format,
                data: result.data,
                message: `Diagram generated successfully in ${result.format} format`,
                size: result.data ? `${Math.round(result.data.length * 0.75)} bytes` : 'unknown'
              });
            } else {
              return ok({
                success: false,
                error: result.message,
                suggestion: "Check your PlantUML syntax or use plantuml-validate to identify issues"
              });
            }
          }

          case 'plantuml-validate': {
            const { code } = parseArgs<{ code: string }>(
              args, 
              tools['plantuml-validate'].inputSchema
            );
            
            console.error(`✅ Validating PlantUML code`);
            const result = await this.client.validateCode(code);
            
            return ok({
              valid: result.valid,
              message: result.message,
              recommendation: result.valid 
                ? "Code is valid. You can proceed with diagram generation." 
                : "Fix syntax errors before generating the diagram."
            });
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
