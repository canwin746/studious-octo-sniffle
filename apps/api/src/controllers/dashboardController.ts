import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { Role } from '../middleware/auth'

export const getDashboard = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const userRole = req.user?.role as Role

  try {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      const [teacherCount, courseCount, evaluationCount, achievementCount] = await Promise.all([
        prisma.teacherProfile.count(),
        prisma.course.count(),
        prisma.evaluation.count(),
        prisma.achievement.count()
      ])

      const recentEvaluations = await prisma.evaluation.findMany({
        include: { teacher: { select: { name: true, title: true, college: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const evaluationStats = await prisma.evaluation.aggregate({
        _avg: { score: true },
        _count: { id: true }
      })

      res.json({
        success: true,
        data: {
          type: 'admin',
          overview: {
            teacherCount,
            courseCount,
            evaluationCount,
            achievementCount,
            avgScore: evaluationStats._avg.score ? parseFloat(evaluationStats._avg.score.toFixed(2)) : 0
          },
          recentEvaluations
        },
        message: '获取成功'
      })
    } else if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId },
        include: { evaluations: true, courses: true, achievements: true }
      })

      if (!teacher) {
        return res.status(404).json({ success: false, message: '教师信息不存在' })
      }

      const evaluations = await prisma.evaluation.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' }
      })

      const avgScore = evaluations.length > 0
        ? parseFloat((evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(2))
        : 0

      const scoreTrend = evaluations.slice(0, 10).reverse().map(e => ({
        date: e.createdAt.toISOString().split('T')[0],
        score: e.score
      }))

      res.json({
        success: true,
        data: {
          type: 'teacher',
          profile: {
            name: teacher.name,
            title: teacher.title,
            college: teacher.college,
            overallScore: teacher.overallScore,
            abilityRadar: teacher.abilityRadar
          },
          stats: {
            courseCount: teacher.courses.length,
            evaluationCount: evaluations.length,
            achievementCount: teacher.achievements.length,
            avgScore
          },
          scoreTrend
        },
        message: '获取成功'
      })
    } else if (userRole === 'STUDENT') {
      const collegeStats = await prisma.teacherProfile.groupBy({
        by: ['college'],
        _count: { id: true }
      })

      const titleStats = await prisma.teacherProfile.groupBy({
        by: ['title'],
        _count: { id: true }
      })

      const evaluationStats = await prisma.evaluation.aggregate({
        _avg: { score: true },
        _count: { id: true }
      })

      const topTeachers = await prisma.teacherProfile.findMany({
        orderBy: { overallScore: 'desc' },
        take: 10,
        select: { name: true, title: true, college: true, overallScore: true, tags: true }
      })

      res.json({
        success: true,
        data: {
          type: 'student',
          teacherDistribution: {
            byCollege: collegeStats,
            byTitle: titleStats
          },
          overview: {
            totalTeachers: collegeStats.reduce((sum, s) => sum + s._count.id, 0),
            totalEvaluations: evaluationStats._count.id,
            avgScore: evaluationStats._avg.score ? parseFloat(evaluationStats._avg.score.toFixed(2)) : 0
          },
          topTeachers
        },
        message: '获取成功'
      })
    } else {
      res.status(403).json({ success: false, message: '无权限访问' })
    }
  } catch (error) {
    console.error('Get dashboard error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
