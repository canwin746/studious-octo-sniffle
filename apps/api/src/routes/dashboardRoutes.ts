import { Router } from 'express'
import { getDashboard } from '../controllers/dashboardController'
import { authenticateToken, requireStudentOrAbove } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, requireStudentOrAbove, getDashboard)

export default router
