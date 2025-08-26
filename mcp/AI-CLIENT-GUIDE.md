# AI 客户端使用指南 - PlantUML MCP Server v0.3.1

## 常见错误及解决方案

### 错误 1: "Invalid parameters: data must have required property 'code'"

**问题**: 调用 `plantuml-generate` 工具时缺少必需的 `code` 参数

**解决方案**: 确保传递 `code` 参数

```json
// ❌ 错误的调用
{
  "name": "plantuml-generate",
  "arguments": {
    "format": "png"  // 缺少 code 参数
  }
}

// ✅ 正确的调用
{
  "name": "plantuml-generate", 
  "arguments": {
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
    "format": "png"
  }
}
```

### 错误 2: "data/code must NOT have fewer than 1 characters"

**问题**: `code` 参数为空字符串

**解决方案**: 提供有效的 PlantUML 代码

```json
// ❌ 错误的调用
{
  "name": "plantuml-generate",
  "arguments": {
    "code": ""  // 空字符串
  }
}

// ✅ 正确的调用
{
  "name": "plantuml-generate",
  "arguments": {
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
  }
}
```

## 推荐的调用模式

### 模式 1: 快速生成（获取 Base64）

```json
{
  "name": "plantuml-generate",
  "arguments": {
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
  }
}
```

**响应**: 包含 Base64 编码的图片数据

### 模式 2: 生成并保存文件（不返回 Base64）

```json
{
  "name": "plantuml-generate",
  "arguments": {
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
    "format": "svg",
    "save_path": "./output/diagram.svg"
  }
}
```

**响应**: 文件保存确认，不包含 Base64 数据（节省带宽）

### 模式 3: 检查服务器状态（推荐首次调用）

```json
{
  "name": "plantuml-health",
  "arguments": {}
}
```

**响应**: 服务器健康状态和连接信息

## AI 助手实现示例

### Claude/GPT 风格的调用

```python
# 伪代码示例
def generate_plantuml_diagram(code, format="png", save_to=None):
    args = {"code": code, "format": format}
    if save_to:
        args["save_path"] = save_to
    
    response = mcp_client.call_tool("plantuml-generate", args)
    return response
```

### 错误处理最佳实践

```python
def safe_generate_diagram(code):
    try:
        # 1. 检查服务器健康状态
        health = mcp_client.call_tool("plantuml-health", {})
        if not health.get("healthy"):
            return {"error": "PlantUML server is not available"}
        
        # 2. 生成图表
        result = mcp_client.call_tool("plantuml-generate", {
            "code": code,
            "format": "png"
        })
        
        return result
        
    except McpError as e:
        if "must have required property 'code'" in str(e):
            return {"error": "PlantUML code is required"}
        elif "must NOT have fewer than 1 characters" in str(e):
            return {"error": "PlantUML code cannot be empty"}
        else:
            return {"error": f"Validation error: {e}"}
```

## 参数参考

### plantuml-generate

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `code` | string | ✅ | - | PlantUML 源代码，必须包含 @startuml/@enduml |
| `format` | string | ❌ | "png" | 输出格式: png, svg, pdf, eps |
| `save_path` | string | ❌ | - | 本地保存路径，提供时不返回 Base64 |

### plantuml-formats

无参数，返回支持的格式列表。

### plantuml-health

无参数，返回服务器状态。

## 常用 PlantUML 代码模板

### 序列图
```
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml
```

### 类图
```
@startuml
class User {
  +String name
  +login()
}
class Admin {
  +manageUsers()
}
User <|-- Admin
@enduml
```

### 用例图
```
@startuml
User -> (Login)
Admin -> (Manage Users)
(Login) <.. (Manage Users) : extends
@enduml
```

## 故障排除检查清单

1. ✅ 确保 `code` 参数存在且不为空
2. ✅ 验证 PlantUML 代码包含 @startuml/@enduml 标签
3. ✅ 检查 `format` 值是否为支持的格式之一
4. ✅ 确保没有传递额外的未知参数
5. ✅ 首次使用时调用 `plantuml-health` 检查服务器状态
6. ✅ 检查 PlantUML 服务器是否在 http://localhost:9090 运行

## 技术支持

如果问题仍然存在，请提供：
1. 完整的 MCP 调用请求 JSON
2. 收到的错误消息
3. PlantUML 代码内容
4. 客户端环境信息（Claude Desktop、Cline 等）
