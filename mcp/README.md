# PlantUML MCP Server

这是一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的 PlantUML 服务器，允许 AI 代理通过标准化接口使用 PlantUML 图表生成功能。

## 功能特性

- 🎨 **图表生成**: 支持 PNG、SVG、PDF、EPS 格式
- ✅ **代码验证**: 验证 PlantUML 语法正确性
- 🔍 **健康检查**: 监控服务器状态
- 📋 **格式查询**: 获取支持的输出格式列表
- 🔧 **标准化接口**: 遵循 MCP 协议规范

## 安装和使用

### 前提条件

- Node.js 18+
- PlantUML 服务器运行在 `http://localhost:9090`

### 安装依赖

```bash
cd mcp
npm install
```

### 构建项目

```bash
npm run build
```

### 启动服务器

```bash
npm start
```

### 开发模式

```bash
npm run dev
```

## 可用工具

### 1. generate_plantuml_diagram

生成 PlantUML 图表并返回 Base64 编码的图片。

**参数:**
- `code` (string, 必需): PlantUML 图表代码
- `format` (string, 可选): 输出格式 (png, svg, pdf, eps)，默认为 png

**示例:**
```json
{
  "code": "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
  "format": "png"
}
```

### 2. validate_plantuml_code

验证 PlantUML 代码语法。

**参数:**
- `code` (string, 必需): 要验证的 PlantUML 代码

**示例:**
```json
{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
}
```

### 3. get_supported_formats

获取支持的输出格式列表。

**参数:** 无

### 4. plantuml_health_check

检查 PlantUML 服务器健康状态。

**参数:** 无

## 环境配置

### 环境变量

- `PLANTUML_SERVER_URL`: PlantUML 服务器 URL（默认: `http://localhost:9090`）

### 示例配置

```bash
export PLANTUML_SERVER_URL=http://your-plantuml-server:9090
```

## MCP 客户端配置

### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "plantuml": {
      "command": "node",
      "args": ["/path/to/plantuml-server/mcp/dist/index.js"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  }
}
```

### Continue.dev 配置

在 Continue 配置中添加：

```json
{
  "mcpServers": [
    {
      "name": "plantuml",
      "command": ["node", "/path/to/plantuml-server/mcp/dist/index.js"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  ]
}
```

## 使用示例

### 生成简单的序列图

```typescript
// AI 代理可以调用
const result = await callTool('generate_plantuml_diagram', {
  code: `
    @startuml
    Alice -> Bob: Authentication Request
    Bob --> Alice: Authentication Response
    @enduml
  `,
  format: 'png'
});
```

### 生成类图

```typescript
const result = await callTool('generate_plantuml_diagram', {
  code: `
    @startuml
    class User {
      +String name
      +String email
      +login()
      +logout()
    }
    
    class Admin {
      +manageUsers()
    }
    
    User <|-- Admin
    @enduml
  `,
  format: 'svg'
});
```

## 错误处理

服务器会返回详细的错误信息，包括：

- PlantUML 语法错误
- 网络连接问题
- 服务器不可用
- 无效参数

## 开发

### 项目结构

```
mcp/
├── src/
│   ├── index.ts      # MCP 服务器主文件
│   ├── client.ts     # PlantUML 客户端
│   └── types.ts      # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

### 测试

```bash
# 启动 PlantUML 服务器
cd ..
./mvnw compile quarkus:dev

# 在另一个终端启动 MCP 服务器
cd mcp
npm run build
npm start
```

## 故障排除

### 常见问题

1. **连接被拒绝**: 确保 PlantUML 服务器在指定端口运行
2. **权限错误**: 检查文件权限和 Node.js 执行权限
3. **格式不支持**: 使用 `get_supported_formats` 工具查看可用格式

### 调试

启用详细日志：

```bash
DEBUG=mcp:* npm start
```

## 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。
