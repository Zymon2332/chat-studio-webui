# 多阶段构建 - 构建时配置方案
# 使用方式：
#   1. 使用 Nginx 反向代理（推荐，适合容器化部署）：
#      make build                              # 默认使用 /api 路径
#      docker run -d --network your-network -p 3000:3000 chat-studio-web-ui
#      # 后端容器需要在同一网络，名为 chat-studio-server
#   
#   2. 直接指定后端地址（适合开发或外部后端）：
#      make build API_URL=http://localhost:8080
#      docker run -d -p 3000:3000 chat-studio-web-ui
#   
#   3. 提取静态文件用于外部部署：
#      make extract
#      cp -r dist/* /var/www/html/
#
# 反向代理说明：
#   - 前端请求 /api/* 会被 Nginx 转发到 http://chat-studio-server:8080
#   - 容器名 chat-studio-server 只在 Docker 网络内部可解析
#   - 浏览器只访问 http://localhost:3000，不涉及容器通信

# 阶段 1: 构建阶段
FROM node:22-alpine3.21 AS builder

# 配置国内镜像（可选，在中国大陆使用）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories 2>/dev/null || true
RUN npm config set registry https://registry.npmmirror.com 2>/dev/null || true

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 和依赖
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用（构建时注入 API 地址）
# 默认使用 /api，由 Nginx 反向代理到后端容器
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api}
RUN pnpm build

# 阶段 2: 运行阶段 - Nginx 托管
FROM nginx:1.29.7-alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

# 直接启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
