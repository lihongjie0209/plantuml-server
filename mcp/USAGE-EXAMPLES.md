# PlantUML MCP Server - 正确的调用示例

## 错误的调用格式（会导致 -32602 错误）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "plantuml-generate",
    "arguments": {
      // 缺少 code 参数 - 这会导致错误
      "format": "png"
    }
  }
}
```

## 正确的调用格式

### 1. 仅生成图表（返回 Base64）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "plantuml-generate",
    "arguments": {
      "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
      "format": "png"
    }
  }
}
```

### 2. 生成并保存到文件（不返回 Base64）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "plantuml-generate",
    "arguments": {
      "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
      "format": "svg",
      "save_path": "/path/to/diagram.svg"
    }
  }
}
```

### 3. 最简调用（仅必需参数）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "plantuml-generate",
    "arguments": {
      "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
    }
  }
}
```

## 参数说明

- `code` (必需): PlantUML 代码，必须包含 @startuml/@enduml 标签
- `format` (可选): 输出格式，默认为 "png"，可选值：["png", "svg", "pdf", "eps"]
- `save_path` (可选): 保存文件路径，如果提供则不返回 Base64 数据

## 响应格式

### 成功响应（无文件保存）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\": true, \"format\": \"png\", \"data\": \"iVBORw0KGgoAAAANSUhEUgAA...\", \"message\": \"Diagram generated successfully in png format\", \"size\": \"1234 bytes\"}"
      }
    ]
  }
}
```

### 成功响应（有文件保存）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\": true, \"format\": \"svg\", \"message\": \"Diagram generated successfully in svg format\", \"size\": \"2048 bytes\", \"note\": \"Base64 data not included because file was saved locally. Use save_path=null if you need both file saving and Base64 response.\", \"file_save\": \"File saved successfully to /path/to/diagram.svg (1532 bytes)\"}"
      }
    ]
  }
}
```

### 错误响应

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid parameters: data must have required property 'code'. Please check the required fields and data types in your request."
  }
}
```

## 排错步骤

1. **检查 code 参数**: 确保 arguments 对象中包含 `code` 字段
2. **验证 JSON 格式**: 确保 JSON 格式正确
3. **检查必需字段**: `code` 是唯一必需的参数
4. **验证枚举值**: `format` 必须是 ["png", "svg", "pdf", "eps"] 之一
5. **检查字符串长度**: `code` 不能为空字符串

## 常见错误

1. **缺少 code 参数**: 最常见的错误
2. **code 为空字符串**: 会导致 minLength 验证失败
3. **format 值不正确**: 必须是支持的格式之一
4. **额外的参数**: additionalProperties 设为 false，不允许额外参数
