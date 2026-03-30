# 多阶段构建 - 构建时配置方案
# 使用方式：
#   1. 构建并运行容器：
#      make build API_URL=https://api.example.com
#      docker run -d -p 3000:3000 chat-studio-web-ui
#   
#   2. 提取静态文件用于外部部署：
#      make extract
#      cp -r dist/* /var/www/html/

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
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8080}
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
