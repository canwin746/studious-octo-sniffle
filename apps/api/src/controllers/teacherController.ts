import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { Role } from '../middleware/auth'

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role as Role

    if (userRole === 'STUDENT') {
      const teachers = await prisma.teacherProfile.findMany({
        select: {
          id: true,
          name: true,
          title: true,
          department: true,
          college: true,
          overallScore: true,
          tags: true,
          courses: {
            select: { id: true, name: true, code: true, credit: true, semester: true, year: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return res.json({ success: true, data: teachers, message: '获取成功' })
    }

    const teachers = await prisma.teacherProfile.findMany({
      include: {
        courses: true,
        evaluations: true,
        achievements: true,
        user: { select: { email: true, phone: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ success: true, data: teachers, message: '获取成功' })
  } catch (error) {
    console.error('Get teachers error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getTeacherById = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: {
        courses: true,
        evaluations: true,
        achievements: true,
        user: { select: { email: true, phone: true } }
      }
    })

    if (!teacher) {
      return res.status(404).json({ success: false, message: '教师不存在' })
    }

    if (userRole === 'TEACHER') {
      const userProfile = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (userProfile?.id !== id) {
        return res.status(403).json({ success: false, message: '只能查看本人信息' })
      }
    }

    if (userRole === 'STUDENT') {
      const filteredTeacher = {
        ...teacher,
        user: undefined,
        evaluations: teacher.evaluations.map(e => ({
          ...e,
          comment: undefined
        }))
      }
      return res.json({ success: true, data: filteredTeacher, message: '获取成功' })
    }

    res.json({ success: true, data: teacher, message: '获取成功' })
  } catch (error) {
    console.error('Get teacher error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        courses: true,
        evaluations: true,
        achievements: true,
        user: { select: { email: true, phone: true } }
      }
    })

    if (!teacher) {
      return res.status(404).json({ success: false, message: '教师信息不存在' })
    }

    res.json({ success: true, data: teacher, message: '获取成功' })
  } catch (error) {
    console.error('Get my profile error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const { name, title, education, major, description, avatar } = req.body

  try {
    const teacher = await prisma.teacherProfile.update({
      where: { userId },
      data: { name, title, education, major, description, avatar }
    })

    res.json({ success: true, data: teacher, message: '更新成功' })
  } catch (error) {
    console.error('Update my profile error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const createTeacher = async (req: Request, res: Response) => {
  const { name, department, college, title, education, major, hireDate, description, email, phone } = req.body

  try {
    const username = name.replace(/\s/g, '').toLowerCase()
    const defaultPassword = await bcrypt.hash('123456', 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: defaultPassword,
        role: 'TEACHER',
        email,
        phone
      }
    })

    const teacher = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        name,
        department,
        college,
        title,
        education,
        major,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        description,
        abilityRadar: { teaching: 0, research: 0, service: 0, collaboration: 0, innovation: 0 },
        tags: [],
        overallScore: 0
      }
    })

    await prisma.adminLog.create({
      data: {
        action: 'CREATE_TEACHER',
        targetType: 'TeacherProfile',
        targetId: teacher.id,
        description: `创建教师: ${name}`,
        operatorId: req.user!.id
      }
    })

    res.status(201).json({ success: true, data: teacher, message: '创建成功' })
  } catch (error) {
    console.error('Create teacher error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateTeacher = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, department, college, title, education, major, hireDate, description, avatar } = req.body
  const userId = req.user?.id
  const userRole = req.user?.role

  try {
    // 检查权限：管理员可以更新任意教师，教师只能更新自己
    if (userRole === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { id },
        select: { userId: true }
      })
      if (!teacherProfile || teacherProfile.userId !== userId) {
        return res.status(403).json({ success: false, message: '只能更新自己的信息' })
      }
    }

    const teacher = await prisma.teacherProfile.update({
      where: { id },
      data: { name, department, college, title, education, major, hireDate: hireDate ? new Date(hireDate) : undefined, description, avatar }
    })

    // 只有管理员操作才记录日志
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'UPDATE_TEACHER',
          targetType: 'TeacherProfile',
          targetId: teacher.id,
          description: `更新教师: ${name}`,
          operatorId: userId!
        }
      })
    }

    res.json({ success: true, data: teacher, message: '更新成功' })
  } catch (error) {
    console.error('Update teacher error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id } })
    if (!teacher) {
      return res.status(404).json({ success: false, message: '教师不存在' })
    }

    const deletedName = teacher.name

    await prisma.user.delete({ where: { id: teacher.userId } })

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_TEACHER',
        targetType: 'TeacherProfile',
        targetId: id,
        description: `删除教师: ${deletedName}`,
        operatorId: req.user!.id
      }
    })

    res.json({ success: true, data: null, message: '删除成功' })
  } catch (error) {
    console.error('Delete teacher error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const calculateScore = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { evaluations: true }
    })

    if (!teacher) {
      return res.status(404).json({ success: false, message: '教师不存在' })
    }

    const teachingEvals = teacher.evaluations.filter((e: { type: string }) => e.type === 'TEACHING')
    const researchEvals = teacher.evaluations.filter((e: { type: string }) => e.type === 'RESEARCH')
    const serviceEvals = teacher.evaluations.filter((e: { type: string }) => e.type === 'SERVICE')
    const collaborationEvals = teacher.evaluations.filter((e: { type: string }) => e.type === 'COLLABORATION')
    const innovationEvals = teacher.evaluations.filter((e: { type: string }) => e.type === 'INNOVATION')

    const avgScore = (arr: typeof teachingEvals) => {
      if (arr.length === 0) return 0
      return arr.reduce((sum: number, e: { score: number }) => sum + e.score, 0) / arr.length
    }

    const abilityRadar = {
      teaching: Math.round(avgScore(teachingEvals) * 10) / 10,
      research: Math.round(avgScore(researchEvals) * 10) / 10,
      service: Math.round(avgScore(serviceEvals) * 10) / 10,
      collaboration: Math.round(avgScore(collaborationEvals) * 10) / 10,
      innovation: Math.round(avgScore(innovationEvals) * 10) / 10
    }

    const overallScore = Math.round(
      (abilityRadar.teaching * 0.3 +
        abilityRadar.research * 0.3 +
        abilityRadar.service * 0.15 +
        abilityRadar.collaboration * 0.1 +
        abilityRadar.innovation * 0.15) * 10
    ) / 10

    const tags: string[] = []
    if (overallScore >= 90) tags.push('教学名师')
    if (abilityRadar.research >= 85) tags.push('科研骨干')
    if (abilityRadar.service >= 80) tags.push('服务标兵')
    if (abilityRadar.innovation >= 85) tags.push('创新先锋')

    const updatedTeacher = await prisma.teacherProfile.update({
      where: { id },
      data: { abilityRadar, overallScore, tags }
    })

    res.json({ success: true, data: updatedTeacher, message: '评分计算成功' })
  } catch (error) {
    console.error('Calculate score error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getTeacherStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.teacherProfile.aggregate({
      _count: { id: true },
      _avg: { overallScore: true },
      _max: { overallScore: true },
      _min: { overallScore: true }
    })

    const collegeStats = await prisma.teacherProfile.groupBy({
      by: ['college'],
      _count: { id: true },
      _avg: { overallScore: true }
    })

    const titleStats = await prisma.teacherProfile.groupBy({
      by: ['title'],
      _count: { id: true }
    })

    res.json({
      success: true,
      data: {
        total: stats._count.id,
        avgScore: Math.round((stats._avg.overallScore || 0) * 10) / 10,
        maxScore: stats._max.overallScore,
        minScore: stats._min.overallScore,
        collegeDistribution: collegeStats,
        titleDistribution: titleStats
      },
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get teacher stats error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
