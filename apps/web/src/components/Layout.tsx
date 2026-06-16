import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const menuItems = [
  { path: '/dashboard', label: '仪表盘' },
  { path: '/teachers', label: '教师管理' },
  { path: '/courses', label: '课程管理' },
  { path: '/evaluations', label: '评价管理' },
  { path: '/achievements', label: '科研成果' },
  { path: '/system', label: '系统管理' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <div className="flex h-screen bg-gray-100">
      <aside 
        className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-gray-800 text-white flex flex-col transition-all duration-300`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!sidebarCollapsed && (
            <span className="text-lg font-bold">教师画像系统</span>
          )}
          {sidebarCollapsed && (
            <span className="text-lg">TDP</span>
          )}
        </div>
        
        <nav className="flex-1 py-4">
          {menuItems.filter(item => {
            if (item.path === '/system') return isAdmin
            return true
          }).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                location.pathname === item.path ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              {!sidebarCollapsed && <span>{item.label}</span>}
              {sidebarCollapsed && <span className="text-sm">{item.label[0]}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full mb-2 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            {sidebarCollapsed ? '展开' : '收起'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 rounded hover:bg-red-500"
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === location.pathname)?.label || '教师画像系统'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role})
            </span>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
