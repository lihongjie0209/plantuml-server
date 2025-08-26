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

class PlantUMLMCPServer {
  private server: Server;
  private client: PlantUMLClient;

  constructor() {
    this.server = new Server(
      {
        name: 'plantuml-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = new PlantUMLClient(process.env.PLANTUML_SERVER_URL);
    this.setupToolHandlers();
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
const server = new PlantUMLMCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
