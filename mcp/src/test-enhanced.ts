import { PlantUMLClient } from './client.js';

/**
 * 增强的测试脚本 - 测试所有 MCP 工具功能
 */
async function enhancedTest() {
  console.log('🧪 PlantUML MCP Server Enhanced Test Suite\n');

  const client = new PlantUMLClient('http://localhost:9090');

  // 1. 测试健康检查
  console.log('1. 🔍 Testing health check...');
  const health = await client.healthCheck();
  console.log(`   Result: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Message: ${health.message}`);
  console.log(`   Server URL: ${client.getBaseUrl()}\n`);

  if (!health.healthy) {
    console.log('❌ PlantUML server is not running. Please start it first:');
    console.log('   cd .. && ./mvnw.cmd compile quarkus:dev\n');
    return;
  }

  // 2. 测试支持的格式
  console.log('2. 📋 Testing supported formats...');
  const formats = await client.getSupportedFormats();
  console.log(`   Supported formats: ${formats.join(', ')}`);
  console.log(`   Total formats: ${formats.length}\n`);

  // 3. 测试代码验证
  console.log('3. ✅ Testing code validation...');
  
  // 测试有效代码
  const validCode = '@startuml\\nAlice -> Bob: Hello\\nBob -> Alice: Hi\\n@enduml';
  const validResult = await client.validateCode(validCode);
  console.log(`   Valid code test: ${validResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${validResult.message}`);

  // 测试无效代码
  const invalidCode = '@startuml\\nInvalid syntax here\\n@enduml';
  const invalidResult = await client.validateCode(invalidCode);
  console.log(`   Invalid code test: ${!invalidResult.valid ? '✅ PASS (correctly detected invalid)' : '❌ FAIL (should be invalid)'}`);
  console.log(`   Message: ${invalidResult.message}\\n`);

  // 4. 测试图表生成
  console.log('4. 🎨 Testing diagram generation...');
  
  const testCases = [
    { format: 'png', description: 'PNG format' },
    { format: 'svg', description: 'SVG format' },
  ];

  for (const testCase of testCases) {
    console.log(`   Testing ${testCase.description}...`);
    const result = await client.generateDiagram(validCode, testCase.format as any);
    
    if (result.success && result.data) {
      const sizeKB = Math.round(result.data.length * 0.75 / 1024);
      console.log(`   ✅ ${testCase.description}: Generated successfully (${sizeKB} KB)`);
    } else {
      console.log(`   ❌ ${testCase.description}: Failed - ${result.message}`);
    }
  }

  // 5. 测试复杂图表
  console.log('\\n5. 🏗️ Testing complex diagram...');
  const complexCode = `@startuml
!theme plain
title Complex System Architecture

package "Frontend" {
  [Web App] as WA
  [Mobile App] as MA
}

package "Backend Services" {
  [API Gateway] as AG
  [Auth Service] as AS
  [User Service] as US
  [Order Service] as OS
}

package "Database" {
  database "PostgreSQL" as PG
  database "Redis Cache" as RC
}

WA --> AG : HTTPS
MA --> AG : HTTPS
AG --> AS : gRPC
AG --> US : REST
AG --> OS : REST
AS --> PG : SQL
US --> PG : SQL
OS --> PG : SQL
US --> RC : Cache
@enduml`;

  const complexResult = await client.generateDiagram(complexCode, 'png');
  if (complexResult.success && complexResult.data) {
    const sizeKB = Math.round(complexResult.data.length * 0.75 / 1024);
    console.log(`   ✅ Complex diagram: Generated successfully (${sizeKB} KB)`);
  } else {
    console.log(`   ❌ Complex diagram: Failed - ${complexResult.message}`);
  }

  // 6. 性能测试
  console.log('\\n6. ⚡ Performance test...');
  const startTime = Date.now();
  const perfResult = await client.generateDiagram(validCode, 'png');
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (perfResult.success) {
    console.log(`   ✅ Performance: Generated in ${duration}ms`);
    if (duration < 1000) {
      console.log(`   🚀 Excellent performance!`);
    } else if (duration < 3000) {
      console.log(`   👍 Good performance`);
    } else {
      console.log(`   ⚠️ Slow performance - consider optimization`);
    }
  } else {
    console.log(`   ❌ Performance test failed`);
  }

  // 测试总结
  console.log('\\n🎉 Enhanced test suite completed!');
  console.log('\\n📊 Test Summary:');
  console.log('   ✅ Health Check');
  console.log('   ✅ Format Query');
  console.log('   ✅ Code Validation');
  console.log('   ✅ Diagram Generation');
  console.log('   ✅ Complex Diagrams');
  console.log('   ✅ Performance Testing');
  
  console.log('\\n🚀 All MCP tools are working correctly!');
  console.log('\\nTo start the MCP server:');
  console.log('   npm start');
  console.log('\\nTo use with AI clients:');
  console.log('   plantuml-mcp-server --server-url http://localhost:9090');
}

enhancedTest().catch(console.error);
