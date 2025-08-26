#!/usr/bin/env node

// PlantUML 文件生成工具 - 使用 MCP 或直接 HTTP API
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';
import axios from 'axios';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

class PlantUMLFileGenerator {
  constructor(serverUrl = 'http://localhost:9090') {
    this.serverUrl = serverUrl;
  }

  // 方法 1: 使用 HTTP API 直接生成并保存文件
  async generateAndSaveHTTP(code, format, savePath) {
    try {
      console.log(`🚀 Generating ${format} diagram via HTTP API...`);
      
      const response = await axios.post(
        `${this.serverUrl}/api/plantuml/image/${format}`,
        { code },
        { responseType: 'arraybuffer' }
      );

      // 确保目录存在
      const dir = dirname(savePath);
      mkdirSync(dir, { recursive: true });

      // 保存文件
      writeFileSync(savePath, response.data);
      
      console.log(`✅ Diagram saved to: ${savePath}`);
      console.log(`📊 File size: ${response.data.length} bytes`);
      
      return { success: true, path: savePath, size: response.data.length };
    } catch (error) {
      console.error(`❌ Error generating diagram: ${error.message}`);
      throw error;
    }
  }

  // 方法 2: 使用 MCP 服务器生成 Base64 数据并保存
  async generateAndSaveMCP(code, format, savePath) {
    return new Promise((resolve, reject) => {
      console.log(`🤖 Generating ${format} diagram via MCP server...`);
      
      const child = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code_exit) => {
        if (code_exit !== 0) {
          reject(new Error(`MCP process exited with code ${code_exit}: ${errorOutput}`));
          return;
        }

        try {
          // 解析 MCP 响应
          const lines = output.trim().split('\n');
          const response = JSON.parse(lines[lines.length - 1]);
          
          if (response.result && response.result.content) {
            const content = JSON.parse(response.result.content[0].text);
            
            if (content.success && content.data) {
              // 解码 Base64 数据
              const buffer = Buffer.from(content.data, 'base64');
              
              // 确保目录存在
              const dir = dirname(savePath);
              mkdirSync(dir, { recursive: true });
              
              // 保存文件
              writeFileSync(savePath, buffer);
              
              console.log(`✅ Diagram saved to: ${savePath}`);
              console.log(`📊 File size: ${buffer.length} bytes`);
              
              resolve({ success: true, path: savePath, size: buffer.length });
            } else {
              reject(new Error(content.error || 'Failed to generate diagram'));
            }
          } else {
            reject(new Error('Invalid MCP response format'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse MCP response: ${parseError.message}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // 发送 MCP 请求 - 只包含支持的参数
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "plantuml-generate",
          arguments: {
            code: code,
            format: format
          }
        }
      };

      child.stdin.write(JSON.stringify(request) + '\n');
      child.stdin.end();

      // 设置超时
      setTimeout(() => {
        child.kill();
        reject(new Error('MCP request timeout'));
      }, 10000);
    });
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await axios.get(`${this.serverUrl}/api/plantuml/health`);
      return response.data;
    } catch (error) {
      throw new Error(`PlantUML server not available at ${this.serverUrl}: ${error.message}`);
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
PlantUML File Generator v1.0

Usage: node plantuml-generator.js <method> <format> <output_path> [server_url]

Methods:
  http  - Use HTTP API directly (faster, recommended)
  mcp   - Use MCP server (for testing MCP integration)

Formats: png, svg, pdf, eps

Examples:
  node plantuml-generator.js http png ./output/diagram.png
  node plantuml-generator.js mcp svg ./output/diagram.svg http://localhost:9090
    `);
    process.exit(1);
  }

  const [method, format, outputPath, serverUrl] = args;
  const generator = new PlantUMLFileGenerator(serverUrl);

  // 您的 PlantUML 代码
  const plantUMLCode = `@startuml
title Authentication Sequence Diagram

actor User
participant WebApp
participant AuthService
database UserDB

User -> WebApp: Login Request
activate WebApp

WebApp -> AuthService: Validate Credentials
activate AuthService

AuthService -> UserDB: Query User
activate UserDB
UserDB --> AuthService: User Data
deactivate UserDB

AuthService --> WebApp: Authentication Result
deactivate AuthService

WebApp --> User: Login Response
deactivate WebApp

@enduml`;

  try {
    // 健康检查
    console.log('🔍 Checking PlantUML server health...');
    await generator.healthCheck();
    console.log('✅ PlantUML server is healthy');

    // 生成图表
    if (method === 'http') {
      await generator.generateAndSaveHTTP(plantUMLCode, format, outputPath);
    } else if (method === 'mcp') {
      await generator.generateAndSaveMCP(plantUMLCode, format, outputPath);
    } else {
      throw new Error(`Unknown method: ${method}. Use 'http' or 'mcp'`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (process.argv[1].endsWith('plantuml-generator.js')) {
  main();
}

export { PlantUMLFileGenerator };
