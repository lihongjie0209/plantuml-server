#!/usr/bin/env node
/**
 * Simple MCP test to debug the parameter validation issue
 */

import { spawn } from 'child_process';

// Simple PlantUML code for testing
const testCode = '@startuml\nAlice -> Bob: Hello\n@enduml';

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
    }, 10000);

    server.stdout.on('data', (data) => {
      response += data.toString();
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.id === request.id) {
            clearTimeout(timeout);
            console.log('📥 Received response:', JSON.stringify(parsed, null, 2));
            resolve(parsed);
            return;
          }
        }
      } catch (e) {
        // 继续等待更多数据
      }
    });

    server.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function main() {
  console.log('🧪 MCP Simple Parameter Test');
  console.log('============================');

  const server = startMCPServer();
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // 测试 1: 检查工具列表
    console.log('\n📋 Test 1: List available tools');
    const toolsResponse = await sendMCPRequest(server, 'tools/list', {});
    
    if (toolsResponse.error) {
      console.log('❌ Tools list failed:', toolsResponse.error);
      return;
    } else {
      console.log('✅ Tools available:', toolsResponse.result.tools.map(t => t.name));
    }

    // 测试 2: 健康检查
    console.log('\n🔍 Test 2: Health check');
    const healthResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-health',
      arguments: {}
    });
    
    if (healthResponse.error) {
      console.log('❌ Health check failed:', healthResponse.error);
      return;
    } else {
      console.log('✅ Health check passed');
    }

    // 测试 3: 生成图表（仅 Base64）
    console.log('\n🎨 Test 3: Generate diagram (Base64 only)');
    const generateResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png'
      }
    });
    
    if (generateResponse.error) {
      console.log('❌ Generate failed:', generateResponse.error);
    } else {
      console.log('✅ Generate succeeded');
    }

    // 测试 4: 生成图表（带保存路径）
    console.log('\n💾 Test 4: Generate diagram with save_path');
    const generateSaveResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: {
        code: testCode,
        format: 'png',
        save_path: './test-output.png'
      }
    });
    
    if (generateSaveResponse.error) {
      console.log('❌ Generate with save failed:', generateSaveResponse.error);
    } else {
      console.log('✅ Generate with save succeeded');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // 关闭服务器
  server.kill();
  console.log('\n🏁 Test completed');
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

main().catch(console.error);
