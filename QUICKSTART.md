# 🚀 快速开始指南

本指南将帮助您在 5 分钟内设置完整的 PlantUML + MCP 集成环境，让 AI 代理能够生成 UML 图表。

## 🎯 什么是 PlantUML + MCP 集成？

本项目包含两个核心组件：
- **PlantUML 服务器** (Java/Quarkus) - 提供图表生成 HTTP API
- **MCP 服务器** (Node.js/TypeScript) - 为 AI 代理提供标准化接口

```
AI 代理 (Claude/Cline) ← MCP 协议 → MCP 服务器 ← HTTP API → PlantUML 服务器 → 图表输出
```

## ⚡ 方法一：Docker Compose (推荐，最简单)

### 1. 克隆并启动

```bash
# 克隆项目
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 一键启动完整环境
docker-compose up -d
```

### 2. 验证服务状态

```bash
# 检查 PlantUML 服务器 (应返回 healthy)
curl http://localhost:9090/api/plantuml/health

# 检查服务状态
docker-compose ps
```

### 3. 配置 AI 客户端

#### 为 Claude Desktop 配置
编辑或创建 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "plantuml": {
      "command": "plantuml-mcp-server",
      "args": ["--server-url", "http://localhost:9090"]
    }
  }
}
```

#### 为 Cline (VS Code) 配置
在 Cline 扩展设置中添加：

```json
{
  "mcp": {
    "plantuml": {
      "command": "docker",
      "args": ["exec", "plantuml-server-mcp-server-1", "node", "dist/index.js"]
    }
  }
}
```

## 🛠️ 方法二：本地开发环境

### 1. 启动 PlantUML 服务器

```bash
# 克隆项目
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 启动开发模式 (自动热重载)
./mvnw compile quarkus:dev
```

✅ 服务器运行在 http://localhost:9090

### 2. 设置 MCP 服务器

打开新终端窗口：

```bash
# 进入 MCP 目录
cd plantuml-server/mcp

# 安装依赖并构建
npm install && npm run build

# 启动 MCP 服务器
npm start
```

✅ MCP 服务器已连接到 PlantUML 服务器

### 3. 配置 AI 客户端

#### Claude Desktop 配置
```json
{
  "mcpServers": {
    "plantuml": {
      "command": "node",
      "args": ["/absolute/path/to/plantuml-server/mcp/dist/index.js"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  }
}
```

#### Cline 配置
```json
{
  "mcp": {
    "plantuml": {
      "command": "node",
      "args": ["/absolute/path/to/plantuml-server/mcp/dist/index.js", "--server-url", "http://localhost:9090"]
    }
  }
}
```

## 🧪 测试集成

### 1. 测试 PlantUML 服务器

```bash
# 基础健康检查
curl http://localhost:9090/api/plantuml/health

# 生成测试图表
curl -X POST http://localhost:9090/api/plantuml/generate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    "format": "png"
  }'
```

### 2. 测试 MCP 服务器

```bash
cd mcp
npm test
```

### 3. 测试 AI 集成

在您的 AI 客户端中尝试以下对话：

```
用户: "请帮我生成一个用户登录的时序图"
AI: 我来为您生成一个用户登录的时序图...

[AI 自动调用 MCP 工具生成图表]
```

期望结果：AI 能够成功生成并返回时序图。

## 🎉 成功验证清单

当一切设置正确时，您应该看到：

- ✅ http://localhost:9090 显示 PlantUML Web 界面
- ✅ `curl http://localhost:9090/api/plantuml/health` 返回 `{"healthy": true}`
- ✅ `npm test` 在 mcp 目录下通过所有测试
- ✅ AI 客户端能够列出 plantuml 相关工具：
  - plantuml-generate
  - plantuml-validate
  - plantuml-formats
  - plantuml-health
- ✅ AI 能够响应图表生成请求并返回图片

## � 故障排除

### 常见问题

#### 1. 连接被拒绝
```bash
# 检查 PlantUML 服务器状态
curl http://localhost:9090/api/plantuml/health

# 检查端口占用
netstat -tlnp | grep 9090  # Linux
netstat -ano | findstr :9090  # Windows
```

#### 2. MCP 服务器找不到
```bash
# 使用绝对路径
which node
/usr/bin/node /absolute/path/to/plantuml-server/mcp/dist/index.js

# 检查文件权限
chmod +x mcp/dist/index.js
```

#### 3. AI 客户端无法连接
```bash
# 测试 MCP 协议
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  node mcp/dist/index.js --server-url http://localhost:9090
```

#### 4. Docker 问题
```bash
# 查看容器日志
docker-compose logs plantuml-server
docker-compose logs mcp-server

# 重启服务
docker-compose down && docker-compose up -d
```

### 调试模式

```bash
# 启用 MCP 详细日志
DEBUG=* npm start

# 查看实时日志
docker-compose logs -f
```

## 🚀 高级配置

### 自定义端口
```bash
# 修改 PlantUML 服务器端口
export QUARKUS_HTTP_PORT=8080
./mvnw compile quarkus:dev

# 相应地更新 MCP 服务器
npm start -- --server-url http://localhost:8080
```

### 生产环境部署
```bash
# 构建生产版本
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar

# 构建 MCP 生产版本
cd mcp
npm run build
npm start
```

### 性能优化
```bash
# 增加 Java 堆内存
export JAVA_OPTS="-Xmx1g -Xms512m"

# 启用 G1GC
export JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
```

## 📚 下一步

现在您已经有了一个工作的 PlantUML + MCP 环境！接下来可以：

- 🔍 探索 [完整 API 文档](README.md#-api-文档)
- 🤖 了解 [MCP 工具详情](mcp/README.md)
- 🐳 查看 [Docker 标签策略](docs/docker-tagging-strategy.md)
- 🏗️ 学习 [项目架构](README.md#-项目架构)
- 🎯 查看 [使用场景](README.md#-使用场景)

## 🆘 需要帮助？

- � 创建 [GitHub Issue](https://github.com/lihongjie0209/plantuml-server/issues)
- 📖 查看 [完整文档](README.md)
- 🔧 参考 [故障排除指南](#-故障排除)

---

🎯 **恭喜！** 您现在拥有了一个功能完整的 AI 驱动的 UML 图表生成环境！
