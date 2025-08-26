# PlantUML MCP Server

一个为 AI 代理提供 PlantUML 图表生成功能的 Model Context Protocol (MCP) 服务器。

## 功能特性

- 🎨 **图表生成**: 支持多种格式（PNG、SVG、PDF、EPS）
- 💾 **文件保存**: 自动保存生成的图表到本地文件系统 (v0.3.0 新增)
- 📋 **格式查询**: 获取支持的图表格式列表
- 🔍 **健康检查**: 监控 PlantUML 服务器状态
- 🔧 **灵活配置**: 支持命令行参数和环境变量配置
- 🛡️ **错误处理**: 标准化的 MCP 错误响应和详细错误信息
- 📖 **工作流指导**: 内置的工具使用指导和最佳实践提示
- ⚡ **性能优化**: 移除验证工具以减少服务器资源占用 (v0.3.0)**图表生成**: 支持多种格式（PNG、SVG、PDF、EPS）
- ✅ **代码验证**: 验证 PlantUML 代码语法正确性，支持 AJV 严格参数验证
- 📋 **格式查询**: 获取支持的图表格式列表
- 🔍 **健康检查**: 监控 PlantUML 服务器状态
- 🔧 **灵活配置**: 支持命令行参数和环境变量配置
- 🛡️ **错误处理**: 标准化的 MCP 错误响应和详细错误信息
- 📖 **工作流指导**: 内置的工具使用指导和最佳实践提示
- ⚡ **性能优化**: 高效的请求处理和缓存机制MCP Server

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

### 1. plantuml-generate

生成 PlantUML 图表并返回 Base64 编码的图片，可选择自动保存到本地文件。

**参数:**
- `code` (string, 必需): PlantUML 代码，需要包含 @startuml/@enduml 标签
- `format` (string, 可选): 输出格式 (png, svg, pdf, eps)，默认为 png
- `save_path` (string, 可选): 本地文件保存路径，如果提供则自动保存生成的图表

**示例:**
```typescript
// 仅生成，不保存
{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
  "format": "png"
}

// 生成并保存到文件
{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
  "format": "svg",
  "save_path": "/path/to/save/diagram.svg"
}
```

### 2. plantuml-formats

获取 PlantUML 服务器支持的输出格式列表。

**参数:** 无

### 3. plantuml-health

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
- v0.2.0: 增强版本，新增 AJV 参数验证、改进错误处理、添加工作流指导和性能优化
- v0.3.0: 优化版本，移除 plantuml-validate 工具以减少资源占用，新增 save_path 参数支持自动文件保存
- v0.3.1: 改进版本，优化工具描述和参数说明，提高 AI 客户端兼容性
- v0.3.2: 兼容性版本，同时支持 save_path 和 savePath 两种命名约定，提升用户体验

## 升级说明

### 从 v0.3.1 升级到 v0.3.2

**新增特性:**
- ✅ **命名约定兼容**: 同时支持 `save_path` (snake_case) 和 `savePath` (camelCase) 两种参数命名
- 🔧 **向后兼容**: 现有代码无需修改，新代码可使用更符合习惯的命名方式

**使用示例:**
```json
// 两种写法都支持
{"code": "...", "save_path": "./diagram.png"}  // snake_case
{"code": "...", "savePath": "./diagram.png"}   // camelCase
```

### 从 v0.2.0 升级到 v0.3.0

**重要变更:**
- ❌ **移除工具**: `plantuml-validate` 工具已移除，以减少服务器资源占用
- ✅ **新增功能**: `plantuml-generate` 工具新增 `save_path` 参数，支持自动文件保存
- 📖 **建议**: 不再需要预先验证代码，直接使用 `plantuml-generate` 即可，错误信息会在生成失败时返回

**迁移指南:**
```typescript
// v0.2.0 工作流（不再推荐）
// 1. 先验证
await mcpClient.callTool('plantuml-validate', { code: diagramCode });
// 2. 再生成
await mcpClient.callTool('plantuml-generate', { code: diagramCode, format: 'png' });

// v0.3.0 工作流（推荐）
// 直接生成，带文件保存
await mcpClient.callTool('plantuml-generate', { 
  code: diagramCode, 
  format: 'png',
  save_path: './output/diagram.png'  // 可选
});
```
