import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import { User, AdminLog } from '../types'

const roleMap: Record<string, string> = {
  TEACHER: '教师',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员'
}

interface UserWithPassword extends User {
  password?: string
}

export default function SystemPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Partial<UserWithPassword> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users')
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null)
  const [showLogDetail, setShowLogDetail] = useState(false)
  const queryClient = useQueryClient()

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getUsers()
  })

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => adminApi.getLogs()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleCreate = () => {
    setIsCreating(true)
    setEditingUser({})
    setShowModal(true)
  }

  const handleEdit = (user: User) => {
    setIsCreating(false)
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleResetPassword = (id: string) => {
    const password = prompt('请输入新密码：')
    if (password) {
      adminApi.resetPassword(id, password).then(() => {
        alert('密码重置成功')
      })
    }
  }

  const handleSave = async () => {
    if (isCreating && editingUser) {
      await adminApi.createUser({
        username: editingUser.username || '',
        password: editingUser.password || '',
        role: editingUser.role || 'TEACHER',
        email: editingUser.email,
        phone: editingUser.phone
      })
    } else if (editingUser?.id) {
      await adminApi.updateUser(editingUser.id, {
        username: editingUser.username || '',
        role: editingUser.role || 'TEACHER',
        email: editingUser.email,
        phone: editingUser.phone
      })
    }
    queryClient.invalidateQueries({ queryKey: ['users'] })
    setShowModal(false)
    setEditingUser(null)
    setIsCreating(false)
  }

  const handleViewLogDetail = (log: AdminLog) => {
    setSelectedLog(log)
    setShowLogDetail(true)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            用户管理
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'logs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            操作日志
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="p-4 border-b flex justify-end">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加用户
            </button>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center h-64">加载中...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4">用户名</th>
                    <th className="text-left py-3 px-4">角色</th>
                    <th className="text-left py-3 px-4">邮箱</th>
                    <th className="text-left py-3 px-4">电话</th>
                    <th className="text-left py-3 px-4">创建时间</th>
                    <th className="text-center py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.data?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4">{roleMap[user.role] || user.role}</td>
                      <td className="py-3 px-4">{user.email || '-'}</td>
                      <td className="py-3 px-4">{user.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                        >
                          重置密码
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <div className="overflow-x-auto">
          {logsLoading ? (
            <div className="flex items-center justify-center h-64">加载中...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4">操作</th>
                  <th className="text-left py-3 px-4">目标类型</th>
                  <th className="text-left py-3 px-4">目标ID</th>
                  <th className="text-left py-3 px-4">描述</th>
                  <th className="text-left py-3 px-4">操作人</th>
                  <th className="text-left py-3 px-4">操作时间</th>
                  <th className="text-center py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {logs?.data?.map((log) => {
                  const operator = users?.data?.find(u => u.id === log.operatorId)
                  return (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{log.action}</td>
                      <td className="py-3 px-4">{log.targetType}</td>
                      <td className="py-3 px-4">{log.targetId}</td>
                      <td className="py-3 px-4">{log.description || '-'}</td>
                      <td className="py-3 px-4">{operator?.username || '-'}</td>
                      <td className="py-3 px-4">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewLogDetail(log)}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-lg btn-ripple transition-all hover:shadow-lg hover:shadow-indigo-200"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{isCreating ? '添加用户' : '编辑用户'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingUser(null)
                  setIsCreating(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                关闭
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {isCreating && (
                <div>
                  <label className="block text-gray-700 mb-2">密码</label>
                  <input
                    type="password"
                    value={editingUser?.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 mb-2">角色</label>
                <select
                  value={editingUser?.role || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">请选择角色</option>
                  {Object.entries(roleMap).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">邮箱</label>
                <input
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">电话</label>
                <input
                  type="tel"
                  value={editingUser?.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isCreating ? '添加' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作日志详情模态框 */}
      {showLogDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => {
          setShowLogDetail(false)
          setSelectedLog(null)
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 modal-content overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">操作日志详情</h3>
              <button
                onClick={() => {
                  setShowLogDetail(false)
                  setSelectedLog(null)
                }}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-blue-600 text-sm font-medium">操作类型</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">{selectedLog.action}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-purple-600 text-sm font-medium">目标类型</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">{selectedLog.targetType}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-green-600 text-sm font-medium">目标ID</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">{selectedLog.targetId}</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4">
                  <div className="text-rose-600 text-sm font-medium">操作时间</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                <div className="text-amber-600 text-sm font-medium">操作人</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">
                  {users?.data?.find(u => u.id === selectedLog.operatorId)?.username || '-'}
                </div>
              </div>
              {selectedLog.description && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-3">操作描述</div>
                  <div className="text-gray-700 leading-relaxed">{selectedLog.description}</div>
                </div>
              )}
            </div>
            <div className="p-5 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowLogDetail(false)
                  setSelectedLog(null)
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-indigo-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
