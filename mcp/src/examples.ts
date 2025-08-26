import { PlantUMLClient } from './client.js';

/**
 * 示例：如何使用 PlantUML 客户端
 */
async function runExamples() {
  const client = new PlantUMLClient('http://localhost:9090');

  console.log('🚀 PlantUML Client Examples\n');

  // 1. 健康检查
  console.log('1. Health Check:');
  const health = await client.healthCheck();
  console.log(`   Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Message: ${health.message}\n`);

  if (!health.healthy) {
    console.log('❌ Server is not healthy. Please start the PlantUML server first.');
    return;
  }

  // 2. 获取支持的格式
  console.log('2. Supported Formats:');
  const formats = await client.getSupportedFormats();
  console.log(`   Formats: ${formats.join(', ')}\n`);

  // 3. 验证代码
  console.log('3. Code Validation:');
  const validCode = '@startuml\nAlice -> Bob: Hello\n@enduml';
  const validation = await client.validateCode(validCode);
  console.log(`   Valid: ${validation.valid ? '✅' : '❌'}`);
  console.log(`   Message: ${validation.message}\n`);

  // 4. 生成图表
  console.log('4. Generate Diagram:');
  const sequenceDiagram = `
    @startuml
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User -> Frontend: Login Request
    Frontend -> Backend: Authenticate
    Backend -> Database: Query User
    Database --> Backend: User Data
    Backend --> Frontend: Auth Token
    Frontend --> User: Login Success
    @enduml
  `;

  const result = await client.generateDiagram(sequenceDiagram, 'png');
  
  if (result.success) {
    console.log('   ✅ Diagram generated successfully!');
    console.log(`   Format: ${result.format}`);
    console.log(`   Data length: ${result.data?.length} characters`);
    console.log(`   Preview: ${result.data?.substring(0, 50)}...`);
  } else {
    console.log('   ❌ Failed to generate diagram');
    console.log(`   Error: ${result.message}`);
  }

  console.log('\n🎉 Examples completed!');
}

// 运行示例（仅在直接执行时）
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { runExamples };
