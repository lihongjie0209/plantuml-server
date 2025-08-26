#!/usr/bin/env node
/**
 * 测试文件保存功能的专用脚本
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

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
    stdio: ['pipe', 'pipe', 'inherit']
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

    console.log('📤 Sending request:', JSON.stringify(request, null, 2));

    let response = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 15000);

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
              console.log('📥 Received response:', JSON.stringify(parsed, null, 2));
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

async function cleanupTestFiles() {
  const testFiles = [
    './test-save-snake-case.png',
    './test-save-camel-case.png',
    './output/test-nested.svg'
  ];
  
  for (const file of testFiles) {
    try {
      await fs.unlink(file);
      console.log(`🗑️ Cleaned up: ${file}`);
    } catch (error) {
      // 文件不存在，忽略
    }
  }
}

async function checkFileExists(filePath) {
  try {
    const stats = await fs.stat(filePath);
    console.log(`✅ File exists: ${filePath} (${stats.size} bytes)`);
    return true;
  } catch (error) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log('🧪 PlantUML MCP Server - File Save Test');
  console.log('======================================');

  // 清理之前的测试文件
  await cleanupTestFiles();

  const server = startMCPServer();
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // 测试 1: 健康检查
    console.log('\n🔍 Test 1: Health check');
    const healthResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-health',
      arguments: {}
    });
    
    if (healthResponse.error) {
      console.log('❌ Health check failed:', healthResponse.error);
      return;
    }
    
    const healthResult = JSON.parse(healthResponse.result.content[0].text);
    if (!healthResult.healthy) {
      console.log('❌ PlantUML server is not healthy');
      return;
    }
    console.log('✅ PlantUML server is healthy');

    // 测试 2: 使用 snake_case (save_path)
    console.log('\n💾 Test 2: File save with snake_case (save_path)');
    const snakeCaseResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png',
        save_path: './test-save-snake-case.png'
      }
    });
    
    if (snakeCaseResponse.error) {
      console.log('❌ Snake case test failed:', snakeCaseResponse.error);
    } else {
      const result = JSON.parse(snakeCaseResponse.result.content[0].text);
      console.log('✅ Snake case response received');
      console.log('📊 Result:', {
        success: result.success,
        format: result.format,
        file_save: result.file_save,
        has_data: !!result.data
      });
      
      // 检查文件是否存在
      await new Promise(resolve => setTimeout(resolve, 500)); // 等待文件写入
      await checkFileExists('./test-save-snake-case.png');
    }

    // 测试 3: 使用 camelCase (savePath)
    console.log('\n💾 Test 3: File save with camelCase (savePath)');
    const camelCaseResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png',
        savePath: './test-save-camel-case.png'
      }
    });
    
    if (camelCaseResponse.error) {
      console.log('❌ Camel case test failed:', camelCaseResponse.error);
    } else {
      const result = JSON.parse(camelCaseResponse.result.content[0].text);
      console.log('✅ Camel case response received');
      console.log('📊 Result:', {
        success: result.success,
        format: result.format,
        file_save: result.file_save,
        has_data: !!result.data
      });
      
      // 检查文件是否存在
      await new Promise(resolve => setTimeout(resolve, 500)); // 等待文件写入
      await checkFileExists('./test-save-camel-case.png');
    }

    // 测试 4: 嵌套目录保存
    console.log('\n📁 Test 4: File save with nested directory');
    const nestedResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'svg',
        savePath: './output/test-nested.svg'
      }
    });
    
    if (nestedResponse.error) {
      console.log('❌ Nested directory test failed:', nestedResponse.error);
    } else {
      const result = JSON.parse(nestedResponse.result.content[0].text);
      console.log('✅ Nested directory response received');
      console.log('📊 Result:', {
        success: result.success,
        format: result.format,
        file_save: result.file_save,
        has_data: !!result.data
      });
      
      // 检查文件是否存在
      await new Promise(resolve => setTimeout(resolve, 500)); // 等待文件写入
      await checkFileExists('./output/test-nested.svg');
    }

    // 测试 5: 无保存路径（应该返回 Base64）
    console.log('\n📄 Test 5: Generate without saving (should return Base64)');
    const noSaveResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png'
      }
    });
    
    if (noSaveResponse.error) {
      console.log('❌ No save test failed:', noSaveResponse.error);
    } else {
      const result = JSON.parse(noSaveResponse.result.content[0].text);
      console.log('✅ No save response received');
      console.log('📊 Result:', {
        success: result.success,
        format: result.format,
        has_data: !!result.data,
        data_length: result.data ? result.data.length : 0
      });
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  server.kill();
  console.log('\n🏁 File save test completed');
}

main().catch(console.error);
