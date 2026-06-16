import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { Role } from '../middleware/auth'

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: { teacher: true },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ success: true, data: courses, message: '获取成功' })
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { teacher: true, evaluations: true }
    })

    if (!course) {
      return res.status(404).json({ success: false, message: '课程不存在' })
    }

    res.json({ success: true, data: course, message: '获取成功' })
  } catch (error) {
    console.error('Get course error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const createCourse = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { name, code, credit, semester, year, teacherId } = req.body

  try {
    let targetTeacherId = teacherId

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (!teacher) {
        return res.status(404).json({ success: false, message: '教师信息不存在' })
      }
      targetTeacherId = teacher.id
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        credit: parseFloat(credit) || 3,
        semester,
        year: parseInt(year),
        teacherId: targetTeacherId
      }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'CREATE_COURSE',
          targetType: 'Course',
          targetId: course.id,
          description: `创建课程: ${name}`,
          operatorId: userId!
        }
      })
    }

    res.status(201).json({ success: true, data: course, message: '创建成功' })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role
  const { name, code, credit, semester, year, teacherId } = req.body

  try {
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) {
      return res.status(404).json({ success: false, message: '课程不存在' })
    }

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (teacher && course.teacherId !== teacher.id) {
        return res.status(403).json({ success: false, message: '只能更新本人教授的课程' })
      }
    }

    let targetTeacherId = userRole === 'TEACHER' ? course.teacherId : teacherId

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { name, code, credit: parseFloat(credit) || 3, semester, year: parseInt(year), teacherId: targetTeacherId }
    })

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await prisma.adminLog.create({
        data: {
          action: 'UPDATE_COURSE',
          targetType: 'Course',
          targetId: updatedCourse.id,
          description: `更新课程: ${name}`,
          operatorId: userId!
        }
      })
    }

    res.json({ success: true, data: updatedCourse, message: '更新成功' })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id
  const userRole = req.user?.role as Role

  try {
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) {
      return res.status(404).json({ success: false, message: '课程不存在' })
    }

    if (userRole === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId } })
      if (teacher && course.teacherId !== teacher.id) {
        return res.status(403).json({ success: false, message: '只能删除本人教授的课程' })
      }
    }

    const deletedName = course.name

    await prisma.course.delete({ where: { id } })

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_COURSE',
        targetType: 'Course',
        targetId: id,
        description: `删除课程: ${deletedName}`,
        operatorId: userId!
      }
    })

    res.json({ success: true, data: null, message: '删除成功' })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

export const getCourseStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.course.aggregate({
      _count: { id: true },
      _sum: { credit: true }
    })

    const collegeStats = await prisma.course.groupBy({
      by: ['teacherId'],
      _count: { id: true }
    })

    const semesterStats = await prisma.course.groupBy({
      by: ['semester'],
      _count: { id: true }
    })

    res.json({
      success: true,
      data: {
        total: stats._count.id,
        totalCredits: stats._sum.credit,
        byTeacher: collegeStats,
        bySemester: semesterStats
      },
      message: '获取成功'
    })
  } catch (error) {
    console.error('Get course stats error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
