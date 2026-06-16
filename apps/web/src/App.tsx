import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import { teacherApi } from './services/api'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TeacherPage from './pages/TeacherPage'
import CoursePage from './pages/CoursePage'
import EvaluationPage from './pages/EvaluationPage'
import AchievementPage from './pages/AchievementPage'
import SystemPage from './pages/SystemPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, user, token, setProfile } = useAuthStore()

  // 应用启动时加载教师信息
  useEffect(() => {
    if (isAuthenticated && token && user?.role === 'TEACHER') {
      teacherApi.getMe().then(response => {
        if (response.success && response.data) {
          setProfile(response.data)
        }
      }).catch(console.error)
    }
  }, [isAuthenticated, token, user?.role, setProfile])

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/teachers" element={
          <ProtectedRoute>
            <Layout>
              <TeacherPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={
          <ProtectedRoute>
            <Layout>
              <CoursePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/evaluations" element={
          <ProtectedRoute>
            <Layout>
              <EvaluationPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/achievements" element={
          <ProtectedRoute>
            <Layout>
              <AchievementPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/system" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <SystemPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
