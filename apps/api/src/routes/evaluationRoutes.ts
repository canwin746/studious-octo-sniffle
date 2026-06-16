import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationStats
} from '../controllers/evaluationController'
import { authenticateToken, requireAdmin, requireStudentOrAbove } from '../middleware/auth'
import { validate } from '../middleware/validation'

const router = Router()

router.get('/', authenticateToken, requireStudentOrAbove, getAllEvaluations)

router.get('/stats', authenticateToken, requireStudentOrAbove, getEvaluationStats)

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('评价ID不能为空')],
  validate,
  authenticateToken,
  requireStudentOrAbove,
  getEvaluationById
)

router.post(
  '/',
  [
    body('type').isIn(['TEACHING', 'RESEARCH', 'SERVICE', 'COLLABORATION', 'INNOVATION']).withMessage('评价类型无效'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('评分必须在0-100之间'),
    body('evaluator').notEmpty().withMessage('评价人不能为空'),
    body('teacherId').notEmpty().withMessage('教师ID不能为空')
  ],
  validate,
  authenticateToken,
  requireStudentOrAbove,
  createEvaluation
)

router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('评价ID不能为空'),
    body('type').isIn(['TEACHING', 'RESEARCH', 'SERVICE', 'COLLABORATION', 'INNOVATION']).withMessage('评价类型无效'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('评分必须在0-100之间')
  ],
  validate,
  authenticateToken,
  requireAdmin,
  updateEvaluation
)

router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('评价ID不能为空')],
  validate,
  authenticateToken,
  requireAdmin,
  deleteEvaluation
)

export default router
