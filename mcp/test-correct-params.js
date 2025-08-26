#!/usr/bin/env node

// 测试 MCP 工具的正确参数格式
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';

async function testPlantUMLGenerate() {
  const testCode = `@startuml
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

  // 正确的参数格式 - 只包含 code 和 format
  const correctParams = {
    code: testCode,
    format: "png"
  };

  console.log('🧪 Testing correct MCP parameters:');
  console.log('✅ Correct format:');
  console.log(JSON.stringify(correctParams, null, 2));
  
  console.log('\n❌ Your format contained extra parameter:');
  console.log('save_path is not supported by MCP tools');
  console.log('MCP tools return Base64 data that you need to decode and save manually');

  // 模拟 MCP 调用
  console.log('\n📋 To use the diagram generation:');
  console.log('1. Call the tool with only "code" and "format" parameters');
  console.log('2. Receive Base64 encoded image data');
  console.log('3. Decode and save the data manually if needed');
  
  console.log('\n🔧 Alternative approach - Use HTTP API directly for file saving:');
  console.log('POST http://localhost:9090/api/plantuml/image/png');
  console.log('Body: { "code": "your_plantuml_code" }');
  console.log('This returns the image file directly');
}

testPlantUMLGenerate().catch(console.error);
