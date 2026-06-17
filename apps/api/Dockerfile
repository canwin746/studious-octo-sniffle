FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建生产代码
RUN npm run build

EXPOSE 3001

# 使用构建后的入口文件启动（假设入口是 dist/main.js 或 dist/index.js）
CMD ["node", "dist/main.js"]
