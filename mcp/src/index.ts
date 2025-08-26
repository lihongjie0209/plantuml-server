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

// 解析命令行参数
function parseArgs() {
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
PlantUML MCP Server v0.1.0

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
      `);
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log('PlantUML MCP Server v0.1.0');
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
        version: '0.1.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = new PlantUMLClient(serverUrl);
    this.setupToolHandlers();
    
    // 输出启动信息到 stderr（不干扰 MCP 协议通信）
    console.error(`🚀 PlantUML MCP Server v0.1.0 starting...`);
    console.error(`📡 PlantUML Server URL: ${serverUrl}`);
  }

  private setupToolHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_plantuml_diagram',
            description: 'Generate a PlantUML diagram and return it as Base64 encoded image',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'PlantUML diagram code (e.g., "@startuml\\nAlice -> Bob: Hello\\n@enduml")',
                },
                format: {
                  type: 'string',
                  enum: [...SUPPORTED_FORMATS],
                  default: 'png',
                  description: 'Output format for the diagram',
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'validate_plantuml_code',
            description: 'Validate PlantUML code syntax without generating the full diagram',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'PlantUML code to validate',
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'get_supported_formats',
            description: 'Get list of supported output formats for PlantUML diagrams',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'plantuml_health_check',
            description: 'Check if the PlantUML server is healthy and accessible',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_plantuml_diagram':
            return await this.handleGenerateDiagram(args);
          
          case 'validate_plantuml_code':
            return await this.handleValidateCode(args);
          
          case 'get_supported_formats':
            return await this.handleGetFormats(args);
          
          case 'plantuml_health_check':
            return await this.handleHealthCheck();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        );
      }
    });
  }

  private async handleGenerateDiagram(args: unknown) {
    const parsed = GenerateDiagramArgsSchema.parse(args);
    const result = await this.client.generateDiagram(parsed.code, parsed.format);
    
    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to generate diagram: ${result.message}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully generated ${parsed.format.toUpperCase()} diagram. Base64 data: ${result.data?.substring(0, 100)}...`,
        },
        {
          type: 'text',
          text: `Full Base64 Data:\n${result.data}`,
        },
      ],
    };
  }

  private async handleValidateCode(args: unknown) {
    const parsed = ValidateCodeArgsSchema.parse(args);
    const result = await this.client.validateCode(parsed.code);
    
    return {
      content: [
        {
          type: 'text',
          text: `Code validation ${result.valid ? 'passed' : 'failed'}: ${result.message}`,
        },
      ],
    };
  }

  private async handleGetFormats(args: unknown) {
    GetFormatsArgsSchema.parse(args); // 验证参数
    const formats = await this.client.getSupportedFormats();
    
    return {
      content: [
        {
          type: 'text',
          text: `Supported formats: ${formats.join(', ')}`,
        },
      ],
    };
  }

  private async handleHealthCheck() {
    const result = await this.client.healthCheck();
    
    return {
      content: [
        {
          type: 'text',
          text: `Server health: ${result.healthy ? 'Healthy' : 'Unhealthy'} - ${result.message}`,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // 优雅关闭处理
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// 启动服务器
async function main() {
  try {
    const { serverUrl } = parseArgs();
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
