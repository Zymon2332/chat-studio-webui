.PHONY: help build build-no-cache extract run stop logs tag push clean

# 变量
IMAGE_NAME ?= chat-studio-web-ui
VERSION ?= preview
REGISTRY ?=
FULL_IMAGE_NAME = $(REGISTRY)$(IMAGE_NAME)
# 默认使用相对路径 /api，Nginx 会代理到后端容器
# 如需直接访问后端，可设置为 http://localhost:8080 或其他地址
API_URL ?= /api

# 颜色定义
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m # No Color

# 默认目标
help:
	@echo "$(BLUE)Chat Studio Web UI - Docker 构建工具$(NC)"
	@echo ""
	@echo "$(GREEN)可用命令:$(NC)"
	@echo "  $(YELLOW)make build$(NC)                  构建 Docker 镜像（使用 /api 代理）"
	@echo "  $(YELLOW)make build API_URL=xxx$(NC)      指定后端地址构建（如 http://localhost:8080）"
	@echo "  $(YELLOW)make run$(NC)                    运行容器"
	@echo "  $(YELLOW)make extract$(NC)                提取静态文件"
	@echo "  $(YELLOW)make stop$(NC)                   停止容器"
	@echo "  $(YELLOW)make tag VERSION=x.x.x$(NC)      为镜像打版本标签"
	@echo "  $(YELLOW)make clean$(NC)                  清理资源"
	@echo ""
	@echo "$(GREEN)环境变量:$(NC)"
	@echo "  $(YELLOW)API_URL$(NC)       后端 API 地址（默认: /api，使用 Nginx 代理）"
	@echo ""
	@echo "$(GREEN)示例:$(NC)"
	@echo "  make build                                    # 使用 Nginx 反向代理模式"
	@echo "  make build API_URL=http://localhost:8080      # 直接访问本地后端（开发模式）"
	@echo "  make extract                                  # 提取静态文件到外部部署"

# 构建镜像
build:
	@echo "$(BLUE)正在构建镜像 $(FULL_IMAGE_NAME):$(VERSION)...$(NC)"
	@echo "$(YELLOW)后端地址: $(API_URL)$(NC)"
	docker build \
		--build-arg VITE_API_BASE_URL=$(API_URL) \
		-t $(FULL_IMAGE_NAME):$(VERSION) .
	@echo "$(GREEN)✓ 构建完成: $(FULL_IMAGE_NAME):$(VERSION)$(NC)"

# 不使用缓存构建
build-no-cache:
	@echo "$(BLUE)正在构建镜像（不使用缓存）...$(NC)"
	@echo "$(YELLOW)后端地址: $(API_URL)$(NC)"
	docker build --no-cache \
		--build-arg VITE_API_BASE_URL=$(API_URL) \
		-t $(FULL_IMAGE_NAME):$(VERSION) .
	@echo "$(GREEN)✓ 构建完成: $(FULL_IMAGE_NAME):$(VERSION)$(NC)"

# 提取静态文件
extract:
	@echo "$(BLUE)正在从镜像提取静态文件...$(NC)"
	@docker create --name $(IMAGE_NAME)-extract $(FULL_IMAGE_NAME):$(VERSION) > /dev/null
	@docker cp $(IMAGE_NAME)-extract:/usr/share/nginx/html ./dist
	@docker rm $(IMAGE_NAME)-extract > /dev/null
	@echo "$(GREEN)✓ 静态文件已提取到 ./dist 目录$(NC)"
	@echo "$(YELLOW)部署命令: cp -r dist/* /var/www/html/$(NC)"

# 打标签
tag:
	@if [ "$(VERSION)" = "latest" ]; then \
		echo "$(RED)错误: 请指定 VERSION 参数$(NC)"; \
		echo "用法: make tag VERSION=x.x.x"; \
		exit 1; \
	fi
	@echo "$(BLUE)正在为镜像打标签 $(VERSION)...$(NC)"
	docker tag $(FULL_IMAGE_NAME):latest $(FULL_IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✓ 标签创建完成: $(FULL_IMAGE_NAME):$(VERSION)$(NC)"

# 推送镜像到仓库
push:
	@if [ "$(VERSION)" = "latest" ]; then \
		echo "$(RED)错误: 请指定 VERSION 参数$(NC)"; \
		echo "用法: make push VERSION=x.x.x"; \
		exit 1; \
	fi
	@echo "$(BLUE)正在推送镜像 $(FULL_IMAGE_NAME):$(VERSION)...$(NC)"
	docker push $(FULL_IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✓ 推送完成: $(FULL_IMAGE_NAME):$(VERSION)$(NC)"

# 运行容器
run:
	@echo "$(BLUE)正在启动容器...$(NC)"
	@docker run -d \
		--name $(IMAGE_NAME) \
		-p 3000:3000 \
		$(FULL_IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✓ 容器已启动: http://localhost:3000$(NC)"

# 停止容器
stop:
	@echo "$(BLUE)正在停止容器...$(NC)"
	-@docker stop $(IMAGE_NAME) 2>/dev/null || true
	-@docker rm $(IMAGE_NAME) 2>/dev/null || true
	@echo "$(GREEN)✓ 容器已停止$(NC)"

# 查看日志
logs:
	@docker logs -f $(IMAGE_NAME)

# 清理
clean:
	@echo "$(BLUE)清理 Docker 资源...$(NC)"
	-@docker rm -f $(IMAGE_NAME)-extract 2>/dev/null || true
	-@docker rmi $(FULL_IMAGE_NAME):$(VERSION) 2>/dev/null || true
	-@docker rmi $(FULL_IMAGE_NAME):latest 2>/dev/null || true
	@echo "$(GREEN)✓ 清理完成$(NC)"

# 完整流程：构建并提取
all: build extract
	@echo "$(GREEN)✓ 构建并提取完成$(NC)"
