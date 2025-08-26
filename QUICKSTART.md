# 🚀 快速开始指南

本指南将帮助您在 5 分钟内设置完整的 PlantUML + MCP 集成环境，让 AI 代理能够生成 UML 图表。

## 🎯 什么是 PlantUML + MCP 集成？

本项目包含两个核心组件：
- **PlantUML 服务器** (Java/Quarkus) - 提供图表生成 HTTP API
- **MCP 服务器** (Node.js/TypeScript) - 为 AI 代理提供标准化接口

```
AI 代理 (Claude/Cline) ← MCP 协议 → MCP 服务器 ← HTTP API → PlantUML ## 📚 下一步

现在您已经有了一个工作的 PlantUML + MCP 环境！接下来可以：

- 🔍 探索 [完整 API 文档](README.md#-api-文档)
- 🤖 了解 [MCP 工具详情](mcp/README.md)
- 🐳 查看 [Docker 标签策略](docs/docker-tagging-strategy.md)
- 🏗️ 学习 [项目架构](README.md#-项目架构)
- 🎯 查看 [使用场景](README.md#-使用场景)

## 🛠️ 部署脚本完整参考

### Linux/macOS (`deploy.sh`)
```bash
./deploy.sh start [dev|prod]    # 启动服务
./deploy.sh stop [dev|prod]     # 停止服务  
./deploy.sh restart [dev|prod]  # 重启服务
./deploy.sh build [dev|prod]    # 构建镜像
./deploy.sh logs [dev|prod]     # 查看日志
./deploy.sh status [dev|prod]   # 服务状态
./deploy.sh clean [dev|prod]    # 清理环境
./deploy.sh help               # 帮助信息
```

### Windows PowerShell (`deploy.ps1`)
```powershell
.\deploy.ps1 start [dev|prod]   # 启动服务
.\deploy.ps1 stop [dev|prod]    # 停止服务
.\deploy.ps1 restart [dev|prod] # 重启服务
.\deploy.ps1 build [dev|prod]   # 构建镜像
.\deploy.ps1 logs [dev|prod]    # 查看日志
.\deploy.ps1 status [dev|prod]  # 服务状态
.\deploy.ps1 clean [dev|prod]   # 清理环境
.\deploy.ps1 help              # 帮助信息
```

### 环境说明
- **dev**: 开发环境，支持热重载，详细日志输出
- **prod**: 生产环境，优化资源配置，限制内存和 CPU 使用

### 示例用法
```bash
# 快速启动开发环境
./deploy.sh start dev

# 查看实时日志
./deploy.sh logs dev

# 停止并清理
./deploy.sh clean dev

# 生产环境部署
./deploy.sh start prod
```

## 🆘 需要帮助？

- 🐛 创建 [GitHub Issue](https://github.com/lihongjie0209/plantuml-server/issues)
- 📖 查看 [完整文档](README.md)
- 🔧 参考 [故障排除指南](#-故障排除)

---

🎯 **恭喜！** 您现在拥有了一个功能完整的 AI 驱动的 UML 图表生成环境！## ⚡ 方法一：Docker Compose (推荐，最简单)

### 1. 克隆并启动

```bash
# 克隆项目
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 🚀 使用部署脚本 (跨平台)
# Linux/macOS
./deploy.sh start dev      # 开发环境
./deploy.sh start prod     # 生产环境

# Windows
.\deploy.ps1 start dev     # 开发环境  
.\deploy.ps1 start prod    # 生产环境

# 或者直接使用 Docker Compose
docker-compose up -d       # 基础启动
```

### 2. 验证服务状态

```bash
# 使用部署脚本检查状态
./deploy.sh status         # Linux/macOS
.\deploy.ps1 status        # Windows

# 或手动检查
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
# 🔧 使用部署脚本管理
./deploy.sh logs           # 查看所有服务日志 (Linux/macOS)
./deploy.sh restart        # 重启服务
./deploy.sh clean          # 清理并重置

.\deploy.ps1 logs          # 查看所有服务日志 (Windows)
.\deploy.ps1 restart       # 重启服务  
.\deploy.ps1 clean         # 清理并重置

# 或手动管理
docker-compose logs plantuml-server
docker-compose logs mcp-server
docker-compose down && docker-compose up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs
```

### 🔧 调试和维护

```bash
# 🚀 部署脚本命令
./deploy.sh help           # 查看所有可用命令 (Linux/macOS)
.\deploy.ps1 help          # 查看所有可用命令 (Windows)

# 实时日志监控
./deploy.sh logs           # 持续监控所有服务日志
.\deploy.ps1 logs          # Windows 版本

# 构建自定义镜像
./deploy.sh build dev      # 构建开发版本
./deploy.sh build prod     # 构建生产版本

# 启用 MCP 详细日志 (手动启动)
DEBUG=* node mcp/dist/index.js --server-url http://localhost:9090

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
