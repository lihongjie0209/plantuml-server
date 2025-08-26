# 快速设置指南

本指南帮助您快速设置和使用 PlantUML Server。

## 🚀 5分钟快速开始

### 选项 1: 使用 Docker（推荐）

```bash
# 一键运行
docker run -d -p 9090:9090 --name plantuml-server lihongjie0209/plantuml-server:latest

# 访问应用
open http://localhost:9090
```

### 选项 2: 本地开发

```bash
# 克隆项目
git clone https://github.com/lihongjie0209/plantuml-server.git
cd plantuml-server

# 启动开发模式
./mvnw compile quarkus:dev
```

## 📝 快速测试

### 使用 Web 界面
1. 打开 http://localhost:9090
2. 在文本框中输入 PlantUML 代码
3. 选择输出格式
4. 点击"生成图片"

### 使用 curl 测试

```bash
# 测试健康检查
curl http://localhost:9090/api/plantuml/health

# 生成简单图表
curl -X POST http://localhost:9090/api/plantuml/generate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    "format": "png"
  }'
```

## 🔧 常用配置

### 修改端口
```bash
# 使用环境变量
docker run -p 8080:8080 -e QUARKUS_HTTP_PORT=8080 lihongjie0209/plantuml-server:latest

# 或修改 application.properties
quarkus.http.port=8080
```

### 增加内存
```bash
docker run -p 9090:9090 -e JAVA_OPTS="-Xmx1g -Xms512m" lihongjie0209/plantuml-server:latest
```

## 🐛 故障排除

### 端口被占用
```bash
# 检查端口
lsof -i :9090  # Linux/macOS
netstat -ano | findstr :9090  # Windows

# 使用其他端口
docker run -p 9091:9090 lihongjie0209/plantuml-server:latest
```

### 容器无法启动
```bash
# 查看日志
docker logs plantuml-server

# 重新拉取镜像
docker pull lihongjie0209/plantuml-server:latest
```

## 📚 更多资源

- [完整文档](README.md)
- [API 文档](README.md#-api-文档)
- [Docker 部署指南](DOCKER_HUB_GUIDE.md)
- [GitHub 仓库](https://github.com/lihongjie0209/plantuml-server)

---

💡 **提示**: 如果遇到问题，请查看 [GitHub Issues](https://github.com/lihongjie0209/plantuml-server/issues)
