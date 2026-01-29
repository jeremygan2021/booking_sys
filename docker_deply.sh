#!/bin/bash

# =============================================================================
# Docker 镜像构建和部署自动化脚本 (前后端分离版)
# chmod u+x docker_deply.sh
# =============================================================================

# 配置服务器信息
SERVER_HOST="47.101.218.42"
SERVER_USER="ecs-user"
SERVER_PASSWORD="123quant-speed"
SERVER_PORT="22"

# 项目配置
WEB_IMAGE_NAME="booking_web"
SERVER_IMAGE_NAME="booking_server"
IMAGE_TAG="latest"

WEB_CONTAINER_NAME="booking_web"
SERVER_CONTAINER_NAME="booking_server"

WEB_LOCAL_PORT="8199"      # 宿主机前端端口
WEB_CONTAINER_PORT="80"    # 容器前端端口
SERVER_PORT="3000"         # 后端端口

WEB_TAR="booking_web.tar"
SERVER_TAR="booking_server.tar"

# 架构配置
PLATFORM="linux/amd64"
ARCH_SUFFIX=""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查依赖
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass 未安装 (brew install sshpass)"
        exit 1
    fi
}

# 解析参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -amd) PLATFORM="linux/amd64"; ARCH_SUFFIX="-amd64"; shift ;;
            -arm) PLATFORM="linux/arm64"; ARCH_SUFFIX="-arm64"; shift ;;
            -upload) UPLOAD_ONLY=true; shift ;;
            *) shift ;;
        esac
    done
    WEB_TAR="${WEB_IMAGE_NAME}-${IMAGE_TAG}${ARCH_SUFFIX}.tar"
    SERVER_TAR="${SERVER_IMAGE_NAME}-${IMAGE_TAG}${ARCH_SUFFIX}.tar"
}

# 构建镜像
build_images() {
    log_info "1. 构建后端镜像 (Server)..."
    docker buildx build --platform $PLATFORM -t "${SERVER_IMAGE_NAME}:${IMAGE_TAG}" --output type=docker,dest="./${SERVER_TAR}" ./server
    
    log_info "2. 构建前端镜像 (Web)..."
    docker buildx build --platform $PLATFORM -t "${WEB_IMAGE_NAME}:${IMAGE_TAG}" --output type=docker,dest="./${WEB_TAR}" .
    
    log_success "镜像构建完成"
}

# 上传文件
upload_to_server() {
    log_info "上传文件到服务器..."
    sshpass -p "$SERVER_PASSWORD" scp -P "$SERVER_PORT" -o StrictHostKeyChecking=no \
        "$WEB_TAR" "$SERVER_TAR" ".env" \
        "${SERVER_USER}@${SERVER_HOST}:/tmp/"
}

# 部署
deploy_on_server() {
    log_info "开始在服务器上部署..."
    
    sshpass -p "$SERVER_PASSWORD" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" << EOF
        set -e
        
        # 1. 创建 Docker 网络
        echo "[INFO] 检查 Docker 网络..."
        if ! sudo docker network ls | grep -q "booking_net"; then
            sudo docker network create booking_net
            echo "[SUCCESS] 网络 booking_net 已创建"
        fi

        # 2. 清理旧容器和镜像
        echo "[INFO] 清理旧环境..."
        sudo docker stop ${WEB_CONTAINER_NAME} ${SERVER_CONTAINER_NAME} || true
        sudo docker rm ${WEB_CONTAINER_NAME} ${SERVER_CONTAINER_NAME} || true
        sudo docker rmi ${WEB_IMAGE_NAME}:${IMAGE_TAG} ${SERVER_IMAGE_NAME}:${IMAGE_TAG} || true

        # 3. 加载新镜像
        echo "[INFO] 加载镜像..."
        sudo docker load -i /tmp/${SERVER_TAR}
        sudo docker load -i /tmp/${WEB_TAR}

        # 4. 启动后端容器
        echo "[INFO] 启动后端服务..."
        
        # 确保上传目录存在
        mkdir -p /home/${SERVER_USER}/booking_data/uploads

        # 注意：这里使用 --network-alias server，这样前端可以通过 http://server:3000 访问
        sudo docker run -d \
            --name ${SERVER_CONTAINER_NAME} \
            --network booking_net \
            --network-alias server \
            --restart always \
            --env-file /tmp/.env \
            -p ${SERVER_PORT}:${SERVER_PORT} \
            -v /home/${SERVER_USER}/booking_data/uploads:/app/uploads \
            ${SERVER_IMAGE_NAME}:${IMAGE_TAG}

        # 5. 启动前端容器
        echo "[INFO] 启动前端服务..."
        sudo docker run -d \
            --name ${WEB_CONTAINER_NAME} \
            --network booking_net \
            --restart always \
            -p ${WEB_LOCAL_PORT}:${WEB_CONTAINER_PORT} \
            ${WEB_IMAGE_NAME}:${IMAGE_TAG}

        # 6. 清理临时文件
        rm -f /tmp/${WEB_TAR} /tmp/${SERVER_TAR} /tmp/.env
        
        echo "[SUCCESS] 所有服务已启动！"
        echo "访问地址: http://${SERVER_HOST}:${WEB_LOCAL_PORT}"
EOF
}

# 清理本地
cleanup_local() {
    rm -f "$WEB_TAR" "$SERVER_TAR"
}

main() {
    parse_arguments "$@"
    
    if [ "$UPLOAD_ONLY" != true ]; then
        check_dependencies
        build_images
    fi
    
    upload_to_server
    deploy_on_server
    cleanup_local
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
