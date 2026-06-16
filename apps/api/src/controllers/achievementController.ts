import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { Role } from '../middleware/auth'

export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: { teacher: true },
      orderBy: { publishDate: 'desc' }
    })

    res.json({ success: true, data: achievements, message: '获取成功' })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getAchievementById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!achievement) {
      return res.status(404).json({ success: false, message: '成果不存在' })
    }

    res.json({ success: true, data: achievement, message: '获取成功' })
  } catch (error) {
    console.error('Get achievement error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const createAchievement = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { title, type, authors, journal, publishDate, impactFactor, level, teacherId, url, summary, keywords } = req.body

  try {
    let targetTeacherId = teacherId

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (!teacher) {
        return res.status(404).json({ success: false, message: '教师信息不存在' })
      }
      targetTeacherId = teacher.id
    }

    const normalizedUrl = url && !url.startsWith('http://') && !url.startsWith('https://') ? `https://${url}` : url

    const achievement = await prisma.achievement.create({
      data: {
        title,
        type,
        authors,
        journal,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        impactFactor: impactFactor ? parseFloat(impactFactor) : undefined,
        level,
        teacherId: targetTeacherId,
        url: normalizedUrl,
        summary,
        keywords
      }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'CREATE_ACHIEVEMENT',
          targetType: 'Achievement',
          targetId: achievement.id,
          description: `创建成果: ${title}`,
          operatorId: userId!
        }
      })
    }

    res.status(201).json({ success: true, data: achievement, message: '创建成功' })
  } catch (error) {
    console.error('Create achievement error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateAchievement = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { title, type, authors, journal, publishDate, impactFactor, level, url, summary, keywords } = req.body

  try {
    const achievement = await prisma.achievement.findUnique({ where: { id } })
    if (!achievement) {
      return res.status(404).json({ success: false, message: '成果不存在' })
    }

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (teacher && achievement.teacherId !== teacher.id) {
        return res.status(403).json({ success: false, message: '只能更新本人的成果' })
      }
    }

    const normalizedUrl = url && !url.startsWith('http://') && !url.startsWith('https://') ? `https://${url}` : url

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: { title, type, authors, journal, publishDate: publishDate ? new Date(publishDate) : undefined, impactFactor: impactFactor ? parseFloat(impactFactor) : undefined, level, url: normalizedUrl, summary, keywords }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'UPDATE_ACHIEVEMENT',
          targetType: 'Achievement',
          targetId: updatedAchievement.id,
          description: `更新成果: ${title}`,
          operatorId: userId!
        }
      })
    }

    res.json({ success: true, data: updatedAchievement, message: '更新成功' })
  } catch (error) {
    console.error('Update achievement error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const deleteAchievement = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role

  try {
    const achievement = await prisma.achievement.findUnique({ where: { id } })
    if (!achievement) {
      return res.status(404).json({ success: false, message: '成果不存在' })
    }

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (teacher && achievement.teacherId !== teacher.id) {
        return res.status(403).json({ success: false, message: '只能删除本人的成果' })
      }
    }

    const deletedTitle = achievement.title

    await prisma.achievement.delete({ where: { id } })

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_ACHIEVEMENT',
        targetType: 'Achievement',
        targetId: id,
        description: `删除成果: ${deletedTitle}`,
        operatorId: userId!
      }
    })

    res.json({ success: true, data: null, message: '删除成功' })
  } catch (error) {
    console.error('Delete achievement error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getAchievementStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.achievement.aggregate({
      _count: { id: true }
    })

    const typeStats = await prisma.achievement.groupBy({
      by: ['type'],
      _count: { id: true }
    })

    const levelStats = await prisma.achievement.groupBy({
      by: ['level'],
      _count: { id: true }
    })

    res.json({
      success: true,
      data: {
        total: stats._count.id,
        byType: typeStats,
        byLevel: levelStats
      },
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get achievement stats error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
