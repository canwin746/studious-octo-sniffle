import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { Role } from '../middleware/auth'

export const getAllEvaluations = async (req: Request, res: Response) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: { teacher: true, course: true },
      orderBy: { evaluateDate: 'desc' }
    })

    res.json({ success: true, data: evaluations, message: '获取成功' })
  } catch (error) {
    console.error('Get evaluations error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getEvaluationById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { teacher: true, course: true }
    })

    if (!evaluation) {
      return res.status(404).json({ success: false, message: '评价不存在' })
    }

    res.json({ success: true, data: evaluation, message: '获取成功' })
  } catch (error) {
    console.error('Get evaluation error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const createEvaluation = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { type, score, comment, evaluator, teacherId, courseId } = req.body

  try {
    const evaluation = await prisma.evaluation.create({
      data: { type, score: parseFloat(score), comment, evaluator, teacherId, courseId }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'CREATE_EVALUATION',
          targetType: 'Evaluation',
          targetId: evaluation.id,
          description: `创建评价: 教师ID ${teacherId}, 评分 ${score}`,
          operatorId: userId!
        }
      })
    }

    res.status(201).json({ success: true, data: evaluation, message: '创建成功' })
  } catch (error) {
    console.error('Create evaluation error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateEvaluation = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { type, score, comment, evaluator, courseId } = req.body

  try {
    const evaluation = await prisma.evaluation.findUnique({ where: { id } })
    if (!evaluation) {
      return res.status(404).json({ success: false, message: '评价不存在' })
    }

    // 获取当前用户的用户名（用于教师身份验证）
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })

    // 教师只能修改自己创建的评价
    if (userRole === 'TEACHER' && evaluation.evaluator !== currentUser?.username) {
      return res.status(403).json({ success: false, message: '教师只能修改自己创建的评价' })
    }

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id },
      data: { type, score: parseFloat(score), comment, evaluator, courseId }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'UPDATE_EVALUATION',
          targetType: 'Evaluation',
          targetId: updatedEvaluation.id,
          description: `更新评价: ID ${id}`,
          operatorId: userId!
        }
      })
    }

    res.json({ success: true, data: updatedEvaluation, message: '更新成功' })
  } catch (error) {
    console.error('Update evaluation error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const deleteEvaluation = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role

  try {
    const evaluation = await prisma.evaluation.findUnique({ where: { id } })
    if (!evaluation) {
      return res.status(404).json({ success: false, message: '评价不存在' })
    }

    // 获取当前用户的用户名（用于教师身份验证）
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })

    // 教师只能删除自己创建的评价
    if (userRole === 'TEACHER' && evaluation.evaluator !== currentUser?.username) {
      return res.status(403).json({ success: false, message: '教师只能删除自己创建的评价' })
    }

    await prisma.evaluation.delete({ where: { id } })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'DELETE_EVALUATION',
          targetType: 'Evaluation',
          targetId: id,
          description: `删除评价: ID ${id}`,
          operatorId: userId!
        }
      })
    }

    res.json({ success: true, data: null, message: '删除成功' })
  } catch (error) {
    console.error('Delete evaluation error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getEvaluationStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.evaluation.aggregate({
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true }
    })

    const typeStats = await prisma.evaluation.groupBy({
      by: ['type'],
      _count: { id: true },
      _avg: { score: true }
    })

    res.json({
      success: true,
      data: {
        total: stats._count.id,
        avgScore: Math.round((stats._avg.score || 0) * 10) / 10,
        maxScore: stats._max.score,
        minScore: stats._min.score,
        byType: typeStats
      },
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get evaluation stats error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
