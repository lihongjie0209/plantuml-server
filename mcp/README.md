# PlantUML MCP Server

一个为 AI 代理提供 PlantUML 图表生成功能的 Model Context Protocol (MCP) 服务器。

## 功能特性

- 🎨 **图表生成**: 支持多种格式（PNG、SVG、PDF、EPS）
- ✅ **代码验证**: 验证 PlantUML 代码语法正确性
-  **格式查询**: 获取支持的图表格式列表
- � **健康检查**: 监控 PlantUML 服务器状态
- 🔧 **灵活配置**: 支持命令行参数和环境变量配置

## 安装

### NPM 全局安装

```bash
npm install -g @plantuml-mcp/plantuml-mcp
```

### 从源码安装

```bash
git clone <repository-url>
cd plantuml-server/mcp
npm install
npm run build
npm link
```

## 使用方法

### 基本使用

```bash
# 使用默认配置（连接到 http://localhost:9090）
plantuml-mcp-server

# 指定 PlantUML 服务器地址
plantuml-mcp-server --server-url http://your-plantuml-server:8080

# 使用环境变量
PLANTUML_SERVER_URL=http://remote-server:9090 plantuml-mcp-server
```

### 命令行选项

```bash
plantuml-mcp-server [options]

选项:
  -s, --server-url <url>    PlantUML 服务器 URL (默认: http://localhost:9090)
  -h, --help               显示帮助信息
  -v, --version            显示版本信息

环境变量:
  PLANTUML_SERVER_URL      PlantUML 服务器 URL (会被 --server-url 选项覆盖)
```

### 在 AI 客户端中配置

#### Claude Desktop 配置

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "plantuml": {
      "command": "plantuml-mcp-server",
      "args": ["--server-url", "http://localhost:9090"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  }
}
```

#### Cline 配置

在 Cline 的 MCP 设置中：

```json
{
  "command": "plantuml-mcp-server",
  "args": ["--server-url", "http://your-server:9090"]
}
```

## MCP 工具

### 1. generate_plantuml_diagram

生成 PlantUML 图表并返回 Base64 编码的图片。

**参数:**
- `code` (string): PlantUML 代码
- `format` (string, 可选): 输出格式 (png, svg, pdf, eps)，默认为 png

**示例:**
```typescript
{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
  "format": "png"
}
```

### 2. validate_plantuml_code

验证 PlantUML 代码的语法正确性。

**参数:**
- `code` (string): 要验证的 PlantUML 代码

**示例:**
```typescript
{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
}
```

### 3. get_supported_formats

获取 PlantUML 服务器支持的输出格式列表。

**参数:** 无

### 4. plantuml_health_check

检查 PlantUML 服务器的健康状态。

**参数:** 无

## 开发

### 环境要求

- Node.js 18+
- TypeScript 5+
- 运行中的 PlantUML 服务器

### 开发命令

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 运行测试
npm test

# 启动开发模式
npm run dev

# 检查代码风格
npm run lint
```

### 项目结构

```
mcp/
├── src/
│   ├── index.ts      # MCP 服务器主入口
│   ├── client.ts     # PlantUML HTTP 客户端
│   └── types.ts      # 类型定义和数据验证
├── dist/             # 编译输出目录
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
└── README.md         # 项目文档
```

## 配置示例

### 本地开发

```bash
# 启动 PlantUML 服务器（如果尚未运行）
cd .. && ./mvnw compile quarkus:dev

# 启动 MCP 服务器
plantuml-mcp-server
```

### 生产环境

```bash
# 使用远程 PlantUML 服务器
plantuml-mcp-server --server-url https://plantuml.company.com

# 或使用环境变量
export PLANTUML_SERVER_URL=https://plantuml.company.com
plantuml-mcp-server
```

## 故障排除

### 常见问题

1. **连接错误**: 确保 PlantUML 服务器正在运行并且可访问
2. **图表生成失败**: 检查 PlantUML 代码语法是否正确
3. **命令未找到**: 确保已正确安装 npm 包

### 调试模式

MCP 服务器会在 stderr 输出启动信息，不会干扰 MCP 协议通信：

```bash
🚀 PlantUML MCP Server v0.1.0 starting...
📡 PlantUML Server URL: http://localhost:9090
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](../LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 版本历史

- v0.1.0: 初始版本，支持基本的 PlantUML 图表生成功能
