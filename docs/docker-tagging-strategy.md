# Docker 标签策略优化

## 概述

优化了 PlantUML 服务器的 Docker 标签策略，以更好地利用 GitHub 版本标签，提供更完整和一致的容器标签管理。

## 标签策略

### 优先级顺序

1. **语义化版本标签** (最高优先级)
   - `v0.1.0` → `lihongjie0209/plantuml-server:0.1.0`
   - `v0.1.0` → `lihongjie0209/plantuml-server:0.1`
   - `v0.1.0` → `lihongjie0209/plantuml-server:0`

2. **分支标签**
   - `main` → `lihongjie0209/plantuml-server:main`

3. **特殊标签**
   - `latest` - 仅在主分支或版本标签时生成
   - SHA 标签 - 用于可追溯性

### 触发条件

```yaml
on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]           # 版本标签触发
```

### 标签配置

```yaml
tags: |
  # Version tags (highest priority)
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
  type=semver,pattern={{major}}
  # Branch-based tags
  type=ref,event=branch
  # PR tags
  type=ref,event=pr
  # Latest tag only for main branch and version tags
  type=raw,value=latest,enable={{is_default_branch}}
  type=raw,value=latest,enable=${{ startsWith(github.ref, 'refs/tags/v') }}
  # SHA-based tags for traceability
  type=sha,prefix={{branch}}-,enable={{is_default_branch}}
```

## 发布流程

### 1. 准备发布

```bash
# 更新版本号
vim pom.xml  # 修改 <version>0.2.0</version>
vim mcp/package.json  # 修改 "version": "0.2.0"
```

### 2. 提交更改

```bash
git add .
git commit -m "release: bump version to 0.2.0"
git push origin main
```

### 3. 创建版本标签

```bash
git tag v0.2.0
git push origin v0.2.0
```

### 4. 自动化构建

GitHub Actions 会自动：
- ✅ 构建 Docker 镜像
- ✅ 推送版本标签（0.2.0, 0.2, 0）
- ✅ 更新 latest 标签
- ✅ 添加 OCI 元数据
- ✅ 支持多架构（linux/amd64, linux/arm64）

## 生成的标签示例

当推送 `v0.1.0` 标签时：

```
lihongjie0209/plantuml-server:0.1.0    # 完整版本
lihongjie0209/plantuml-server:0.1      # 主要.次要版本
lihongjie0209/plantuml-server:0        # 主要版本
lihongjie0209/plantuml-server:latest   # 最新版本
```

## OCI 元数据

每个镜像都包含完整的 OCI 标准元数据：

```
org.opencontainers.image.created=2025-08-26T14:30:37.666Z
org.opencontainers.image.description=A high-performance PlantUML server built with Quarkus, providing RESTful APIs for diagram generation with Docker support
org.opencontainers.image.licenses=MIT
org.opencontainers.image.revision=25bcf3a1e45b13003cd67fcf1f290990a0020d51
org.opencontainers.image.source=https://github.com/lihongjie0209/plantuml-server
org.opencontainers.image.title=plantuml-server
org.opencontainers.image.url=https://github.com/lihongjie0209/plantuml-server
org.opencontainers.image.version=0.1.0
```

## 使用示例

### 拉取特定版本

```bash
docker pull lihongjie0209/plantuml-server:0.1.0
```

### 拉取最新版本

```bash
docker pull lihongjie0209/plantuml-server:latest
```

### 拉取主要版本

```bash
docker pull lihongjie0209/plantuml-server:0
```

## 优势

1. **版本管理清晰**: 支持语义化版本控制
2. **向后兼容**: 支持主要版本、次要版本标签
3. **自动化**: 无需手动管理 Docker 标签
4. **可追溯性**: 包含 Git 提交哈希和完整元数据
5. **多架构支持**: 同时支持 AMD64 和 ARM64
6. **标准化**: 遵循 OCI 镜像标准

## 验证成功

- ✅ v0.1.0 标签成功触发构建
- ✅ 生成了所有预期的 Docker 标签
- ✅ 镜像成功推送到 Docker Hub
- ✅ 元数据正确设置
- ✅ 多架构构建成功
