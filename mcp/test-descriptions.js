#!/usr/bin/env node
/**
 * Test to verify improved tool descriptions
 */

import { spawn } from 'child_process';

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
      id: 1,
      method,
      params
    };

    let response = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);

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
  console.log('📋 MCP Tool Descriptions Test');
  console.log('=============================');

  const server = startMCPServer();
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    console.log('\n📤 Requesting tool list...');
    const response = await sendMCPRequest(server, 'tools/list', {});
    
    if (response.error) {
      console.log('❌ Error:', response.error);
    } else {
      console.log('✅ Tools received!\n');
      
      response.result.tools.forEach((tool, index) => {
        console.log(`🔧 Tool ${index + 1}: ${tool.name}`);
        console.log('📝 Description:');
        console.log(tool.description);
        console.log('\n📊 Input Schema:');
        console.log(JSON.stringify(tool.inputSchema, null, 2));
        console.log('\n' + '='.repeat(60) + '\n');
      });
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  server.kill();
  console.log('🏁 Test completed');
}

main().catch(console.error);
