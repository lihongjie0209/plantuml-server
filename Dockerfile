# 多阶段构建 Dockerfile for Quarkus PlantUML Server

# 第一阶段：构建阶段
FROM maven:3.8.6-openjdk-11-slim AS build

# 设置工作目录
WORKDIR /app

# 复制 Maven 配置文件
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
COPY mvnw.cmd .

# 下载依赖（利用 Docker 缓存层）
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src/ src/

# 构建应用
RUN mvn clean package -DskipTests -B

# 第二阶段：运行阶段
FROM openjdk:11-jre-slim

# 安装必要的工具、字体和 Graphviz
RUN apt-get update && \
    apt-get install -y \
    graphviz \
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto-cjk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN useradd -r -u 1001 -g root appuser

# 设置工作目录
WORKDIR /app

# 创建字体目录和配置目录
RUN mkdir -p /app/fonts /app/plantuml-config && \
    chmod 755 /app/fonts /app/plantuml-config

# 从构建阶段复制应用文件
COPY --from=build --chown=1001:root /app/target/quarkus-app/ ./

# 复制字体文件（如果fonts目录存在的话）
COPY --chown=1001:root fonts /app/fonts

# 修改文件权限
RUN chmod -R g+w /app && \
    chown -R 1001:root /app/fonts /app/plantuml-config

# 设置字体路径和配置环境变量
ENV JAVA_FONTS=/app/fonts:/usr/share/fonts
ENV PLANTUML_CONFIG_PATH=/app/plantuml-config

# 切换到应用用户
USER 1001

# 暴露端口
EXPOSE 9090

# 设置环境变量
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9090/api/plantuml/health || exit 1

# 启动应用
CMD ["java", "-jar", "quarkus-run.jar"]
