# Docker 部署指南

本文档说明如何使用 Docker 部署 Chat Studio Web UI。

## 架构说明

采用**构建时配置**方案：
- API 地址在构建时通过 `--build-arg` 注入
- 容器内置 Nginx 提供 HTTP 服务（端口 3000）
- 支持容器独立运行和静态文件提取两种部署方式

## 环境配置说明

### 本地开发 vs Docker 构建

本项目支持两种配置方式，用于不同场景：

| 场景 | 配置方式 | 说明 |
|------|---------|------|
| **本地开发** | `.env` 文件 | 开发时使用，Vite 自动读取 |
| **Docker 构建** | `--build-arg` | 构建镜像时使用，通过命令行传入 |

### 本地开发（使用 .env）

适用于本地开发调试：

```bash
# 1. 从模板创建 .env 文件
cp .env.example .env

# 2. 编辑 .env 文件，修改为你的本地后端地址
# VITE_API_BASE_URL=http://localhost:8080

# 3. 启动开发服务器
npm run dev
# 或
make dev
```

**注意：** `.env` 文件不会被提交到 Git（已添加到 `.gitignore`），每个开发者可以配置自己的环境。

### Docker 构建（使用 --build-arg）

适用于构建生产镜像：

```bash
# 通过 Makefile 构建（推荐）
make build API_URL=https://api.example.com

# 或直接 docker build
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t chat-studio-web-ui:latest .
```

**重要区别：**
- Docker 构建**不使用** `.env` 文件
- 配置通过 `--build-arg` 在构建时注入
- 这样 CI/CD 可以安全地传入敏感信息，无需提交到代码仓库

## 快速开始

### 1. 查看可用命令

```bash
make help
```

### 2. 构建镜像

```bash
# 使用默认后端地址构建
make build

# 指定后端地址构建
make build API_URL=https://api.example.com

# 不使用缓存构建
make build-no-cache API_URL=https://api.example.com
```

### 3. 运行容器

```bash
# 启动容器
make run

# 或者直接使用 docker run
docker run -d \
  --name chat-studio-web \
  -p 3000:3000 \
  chat-studio-web-ui:latest
```

### 4. 提取静态文件（用于外部部署）

```bash
# 从镜像提取静态文件到 ./dist 目录
make extract

# 部署到外部服务器
cp -r dist/* /var/www/html/
```

## 完整部署流程示例

### 场景一：容器独立运行

```bash
# 构建并运行
make build API_URL=https://api.example.com
make run

# 访问 http://localhost:3000
```

### 场景二：外部 Nginx 托管

```bash
# 1. 构建镜像
make build API_URL=https://api.example.com

# 2. 提取静态文件
make extract

# 3. 复制到外部服务器
rsync -avz dist/ user@server:/var/www/html/

# 4. 配置外部 Nginx（示例）
# server {
#     listen 80;
#     server_name app.example.com;
#     root /var/www/html;
#     location / { try_files $uri $uri/ /index.html; }
# }
```

### 场景三：外部 Caddy 托管

```bash
# 1-2 同上
make build API_URL=https://api.example.com
make extract

# 3. Caddy 配置
# app.example.com {
#     root * /var/www/html
#     file_server
# }
```

## 多环境部署

每个环境需要单独构建：

```bash
# 开发环境
make build API_URL=http://dev-api:8080
make tag VERSION=dev
docker run -d -p 3001:3000 chat-studio-web-ui:dev

# 测试环境
make build API_URL=http://test-api:8080
make tag VERSION=test
docker run -d -p 3002:3000 chat-studio-web-ui:test

# 生产环境
make build API_URL=https://api.example.com
make tag VERSION=prod
docker run -d -p 3000:3000 chat-studio-web-ui:prod
```

## Makefile 命令

| 命令 | 说明 |
|------|------|
| `make build` | 构建 Docker 镜像 |
| `make build API_URL=xxx` | 指定后端地址构建 |
| `make run` | 运行容器 |
| `make extract` | 提取静态文件到 ./dist |
| `make stop` | 停止并删除容器 |
| `make tag VERSION=x.x.x` | 为镜像打版本标签 |
| `make clean` | 清理镜像和容器 |

## 文件结构

```
.
├── Dockerfile              # 多阶段构建配置
├── Makefile                # 构建脚本
├── docker/
│   └── nginx.conf         # 容器内 Nginx 配置
└── docs/
    └── docker-deploy.md   # 本文档
```

## 工作原理

1. **构建阶段**：使用 Node.js 构建前端应用，通过 `--build-arg` 注入 API 地址
2. **运行阶段**：使用 Nginx 托管静态文件，无运行时配置逻辑
3. **静态提取**：从镜像复制 `/usr/share/nginx/html` 到本地

## 故障排查

### 容器无法启动

```bash
# 查看日志
docker logs chat-studio-web

# 检查镜像构建
docker run --rm chat-studio-web-ui:latest ls -la /usr/share/nginx/html
```

### API 请求失败

1. 确认构建时 `API_URL` 设置正确
2. 检查后端 API 是否可访问
3. 查看浏览器控制台网络请求
4. 检查跨域配置（CORS）

## 注意事项

1. **构建时配置**：API 地址在构建时确定，运行容器后无法更改
2. **重新构建**：如需更改 API 地址，必须重新构建镜像
3. **外部部署**：提取的静态文件可直接用于任何 Web 服务器
