#!/usr/bin/env node

// MCP 工具测试脚本
// 测试修复后的 JSON Schema 和参数验证

import { 
  GenerateDiagramArgsSchema,
  ValidateCodeArgsSchema,
  GetFormatsArgsSchema 
} from './dist/types.js';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

function testSchema(name, schema, validArgs, invalidArgs) {
  console.log(`\n🧪 Testing ${name}:`);
  console.log('Schema:', JSON.stringify(schema, null, 2));
  
  const validate = ajv.compile(schema);
  
  // 测试有效参数
  console.log('\n✅ Valid arguments test:');
  validArgs.forEach((args, index) => {
    const isValid = validate(args);
    console.log(`  Test ${index + 1}: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`    Args: ${JSON.stringify(args)}`);
    if (!isValid) {
      console.log(`    Errors: ${ajv.errorsText(validate.errors)}`);
    }
  });
  
  // 测试无效参数
  console.log('\n❌ Invalid arguments test:');
  invalidArgs.forEach((args, index) => {
    const isValid = validate(args);
    console.log(`  Test ${index + 1}: ${!isValid ? '✅ PASS (correctly rejected)' : '❌ FAIL (should be rejected)'}`);
    console.log(`    Args: ${JSON.stringify(args)}`);
    if (!isValid) {
      console.log(`    Errors: ${ajv.errorsText(validate.errors)}`);
    }
  });
}

// 测试 plantuml-generate
testSchema(
  'plantuml-generate',
  GenerateDiagramArgsSchema,
  [
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml' },
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml', format: 'png' },
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml', format: 'svg' },
  ],
  [
    {}, // 缺少 code
    { format: 'png' }, // 缺少 code
    { code: '' }, // 空 code
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml', format: 'invalid' }, // 无效格式
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml', extra: 'field' }, // 额外字段
  ]
);

// 测试 plantuml-validate
testSchema(
  'plantuml-validate',
  ValidateCodeArgsSchema,
  [
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml' },
    { code: 'participant Alice\\nparticipant Bob\\nAlice -> Bob: Hello' },
  ],
  [
    {}, // 缺少 code
    { code: '' }, // 空 code
    { code: '@startuml\\nAlice -> Bob: Hello\\n@enduml', extra: 'field' }, // 额外字段
  ]
);

// 测试 plantuml-formats
testSchema(
  'plantuml-formats',
  GetFormatsArgsSchema,
  [
    {},
  ],
  [
    { extra: 'field' }, // 额外字段
  ]
);

console.log('\n🎉 Schema validation tests completed!');
console.log('\n📋 Usage Examples:');
console.log('1. Generate diagram:');
console.log('   { "code": "@startuml\\\\nAlice -> Bob: Hello\\\\n@enduml", "format": "png" }');
console.log('\n2. Validate code:');
console.log('   { "code": "@startuml\\\\nclass User\\\\n@enduml" }');
console.log('\n3. Get formats:');
console.log('   {}');
