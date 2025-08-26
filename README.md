# PlantUML Server

![Build Status](https://github.com/lihongjie0209/plantuml-server/workflows/Build%20and%20Push%20to%20Docker%20Hub/badge.svg)
![Docker Image Size](https://img.shields.io/docker/image-size/lihongjie0209/plantuml-server/latest)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-11+-orange.svg)
![Quarkus](https://img.shields.io/badge/Quarkus-3.3.3-blue.svg)
![GitHub release](https://img.shields.io/github/v/release/lihongjie0209/plantuml-server)

一个基于 Quarkus 的高性能 PlantUML Web 服务器，提供 PlantUML 代码转换为图片的 RESTful API。支持多种输出格式，具有现代化的 Web 界面和完整的 Docker 化部署方案。

> **🚀 [快速开始](QUICKSTART.md)** | **📦 [Docker Hub](https://hub.docker.com/r/lihongjie0209/plantuml-server)** | **🛠️ [开发文档](#-开发指南)**

## ✨ 特性亮点

- 🚀 **高性能**: 基于 Quarkus 框架，启动时间 < 1秒
- 🎨 **多格式支持**: PNG, SVG, PDF, EPS 等多种输出格式
- 🌐 **现代化界面**: 响应式 Web 界面，支持实时预览
- 📦 **容器化**: 完整的 Docker 支持，镜像大小仅 292MB
- ⚡ **热重载**: 开发模式支持代码热重载
- 🔒 **安全**: 非 root 用户运行，内置健康检查
- 🌍 **跨平台**: 支持 Linux (amd64/arm64) 多架构部署

## 🚀 快速开始

### 🐳 使用 Docker (推荐)

```bash
# 拉取并运行
docker run -p 9090:9090 lihongjie0209/plantuml-server:latest

# 访问应用
open http://localhost:9090
```

### 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 运行开发模式
./mvnw compile quarkus:dev
```

## 🔌 API 文档

### 生成图片 (Base64)
```http
POST /api/plantuml/generate
Content-Type: application/json

{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
  "format": "png"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "Image generated successfully",
  "format": "png",
  "base64Data": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### 下载图片
```http
POST /api/plantuml/image/{format}
Content-Type: application/json

{
  "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
}
```

支持的格式: `png`, `svg`, `pdf`, `eps`

### 健康检查
```http
GET /api/plantuml/health
```

### 支持的格式列表
```http
GET /api/plantuml/formats
```

## 📝 使用示例

### curl 示例
```bash
# 生成 PNG 图片
curl -X POST http://localhost:9090/api/plantuml/generate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    "format": "png"
  }'

# 下载 SVG 文件
curl -X POST http://localhost:9090/api/plantuml/image/svg \
  -H "Content-Type: application/json" \
  -d '{
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml"
  }' \
  -o diagram.svg
```

### JavaScript 示例
```javascript
async function generateDiagram() {
  const response = await fetch('/api/plantuml/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: '@startuml\nAlice -> Bob: Hello\n@enduml',
      format: 'png'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    const img = document.createElement('img');
    img.src = `data:image/png;base64,${result.base64Data}`;
    document.body.appendChild(img);
  }
}
```

## 🐳 Docker 部署

### 使用 Docker Compose
```yaml
version: '3.8'
services:
  plantuml-server:
    image: lihongjie0209/plantuml-server:latest
    ports:
      - "9090:9090"
    environment:
      - JAVA_OPTS=-Xmx512m -Xms256m
    restart: unless-stopped
```

### 构建自定义镜像
```bash
# 克隆仓库
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 构建镜像
docker build -t my-plantuml-server .

# 运行容器
docker run -p 9090:9090 my-plantuml-server
```

## 🛠️ 本地开发

### 前提条件
- JDK 11+
- Maven 3.8+

### 开发模式
```bash
./mvnw compile quarkus:dev
```

### 运行测试
```bash
./mvnw test
```

### 生产构建
```bash
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar
```

## ⚙️ 配置

### 环境变量
- `QUARKUS_HTTP_PORT`: 服务端口 (默认: 9090)
- `QUARKUS_HTTP_HOST`: 绑定地址 (默认: 0.0.0.0)
- `JAVA_OPTS`: JVM 参数

### application.properties
```properties
quarkus.http.port=9090
quarkus.http.cors=true
quarkus.http.limits.max-body-size=50M
```

## 🏗️ 项目结构

```
├── src/main/java/com/example/plantuml/
│   ├── service/PlantUMLService.java      # 核心服务
│   ├── resource/PlantUMLResource.java    # REST 控制器
│   ├── dto/                              # 数据传输对象
│   └── PlantUMLApplication.java          # 应用主类
├── src/main/resources/
│   ├── application.properties            # 配置文件
│   └── META-INF/resources/index.html     # Web 界面
├── Dockerfile                            # Docker 配置
├── docker-compose.yml                    # 编排配置
├── .github/workflows/                    # CI/CD 配置
└── pom.xml                              # Maven 配置
```

## 🛠️ 技术栈

- **框架**: [Quarkus](https://quarkus.io/) 3.3.3
- **语言**: Java 11+
- **图表引擎**: [PlantUML](https://plantuml.com/)
- **REST**: RESTEasy Reactive
- **JSON**: Jackson
- **构建**: Maven
- **容器**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **MCP 服务器**: TypeScript + Node.js

## 🤖 MCP 服务器 (Model Context Protocol)

项目包含一个完整的 MCP 服务器，允许 AI 代理通过标准化接口使用 PlantUML 功能：

```bash
# 快速设置 MCP 服务器
cd mcp
npm install && npm run build

# 启动 MCP 服务器
npm start

# 测试连接
npm test
```

### MCP 功能特性

- 🎨 **图表生成**: 支持 PNG、SVG、PDF、EPS 格式
- ✅ **代码验证**: 验证 PlantUML 语法正确性
- 🔍 **健康检查**: 监控服务器状态
- 📋 **格式查询**: 获取支持的输出格式列表

### 客户端配置示例

```json
{
  "mcpServers": {
    "plantuml": {
      "command": "node",
      "args": ["./mcp/dist/index.js"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  }
}
```

详细文档：[MCP 服务器文档](mcp/README.md)

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 启动时间 | < 1秒 |
| 内存占用 | ~256MB |
| 响应时间 | < 100ms |
| 镜像大小 | 292MB |
| 架构支持 | amd64, arm64 |

## 🔧 部署到生产环境

### Kubernetes 部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: plantuml-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: plantuml-server
  template:
    metadata:
      labels:
        app: plantuml-server
    spec:
      containers:
      - name: plantuml-server
        image: lihongjie0209/plantuml-server:latest
        ports:
        - containerPort: 9090
        livenessProbe:
          httpGet:
            path: /api/plantuml/health
            port: 9090
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: plantuml-server-service
spec:
  selector:
    app: plantuml-server
  ports:
  - port: 80
    targetPort: 9090
  type: LoadBalancer
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [PlantUML](https://plantuml.com/) - 强大的图表生成引擎
- [Quarkus](https://quarkus.io/) - 超音速亚原子 Java 框架
- [OpenJDK](https://openjdk.java.net/) - 开源 Java 平台

## 📈 项目状态

![GitHub stars](https://img.shields.io/github/stars/lihongjie0209/plantuml-server)
![GitHub forks](https://img.shields.io/github/forks/lihongjie0209/plantuml-server)
![GitHub issues](https://img.shields.io/github/issues/lihongjie0209/plantuml-server)
![GitHub last commit](https://img.shields.io/github/last-commit/lihongjie0209/plantuml-server)

---

⭐ 如果这个项目对您有帮助，请给个 Star！

🔗 **项目链接**: https://github.com/lihongjie0209/plantuml-server
