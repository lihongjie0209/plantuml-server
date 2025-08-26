# Docker Hub 推送指南

本文档说明如何将 PlantUML 服务器镜像推送到 Docker Hub。

## 📋 前提条件

1. **Docker Hub 账户**: 确保您有 Docker Hub 账户
2. **本地镜像**: 确保已构建本地镜像
3. **Docker 登录**: 需要登录到 Docker Hub

## 🚀 推送步骤

### 步骤 1: 登录 Docker Hub

```bash
docker login
```

输入您的 Docker Hub 用户名和密码。

### 步骤 2: 验证本地镜像

```bash
docker images plantuml-server
```

应该看到类似输出：
```
REPOSITORY        TAG       IMAGE ID       CREATED        SIZE
plantuml-server   latest    ef3cc8b9b454   2 hours ago    292MB
```

### 步骤 3: 标记镜像

将本地镜像标记为 Docker Hub 格式：

```bash
# 替换 YOUR_USERNAME 为您的 Docker Hub 用户名
docker tag plantuml-server:latest YOUR_USERNAME/plantuml-server:latest
docker tag plantuml-server:latest YOUR_USERNAME/plantuml-server:1.0.0
```

### 步骤 4: 推送镜像

```bash
# 推送 latest 标签
docker push YOUR_USERNAME/plantuml-server:latest

# 推送版本标签
docker push YOUR_USERNAME/plantuml-server:1.0.0
```

### 步骤 5: 验证推送

访问 https://hub.docker.com/r/YOUR_USERNAME/plantuml-server 验证镜像已成功推送。

## 🔧 自动化推送

### 使用脚本推送

#### Windows 用户
```bash
# 使用简单脚本
push-docker.bat

# 使用高级脚本（支持多标签）
push-docker-advanced.bat
```

#### Linux/macOS 用户
```bash
chmod +x push-docker.sh
./push-docker.sh
```

### 使用 GitHub Actions

1. 在 GitHub 仓库设置中添加以下 Secrets：
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub 密码或访问令牌

2. 推送代码到 GitHub，GitHub Actions 将自动构建和推送镜像

## 📦 镜像标签策略

我们使用以下标签策略：

- `latest`: 最新稳定版本
- `1.0.0`: 具体版本号
- `1.0`: 主要.次要版本
- `1`: 主要版本

## 🌍 多架构支持

GitHub Actions 工作流支持构建多架构镜像：
- `linux/amd64`: x86_64 架构
- `linux/arm64`: ARM64 架构（Apple M1/M2）

## 🔍 使用推送的镜像

其他用户可以通过以下方式使用您的镜像：

```bash
# 拉取镜像
docker pull YOUR_USERNAME/plantuml-server:latest

# 运行容器
docker run -p 9090:9090 YOUR_USERNAME/plantuml-server:latest

# 使用 Docker Compose
version: '3.8'
services:
  plantuml:
    image: YOUR_USERNAME/plantuml-server:latest
    ports:
      - "9090:9090"
```

## 🛡️ 安全最佳实践

1. **使用访问令牌**: 建议使用 Docker Hub 访问令牌而不是密码
2. **定期更新**: 定期更新基础镜像以获取安全补丁
3. **镜像扫描**: 使用 Docker Hub 的漏洞扫描功能
4. **最小权限**: 确保 Docker Hub 账户具有最小必要权限

## 📊 镜像信息

- **基础镜像**: OpenJDK 11 JRE Slim
- **应用框架**: Quarkus 3.3.3
- **镜像大小**: ~292MB
- **架构支持**: AMD64, ARM64
- **安全**: 非 root 用户运行

## 🆘 故障排除

### 常见问题

1. **推送失败**:
   ```
   unauthorized: authentication required
   ```
   **解决方案**: 确保已正确登录 `docker login`

2. **镜像不存在**:
   ```
   Error: No such image: plantuml-server:latest
   ```
   **解决方案**: 先构建镜像 `docker build -t plantuml-server:latest .`

3. **网络超时**:
   ```
   net/http: request canceled
   ```
   **解决方案**: 检查网络连接，可能需要使用代理

### 获取帮助

如果遇到问题，可以：
1. 查看 Docker 官方文档
2. 检查 GitHub Issues
3. 联系维护者

---

📝 **注意**: 请将 `YOUR_USERNAME` 替换为您的实际 Docker Hub 用户名。
