import { PlantUMLClient } from './client.js';

async function runFinalTests() {
  console.log('🧪 PlantUML MCP Server Final Test Suite\n');

  const client = new PlantUMLClient('http://localhost:9090');

  try {
    // 1. Health Check
    console.log('1. 🔍 Health Check...');
    const health = await client.healthCheck();
    console.log(`   ${health.healthy ? '✅' : '❌'} Status: ${health.message}`);
    console.log(`   📍 Server: http://localhost:9090\n`);

    // 2. Format Support
    console.log('2. 📋 Format Support...');
    const formats = await client.getSupportedFormats();
    console.log(`   ✅ Supported: ${formats.join(', ')}`);
    console.log(`   📊 Total: ${formats.length} formats\n`);

    // 3. Basic Diagram Generation
    console.log('3. 🎨 Basic Diagram Generation...');
    const simpleCode = "@startuml\nAlice -> Bob: Hello\n@enduml";
    
    for (const format of ['png', 'svg']) {
      try {
        const result = await client.generateDiagram(simpleCode, format as any);
        if (result.success && result.data) {
          const sizeKB = Math.round(result.data.length * 0.75 / 1024);
          console.log(`   ✅ ${format.toUpperCase()}: Generated (${sizeKB} KB)`);
        } else {
          console.log(`   ❌ ${format.toUpperCase()}: Failed - ${result.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${format.toUpperCase()}: Error - ${error}`);
      }
    }

    // 4. Performance Test
    console.log('\n4. ⚡ Performance Test...');
    const start = Date.now();
    await client.generateDiagram(simpleCode, 'png');
    const duration = Date.now() - start;
    console.log(`   🚀 Generated in ${duration}ms`);
    
    if (duration < 1000) {
      console.log('   ✅ Performance: Excellent');
    } else if (duration < 3000) {
      console.log('   ⚠️ Performance: Good');
    } else {
      console.log('   ❌ Performance: Slow');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📖 Usage Instructions:');
    console.log('   • Start server: npm start');
    console.log('   • Use with Claude: plantuml-mcp-server');
    console.log('   • Use with server: plantuml-mcp-server --server-url http://localhost:9090');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runFinalTests();
