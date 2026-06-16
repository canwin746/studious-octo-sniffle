import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllTeachers,
  getTeacherById,
  getMyProfile,
  updateMyProfile,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  calculateScore,
  getTeacherStats
} from '../controllers/teacherController'
import { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireStudentOrAbove } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.get('/', authenticateToken, requireStudentOrAbove, getAllTeachers)

router.get('/stats', authenticateToken, requireStudentOrAbove, getTeacherStats)

router.get('/me', authenticateToken, requireTeacherOrAdmin, getMyProfile)

router.put(
  '/me',
  [
    body('name').optional(),
    body('title').optional(),
    body('education').optional(),
    body('major').optional(),
    body('description').optional(),
    body('avatar').optional()
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  updateMyProfile
)

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('教师ID不能为空')],
  validate,
  authenticateToken,
  requireStudentOrAbove,
  getTeacherById
)

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('department').notEmpty().withMessage('部门不能为空'),
    body('college').notEmpty().withMessage('学院不能为空')
  ],
  validate,
  authenticateToken,
  requireAdmin,
  createTeacher
)

router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('教师ID不能为空')
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  updateTeacher
)

router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('教师ID不能为空')],
  validate,
  authenticateToken,
  requireAdmin,
  deleteTeacher
)

router.post(
  '/:id/calculate',
  [param('id').notEmpty().withMessage('教师ID不能为空')],
  validate,
  authenticateToken,
  requireAdmin,
  calculateScore
)

export default router
