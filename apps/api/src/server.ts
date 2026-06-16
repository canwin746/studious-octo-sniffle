import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import teacherRoutes from './routes/teacherRoutes'
import courseRoutes from './routes/courseRoutes'
import evaluationRoutes from './routes/evaluationRoutes'
import achievementRoutes from './routes/achievementRoutes'
import adminRoutes from './routes/adminRoutes'
import dashboardRoutes from './routes/dashboardRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/evaluations', evaluationRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: '服务正常' })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
