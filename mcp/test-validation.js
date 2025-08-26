#!/usr/bin/env node
/**
 * Debug parameter validation by testing AJV schema directly
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// 复制我们的 schema
const GenerateDiagramArgsSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      minLength: 1,
      description: "PlantUML diagram code. Required. Example: '@startuml\\nAlice -> Bob: Hello\\n@enduml'"
    },
    format: {
      type: "string",
      enum: ["png", "svg", "pdf", "eps"],
      default: "png",
      description: "Output format for the diagram. Optional, defaults to 'png'. Use 'svg' for scalable graphics, 'pdf' for documents."
    },
    save_path: {
      type: "string",
      description: "Optional local file path to save the generated diagram. When provided, the diagram will be saved to this location and Base64 data will NOT be returned (to save bandwidth)."
    }
  },
  required: ["code"],
  additionalProperties: false
};

// 初始化 AJV 验证器
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

function testValidation(testName, args) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('Input:', JSON.stringify(args, null, 2));
  
  const validate = ajv.compile(GenerateDiagramArgsSchema);
  const valid = validate(args);
  
  if (valid) {
    console.log('✅ Valid');
  } else {
    console.log('❌ Invalid');
    console.log('Errors:', ajv.errorsText(validate.errors));
    console.log('Detailed errors:', JSON.stringify(validate.errors, null, 2));
  }
}

console.log('🔍 AJV Schema Validation Test');
console.log('============================');

// 测试案例
testValidation('Valid - code only', {
  code: '@startuml\nAlice -> Bob: Hello\n@enduml'
});

testValidation('Valid - code and format', {
  code: '@startuml\nAlice -> Bob: Hello\n@enduml',
  format: 'png'
});

testValidation('Valid - code, format, and save_path', {
  code: '@startuml\nAlice -> Bob: Hello\n@enduml',
  format: 'svg',
  save_path: './test.svg'
});

testValidation('Invalid - missing code', {
  format: 'png'
});

testValidation('Invalid - empty code', {
  code: '',
  format: 'png'
});

testValidation('Invalid - wrong format', {
  code: '@startuml\nAlice -> Bob: Hello\n@enduml',
  format: 'invalid'
});

testValidation('Invalid - extra property', {
  code: '@startuml\nAlice -> Bob: Hello\n@enduml',
  format: 'png',
  extra: 'not allowed'
});

console.log('\n🏁 Validation tests completed');
