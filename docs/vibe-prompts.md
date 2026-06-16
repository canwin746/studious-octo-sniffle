# 教师数字画像系统 - Vibe Coding 提示词库

## 项目上下文
- 广东东软学院软件工程期末大作业
- 技术栈：React 18 + Vite + Node.js + Express + Prisma + PostgreSQL + ECharts
- 目标：构建教师数字画像系统，实现教师综合能力可视化评估

## 核心提示词模板

### 1. 生成新页面
为教师数字画像系统创建一个【页面名称】页面。
要求：
使用 React + TypeScript + Tailwind CSS
使用 TanStack Query 进行数据获取
使用 ECharts 进行数据可视化（如需要）
遵循现有项目结构和命名规范
添加响应式布局支持
包含加载状态和错误处理

### 2. 生成 API 接口
为教师数字画像系统后端添加一个【功能名称】API 接口。
要求：
使用 Express + TypeScript
使用 Prisma ORM 操作数据库
添加 JWT 认证中间件
添加请求参数验证（express-validator）
添加错误处理
返回标准 JSON 格式：{ success: boolean, data: any, message?: string }

### 3. 生成数据库模型
在 Prisma schema 中添加【模型名称】模型。
要求：
遵循现有命名规范（小写下划线）
添加适当的字段类型和约束
添加与其他模型的关联关系
添加索引优化查询
生成迁移文件

### 4. 修复 Bug
修复以下问题：【问题描述】
相关代码：
【粘贴代码片段】
要求：
保持代码风格一致
添加必要的错误处理
确保类型安全

## 数据库 Schema 速查

### 核心实体
- User: 用户（教师/管理员）
- TeacherProfile: 教师画像（核心表）
- Course: 课程
- Evaluation: 评价记录
- Achievement: 科研成果
- AdminLog: 管理员日志

### 关键字段
- abilityRadar: JSON 格式存储雷达图数据
- tags: JSON 数组存储标签
- overallScore: 综合评分（0-100）