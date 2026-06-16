import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'

interface JwtPayload {
  userId: string
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: Role
      }
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    })

    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' })
    }

    req.user = { id: user.id, role: user.role as Role }
    next()
  } catch (error) {
    return res.status(403).json({ success: false, message: '无效的认证令牌' })
  }
}

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未认证' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '权限不足' })
    }

    next()
  }
}

export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN'])

export const requireSuperAdmin = requireRole(['SUPER_ADMIN'])

export const requireTeacherOrAdmin = requireRole(['TEACHER', 'ADMIN', 'SUPER_ADMIN'])

export const requireStudentOrAbove = requireRole(['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'])
