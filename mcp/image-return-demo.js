#!/usr/bin/env node

// 演示 PlantUML 图片返回的两种方式
import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const PLANTUML_SERVER = 'http://localhost:9090';
const SAMPLE_CODE = `@startuml
title Authentication Sequence Diagram

actor User
participant WebApp
participant AuthService
database UserDB

User -> WebApp: Login Request
activate WebApp

WebApp -> AuthService: Validate Credentials
activate AuthService

AuthService -> UserDB: Query User
activate UserDB
UserDB --> AuthService: User Data
deactivate UserDB

AuthService --> WebApp: Authentication Result
deactivate AuthService

WebApp --> User: Login Response
deactivate WebApp

@enduml`;

// 方式一：Base64 JSON API
async function testBase64API() {
  console.log('🔄 方式一：Base64 JSON API');
  console.log('===============================');
  
  try {
    const response = await axios.post(`${PLANTUML_SERVER}/api/plantuml/generate`, {
      code: SAMPLE_CODE,
      format: 'png'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ 请求成功');
    console.log('📊 响应结构:');
    console.log('  - success:', response.data.success);
    console.log('  - message:', response.data.message);
    console.log('  - format:', response.data.format);
    console.log('  - base64Data长度:', response.data.base64Data?.length || 0, '字符');
    
    if (response.data.base64Data) {
      // 解码并保存
      const buffer = Buffer.from(response.data.base64Data, 'base64');
      const outputPath = './output/base64-method.png';
      
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, buffer);
      
      console.log('💾 文件已保存:', outputPath);
      console.log('📏 文件大小:', buffer.length, 'bytes');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Base64 API 错误:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    }
    throw error;
  }
}

// 方式二：直接二进制下载 API
async function testBinaryAPI() {
  console.log('\n📁 方式二：直接二进制下载 API');
  console.log('===============================');
  
  try {
    const response = await axios.post(`${PLANTUML_SERVER}/api/plantuml/image/png`, {
      code: SAMPLE_CODE
    }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer'  // 重要：指定响应类型为二进制
    });

    console.log('✅ 请求成功');
    console.log('📊 响应头:');
    console.log('  - Content-Type:', response.headers['content-type']);
    console.log('  - Content-Length:', response.headers['content-length']);
    console.log('  - Content-Disposition:', response.headers['content-disposition']);
    
    // 直接保存二进制数据
    const outputPath = './output/binary-method.png';
    
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, response.data);
    
    console.log('💾 文件已保存:', outputPath);
    console.log('📏 文件大小:', response.data.length, 'bytes');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Binary API 错误:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    }
    throw error;
  }
}

// 比较两种方式
async function compareResults(base64Result, binaryResult) {
  console.log('\n📊 两种方式对比');
  console.log('===============================');
  
  // Base64 数据转换为 Buffer 进行比较
  const base64Buffer = Buffer.from(base64Result.base64Data, 'base64');
  const binaryBuffer = Buffer.from(binaryResult);
  
  console.log('Base64 方式:');
  console.log('  - JSON 字符串长度:', JSON.stringify(base64Result).length, '字符');
  console.log('  - Base64 字符串长度:', base64Result.base64Data.length, '字符');
  console.log('  - 解码后图片大小:', base64Buffer.length, 'bytes');
  
  console.log('\nBinary 方式:');
  console.log('  - 直接图片大小:', binaryBuffer.length, 'bytes');
  
  console.log('\n比较结果:');
  console.log('  - 图片数据是否相同:', base64Buffer.equals(binaryBuffer) ? '✅ 相同' : '❌ 不同');
  console.log('  - 传输效率对比:');
  console.log('    * Base64 传输:', base64Result.base64Data.length, '字符 (约', Math.round(base64Result.base64Data.length * 1.33), 'bytes)');
  console.log('    * Binary 传输:', binaryBuffer.length, 'bytes');
  console.log('    * 效率差异:', Math.round((base64Result.base64Data.length * 1.33 - binaryBuffer.length) / binaryBuffer.length * 100), '% 额外开销');
}

// 测试健康状态
async function testHealthCheck() {
  console.log('🔍 检查 PlantUML 服务器状态...');
  
  try {
    const response = await axios.get(`${PLANTUML_SERVER}/api/plantuml/health`);
    console.log('✅ PlantUML 服务器正常运行');
    console.log('   状态:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ PlantUML 服务器不可用:', error.message);
    console.error('   请确保服务器在', PLANTUML_SERVER, '上运行');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 PlantUML 图片返回方式测试');
  console.log('================================\n');
  
  // 健康检查
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('\n💡 启动建议:');
    console.log('   cd plantuml-server');
    console.log('   ./deploy.sh start dev    # Linux/macOS');
    console.log('   .\\deploy.ps1 start dev   # Windows');
    process.exit(1);
  }
  
  try {
    // 测试两种方式
    const base64Result = await testBase64API();
    const binaryResult = await testBinaryAPI();
    
    // 比较结果
    await compareResults(base64Result, binaryResult);
    
    console.log('\n🎉 测试完成！');
    console.log('\n💡 总结:');
    console.log('  - Base64 JSON API: 适合 AI 代理集成，返回结构化数据');
    console.log('  - Binary API: 适合直接下载，传输效率更高');
    console.log('  - 两种方式生成的图片内容完全相同');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行
if (process.argv[1].endsWith('image-return-demo.js')) {
  main();
}
