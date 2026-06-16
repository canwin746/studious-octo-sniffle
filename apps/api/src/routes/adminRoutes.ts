import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllLogs,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
} from '../controllers/adminController'
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.get('/logs', authenticateToken, requireAdmin, getAllLogs)

router.get('/users', authenticateToken, requireAdmin, getAllUsers)

router.post(
  '/users',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']).withMessage('角色无效')
  ],
  validate,
  authenticateToken,
  requireSuperAdmin,
  createUser
)

router.put(
  '/users/:id',
  [
    param('id').notEmpty().withMessage('用户ID不能为空'),
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']).withMessage('角色无效')
  ],
  validate,
  authenticateToken,
  requireSuperAdmin,
  updateUser
)

router.delete(
  '/users/:id',
  [param('id').notEmpty().withMessage('用户ID不能为空')],
  validate,
  authenticateToken,
  requireSuperAdmin,
  deleteUser
)

router.post(
  '/users/:id/reset-password',
  [
    param('id').notEmpty().withMessage('用户ID不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validate,
  authenticateToken,
  requireAdmin,
  resetPassword
)

export default router
