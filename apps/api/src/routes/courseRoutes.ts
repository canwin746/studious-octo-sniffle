import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats
} from '../controllers/courseController'
import { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireStudentOrAbove } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.get('/', authenticateToken, requireStudentOrAbove, getAllCourses)

router.get('/stats', authenticateToken, requireStudentOrAbove, getCourseStats)

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('课程ID不能为空')],
  validate,
  authenticateToken,
  requireStudentOrAbove,
  getCourseById
)

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('课程名称不能为空'),
    body('code').notEmpty().withMessage('课程代码不能为空'),
    body('year').notEmpty().withMessage('年份不能为空'),
    body('semester').notEmpty().withMessage('学期不能为空')
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  createCourse
)

router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('课程ID不能为空'),
    body('name').notEmpty().withMessage('课程名称不能为空')
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  updateCourse
)

router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('课程ID不能为空')],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  deleteCourse
)

export default router
