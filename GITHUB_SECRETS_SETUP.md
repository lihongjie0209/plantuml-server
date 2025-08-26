# GitHub Secrets 配置指南

为了让 GitHub Actions 能够自动构建并推送 Docker 镜像到 Docker Hub，需要配置以下 GitHub Secrets。

## 🔐 需要配置的 Secrets

### 1. DOCKER_USERNAME
- **值**: 您的 Docker Hub 用户名
- **示例**: `lihongjie0209`

### 2. DOCKER_TOKEN
- **值**: 您的 Docker Hub 访问令牌（不是密码）
- **获取方式**: 
  1. 登录 [Docker Hub](https://hub.docker.com/)
  2. 进入 **Account Settings** → **Security** → **Access Tokens**
  3. 点击 **New Access Token**
  4. 输入令牌名称（如：`github-actions`）
  5. 选择权限：**Read, Write, Delete**
  6. 复制生成的令牌

## 📝 配置步骤

### 方法 1: 使用 GitHub CLI（推荐）

```bash
# 设置 Docker Hub 用户名
gh secret set DOCKER_USERNAME --body "您的Docker Hub用户名"

# 设置 Docker Hub 访问令牌
gh secret set DOCKER_TOKEN --body "您的Docker Hub访问令牌"
```

### 方法 2: 使用 GitHub Web 界面

1. 打开项目的 GitHub 页面：https://github.com/lihongjie0209/plantuml-server
2. 点击 **Settings** 标签
3. 在左侧菜单中点击 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**
5. 添加以下两个密钥：
   - **Name**: `DOCKER_USERNAME`, **Secret**: 您的 Docker Hub 用户名
   - **Name**: `DOCKER_TOKEN`, **Secret**: 您的 Docker Hub 访问令牌

## ✅ 验证配置

配置完成后，可以通过以下方式验证：

```bash
# 查看已配置的密钥
gh secret list

# 触发新的构建（推送任何更改）
git commit --allow-empty -m "Test GitHub Actions"
git push

# 查看构建状态
gh run list
```

## 🚨 注意事项

1. **不要使用 Docker Hub 密码**：必须使用访问令牌，不要使用登录密码
2. **令牌权限**：确保令牌有 `Read, Write, Delete` 权限
3. **安全性**：不要在代码中硬编码令牌，只通过 GitHub Secrets 使用
4. **令牌管理**：定期轮换访问令牌以提高安全性

## 🐛 故障排除

### "Username required" 错误
- 检查 `DOCKER_USERNAME` 是否正确配置
- 确认用户名拼写正确

### "Authentication failed" 错误
- 检查 `DOCKER_TOKEN` 是否正确配置
- 确认令牌未过期且有正确权限

### 查看详细错误信息
```bash
gh run view [RUN_ID] --log-failed
```

---

配置完成后，每次推送到 main 分支都会自动构建并推送 Docker 镜像到 Docker Hub！
