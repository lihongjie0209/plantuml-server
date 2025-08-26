import { PlantUMLClient } from './client.js';

/**
 * 快速测试脚本
 */
async function quickTest() {
  console.log('🧪 PlantUML MCP Server Quick Test\n');

  const client = new PlantUMLClient('http://localhost:9090');

  // 测试健康检查
  console.log('1. Testing health check...');
  const health = await client.healthCheck();
  console.log(`   Result: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Message: ${health.message}\n`);

  if (!health.healthy) {
    console.log('❌ PlantUML server is not running. Please start it first:');
    console.log('   cd .. && ./mvnw.cmd compile quarkus:dev\n');
    return;
  }

  // 测试简单图表生成
  console.log('2. Testing diagram generation...');
  const simpleCode = '@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml';
  
  const result = await client.generateDiagram(simpleCode, 'png');
  
  if (result.success) {
    console.log('   ✅ Diagram generated successfully!');
    console.log(`   Data length: ${result.data?.length} characters`);
  } else {
    console.log('   ❌ Failed to generate diagram');
    console.log(`   Error: ${result.message}`);
  }

  console.log('\n🎉 Quick test completed!');
  console.log('\nTo start the MCP server:');
  console.log('   npm start');
}

quickTest().catch(console.error);
