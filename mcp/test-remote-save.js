#!/usr/bin/env node
/**
 * Test file saving functionality with remote PlantUML server
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test PlantUML code
const testCode = `@startuml
!theme plain

title PlantUML MCP 服务器测试

actor 用户 as User
participant "MCP服务器" as MCP
participant "PlantUML服务" as PlantUML
database "图表存储" as Storage

User -> MCP: 发送PlantUML代码
activate MCP

MCP -> PlantUML: 调用渲染API
activate PlantUML

PlantUML -> PlantUML: 解析UML代码
PlantUML -> PlantUML: 生成图表

PlantUML --> MCP: 返回图表数据
deactivate PlantUML

MCP -> Storage: 保存图表
activate Storage
Storage --> MCP: 确认保存
deactivate Storage

MCP --> User: 返回图表结果
deactivate MCP

note right of User
  测试完成！
  PlantUML MCP服务器
  运行正常
end note

@enduml`;

function startMCPServer() {
  console.log('🚀 Starting PlantUML MCP Server...');
  const server = spawn('node', ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, PLANTUML_SERVER_URL: 'https://plantuml-server-stlar2fcoa-ew.a.run.app' }
  });

  return server;
}

async function sendMCPRequest(server, method, params = {}) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: "2.0",
      id: Math.random(),
      method,
      params
    };

    let response = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000); // 增加超时时间到30秒

    const onData = (data) => {
      response += data.toString();
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              clearTimeout(timeout);
              server.stdout.off('data', onData);
              resolve(parsed);
              return;
            }
          }
        }
      } catch (e) {
        // 继续等待更多数据
      }
    };

    server.stdout.on('data', onData);
    server.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function main() {
  console.log('🧪 PlantUML MCP Server File Save Test (Remote Server)');
  console.log('====================================================');

  // 创建输出目录
  const outputDir = join(__dirname, "output");
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}`);
  }

  const server = startMCPServer();
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // 测试 1: 健康检查
    console.log('\n🔍 Test 1: Health check with remote server');
    const healthResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-health',
      arguments: {}
    });
    
    if (healthResponse.error) {
      console.log('❌ Health check failed:', healthResponse.error);
      return;
    } else {
      const healthResult = JSON.parse(healthResponse.result.content[0].text);
      console.log('✅ Health check passed');
      console.log(`   Server: ${healthResult.server_url}`);
      console.log(`   Status: ${healthResult.status}`);
    }

    // 测试 2: 生成图表并保存文件（使用 savePath）
    console.log('\n💾 Test 2: Generate diagram with savePath');
    const savePath = join(outputDir, "test-sequence-diagram.png");
    console.log(`   Save path: ${savePath}`);
    
    const generateResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png',
        savePath: savePath  // 使用 camelCase
      }
    });
    
    if (generateResponse.error) {
      console.log('❌ Generate with savePath failed:', generateResponse.error);
    } else {
      const result = JSON.parse(generateResponse.result.content[0].text);
      console.log('✅ Generate with savePath succeeded');
      console.log(`   Success: ${result.success}`);
      console.log(`   Format: ${result.format}`);
      console.log(`   Size: ${result.size}`);
      
      if (result.file_save) {
        console.log(`   File save: ${result.file_save}`);
      }
      
      // 验证文件是否真的被保存
      try {
        const stats = await fs.stat(savePath);
        console.log(`   ✅ File verified: ${stats.size} bytes on disk`);
      } catch (error) {
        console.log(`   ⚠️ File verification failed: ${error.message}`);
      }
    }

    // 测试 3: 生成图表并保存文件（使用 save_path）
    console.log('\n💾 Test 3: Generate diagram with save_path');
    const savePath2 = join(outputDir, "test-sequence-diagram-2.svg");
    console.log(`   Save path: ${savePath2}`);
    
    const generateResponse2 = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'svg',
        save_path: savePath2  // 使用 snake_case
      }
    });
    
    if (generateResponse2.error) {
      console.log('❌ Generate with save_path failed:', generateResponse2.error);
    } else {
      const result2 = JSON.parse(generateResponse2.result.content[0].text);
      console.log('✅ Generate with save_path succeeded');
      console.log(`   Success: ${result2.success}`);
      console.log(`   Format: ${result2.format}`);
      console.log(`   Size: ${result2.size}`);
      
      if (result2.file_save) {
        console.log(`   File save: ${result2.file_save}`);
      }
      
      // 验证文件是否真的被保存
      try {
        const stats = await fs.stat(savePath2);
        console.log(`   ✅ File verified: ${stats.size} bytes on disk`);
      } catch (error) {
        console.log(`   ⚠️ File verification failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // 关闭服务器
  server.kill();
  
  // 显示保存的文件
  try {
    const files = await fs.readdir(outputDir);
    if (files.length > 0) {
      console.log('\n📁 Generated files:');
      for (const file of files) {
        const filePath = join(outputDir, file);
        const stats = await fs.stat(filePath);
        console.log(`   ${file} (${stats.size} bytes)`);
      }
    }
  } catch (error) {
    // 忽略错误
  }
  
  console.log('\n🏁 Test completed');
}

main().catch(console.error);
