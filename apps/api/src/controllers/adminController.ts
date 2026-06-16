import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const getAllLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.adminLog.findMany({
      include: { operator: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: logs,
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { teacherProfile: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: users,
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { username, password, role, email, phone } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        email,
        phone
      }
    })

    await prisma.adminLog.create({
      data: {
        action: 'CREATE_USER',
        targetType: 'User',
        targetId: user.id,
        description: `创建用户: ${username}`,
        operatorId: req.user!.id
      }
    })

    res.status(201).json({
      success: true,
      data: user,
      message: '创建成功'
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const { username, role, email, phone } = req.body

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        role,
        email,
        phone
      }
    })

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_USER',
        targetType: 'User',
        targetId: user.id,
        description: `更新用户: ${username}`,
        operatorId: req.user!.id
      }
    })

    res.json({
      success: true,
      data: user,
      message: '更新成功'
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    const deletedUsername = user.username

    await prisma.user.delete({ where: { id } })

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_USER',
        targetType: 'User',
        targetId: id,
        description: `删除用户: ${deletedUsername}`,
        operatorId: req.user!.id
      }
    })

    res.json({
      success: true,
      data: null,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params
  const { password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    await prisma.adminLog.create({
      data: {
        action: 'RESET_PASSWORD',
        targetType: 'User',
        targetId: user.id,
        description: `重置用户密码: ${user.username}`,
        operatorId: req.user!.id
      }
    })

    res.json({
      success: true,
      data: user,
      message: '密码重置成功'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
