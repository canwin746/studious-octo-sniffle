import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    let user = await prisma.user.findUnique({
      where: { username },
      include: { teacherProfile: true }
    })

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: username },
        include: { teacherProfile: true }
      })
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { phone: username },
        include: { teacherProfile: true }
      })
    }

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          teacherProfile: user.teacherProfile
        }
      },
      message: '登录成功'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const register = async (req: Request, res: Response) => {
  const { username, password, email, phone, role = 'STUDENT' } = req.body

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          { phone }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ success: false, message: '用户名已存在' })
      }
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: '邮箱已被注册' })
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ success: false, message: '手机号已被注册' })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        phone,
        role: role as 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'
      }
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      },
      message: '注册成功'
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { teacherProfile: true }
    })

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        teacherProfile: user.teacherProfile
      },
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
