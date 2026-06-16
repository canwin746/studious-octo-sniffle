import { Router } from 'express'
import { body } from 'express-validator'
import { login, register, getProfile } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validate,
  login
)

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50字符之间'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 100 }).withMessage('密码长度必须在6-100字符之间'),
    body('email').isEmail().withMessage('邮箱格式不正确').optional(),
    body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确').optional(),
    body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN']).withMessage('角色无效').optional()
  ],
  validate,
  register
)

router.get('/profile', authenticateToken, getProfile)

export default router
