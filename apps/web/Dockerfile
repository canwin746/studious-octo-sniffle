# 第一阶段：构建
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 构建生产版本（生成 dist 目录）
RUN npm run build

# 第二阶段：用 Nginx 托管
FROM nginx:alpine

# 复制构建产物到 Nginx 的静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件（可选，用于自定义路由）
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
