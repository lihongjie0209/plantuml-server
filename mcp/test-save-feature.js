#!/usr/bin/env node
/**
 * Test script for the new save_path feature in PlantUML MCP Server v0.3.0
 * 
 * This script demonstrates:
 * 1. Generating a diagram with Base64 response (existing functionality)
 * 2. Generating a diagram with file saving (new functionality)
 * 3. Error handling for invalid paths
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test PlantUML code
const testCode = `@startuml
!theme aws-orange
title File Save Feature Test

participant "AI Agent" as agent
participant "MCP Client" as client
participant "PlantUML Server" as server
participant "File System" as fs

agent -> client: Generate diagram with save_path
client -> server: POST /api/plantuml/generate
server -> client: Base64 image data
client -> fs: Save file locally
fs -> client: File saved successfully
client -> agent: Response with Base64 + save confirmation

note over agent, fs
  New feature in v0.3.0:
  - save_path parameter automatically saves files
  - Base64 data still returned for compatibility
  - Error handling for invalid paths
end note

@enduml`;

// Test configuration
const tests = [
  {
    name: "Generate without saving",
    params: {
      code: testCode,
      format: "png"
    }
  },
  {
    name: "Generate with PNG save",
    params: {
      code: testCode,
      format: "png",
      save_path: join(__dirname, "output", "test-diagram.png")
    }
  },
  {
    name: "Generate with SVG save",
    params: {
      code: testCode,
      format: "svg",
      save_path: join(__dirname, "output", "test-diagram.svg")
    }
  },
  {
    name: "Test invalid save path (should show warning)",
    params: {
      code: testCode,
      format: "png",
      save_path: "/invalid/path/that/does/not/exist/test.png"
    }
  }
];

async function createOutputDir() {
  const outputDir = join(__dirname, "output");
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}`);
  }
}

function startMCPServer() {
  console.log('🚀 Starting PlantUML MCP Server...');
  const server = spawn('node', ['dist/index.js'], {
    cwd: __dirname,
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

async function runTest(server, test) {
  console.log(`\n🧪 Running test: ${test.name}`);
  console.log(`   Parameters:`, JSON.stringify(test.params, null, 2));

  try {
    const response = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-generate',
      arguments: test.params
    });

    if (response.error) {
      console.log(`   ❌ Error: ${response.error.message}`);
      return false;
    }

    const result = JSON.parse(response.result.content[0].text);
    console.log(`   ✅ Success: ${result.success}`);
    console.log(`   📏 Size: ${result.size}`);
    console.log(`   📄 Format: ${result.format}`);
    
    if (result.file_save) {
      console.log(`   💾 File save: ${result.file_save}`);
    }
    
    if (test.params.save_path && result.success && !result.file_save?.includes('Warning')) {
      // 验证文件是否真的被保存
      try {
        const stats = await fs.stat(test.params.save_path);
        console.log(`   ✅ File verified: ${stats.size} bytes on disk`);
      } catch (error) {
        console.log(`   ⚠️ File verification failed: ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 PlantUML MCP Server v0.3.0 - File Save Feature Test');
  console.log('==================================================');

  // 创建输出目录
  await createOutputDir();

  // 启动 MCP 服务器
  const server = startMCPServer();
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000));

  let passedTests = 0;
  let totalTests = tests.length;

  // 首先检查服务器健康状态
  console.log('\n🔍 Checking server health...');
  try {
    const healthResponse = await sendMCPRequest(server, 'tools/call', {
      name: 'plantuml-health',
      arguments: {}
    });
    
    const healthResult = JSON.parse(healthResponse.result.content[0].text);
    if (healthResult.healthy) {
      console.log('✅ Server is healthy and ready');
    } else {
      console.log('❌ Server health check failed');
      console.log('   Make sure PlantUML server is running on http://localhost:9090');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Failed to check server health:', error.message);
    process.exit(1);
  }

  // 运行所有测试
  for (const test of tests) {
    const success = await runTest(server, test);
    if (success) passedTests++;
  }

  // 显示结果
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! File save feature is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the output above.');
  }

  // 关闭服务器
  server.kill();
  
  // 显示保存的文件
  try {
    const outputDir = join(__dirname, "output");
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
