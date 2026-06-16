import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementStats
} from '../controllers/achievementController'
import { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireStudentOrAbove } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.get('/', authenticateToken, requireStudentOrAbove, getAllAchievements)

router.get('/stats', authenticateToken, requireStudentOrAbove, getAchievementStats)

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('成果ID不能为空')],
  validate,
  authenticateToken,
  requireStudentOrAbove,
  getAchievementById
)

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('成果标题不能为空'),
    body('type').isIn(['PAPER', 'PATENT', 'PROJECT', 'AWARD', 'OTHER']).withMessage('成果类型无效'),
    body('authors').notEmpty().withMessage('作者不能为空')
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  createAchievement
)

router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('成果ID不能为空'),
    body('title').notEmpty().withMessage('成果标题不能为空'),
    body('type').isIn(['PAPER', 'PATENT', 'PROJECT', 'AWARD', 'OTHER']).withMessage('成果类型无效')
  ],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  updateAchievement
)

router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('成果ID不能为空')],
  validate,
  authenticateToken,
  requireTeacherOrAdmin,
  deleteAchievement
)

export default router
