// 简单的 MCP 客户端测试，验证工具是否正常工作
import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';

async function testMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      } else {
        resolve({ output, errorOutput });
      }
    });

    child.on('error', (error) => {
      reject(error);
    });

    // 发送 MCP 请求
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    // 设置超时
    setTimeout(() => {
      child.kill();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

async function runTests() {
  console.log('🧪 Testing MCP Server Tools...\n');

  // 测试 1: plantuml-health (无参数)
  try {
    console.log('1. Testing plantuml-health...');
    const result = await testMCPTool('plantuml-health', {});
    console.log('✅ Health check completed');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  await delay(1000);

  // 测试 2: plantuml-formats (无参数)
  try {
    console.log('\\n2. Testing plantuml-formats...');
    const result = await testMCPTool('plantuml-formats', {});
    console.log('✅ Formats query completed');
  } catch (error) {
    console.log('❌ Formats query failed:', error.message);
  }

  await delay(1000);

  // 测试 3: plantuml-validate (有参数)
  try {
    console.log('\\n3. Testing plantuml-validate...');
    const result = await testMCPTool('plantuml-validate', {
      code: '@startuml\\nAlice -> Bob: Hello\\n@enduml'
    });
    console.log('✅ Code validation completed');
  } catch (error) {
    console.log('❌ Code validation failed:', error.message);
  }

  await delay(1000);

  // 测试 4: plantuml-generate (有参数)
  try {
    console.log('\\n4. Testing plantuml-generate...');
    const result = await testMCPTool('plantuml-generate', {
      code: '@startuml\\nAlice -> Bob: Hello\\n@enduml',
      format: 'png'
    });
    console.log('✅ Diagram generation completed');
  } catch (error) {
    console.log('❌ Diagram generation failed:', error.message);
  }

  console.log('\\n🎉 All tests completed!');
  console.log('\\n📋 If any tests failed, ensure PlantUML server is running on http://localhost:9090');
}

runTests().catch(console.error);
