// 生成架构图的专用脚本
import { PlantUMLFileGenerator } from './plantuml-generator.js';
import { readFileSync } from 'fs';

async function generateArchitectureDiagram() {
  const generator = new PlantUMLFileGenerator();
  
  // 读取架构图 PlantUML 代码
  const pumlCode = readFileSync('../docs/image-return-architecture.puml', 'utf8');
  
  try {
    console.log('🎨 Generating architecture diagram...');
    
    // 生成PNG格式
    await generator.generateAndSaveHTTP(
      pumlCode, 
      'png', 
      '../docs/image-return-architecture.png'
    );
    
    // 生成SVG格式（矢量图，便于文档使用）
    await generator.generateAndSaveHTTP(
      pumlCode, 
      'svg', 
      '../docs/image-return-architecture.svg'
    );
    
    console.log('✅ Architecture diagrams generated successfully!');
    console.log('   - PNG: ./docs/image-return-architecture.png');
    console.log('   - SVG: ./docs/image-return-architecture.svg');
    
  } catch (error) {
    console.error('❌ Failed to generate diagrams:', error.message);
  }
}

generateArchitectureDiagram();
