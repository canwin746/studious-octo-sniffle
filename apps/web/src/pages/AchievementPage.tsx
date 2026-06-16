import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementApi, teacherApi } from '../services/api'
import { Achievement } from '../types'
import { useAuthStore } from '../store/authStore'
import { TableSkeleton } from '../components/Skeleton'

const achieveTypeMap: Record<string, string> = {
  PAPER: '论文',
  PATENT: '专利',
  PROJECT: '项目',
  AWARD: '奖项',
  OTHER: '其他'
}

export default function AchievementPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Partial<Achievement> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'basic' | 'full'>('basic')
  const queryClient = useQueryClient()
  const { user, teacherProfile } = useAuthStore()

  // 权限判断
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'
  const canEdit = (achievement: Achievement) => {
    if (isAdmin) return true
    if (isTeacher && teacherProfile?.id === achievement.teacherId) return true
    return false
  }
  const canDelete = (achievement: Achievement) => {
    if (isAdmin) return true
    if (isTeacher && teacherProfile?.id === achievement.teacherId) return true
    return false
  }
  const canCreate = isAdmin || isTeacher

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementApi.getAll()
  })

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherApi.getAll()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => achievementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    }
  })

  const handleCreate = () => {
    if (!canCreate) return
    setIsCreating(true)
    setEditingAchievement({})
    setShowModal(true)
  }

  const handleEdit = (achievement: Achievement) => {
    if (!canEdit(achievement)) return
    setIsCreating(false)
    setEditingAchievement(achievement)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!canDelete(achievements?.data?.find(a => a.id === id) as Achievement)) return
    if (confirm('确定要删除这项成果吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleViewDetail = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
  }

  const handleSave = async () => {
    if (isCreating && editingAchievement) {
      await achievementApi.create({
        title: editingAchievement.title || '',
        type: editingAchievement.type as any || 'PAPER',
        authors: editingAchievement.authors || '',
        journal: editingAchievement.journal,
        publishDate: editingAchievement.publishDate,
        impactFactor: editingAchievement.impactFactor,
        level: editingAchievement.level,
        teacherId: editingAchievement.teacherId || ''
      })
    } else if (editingAchievement?.id) {
      await achievementApi.update(editingAchievement.id, editingAchievement)
    }
    queryClient.invalidateQueries({ queryKey: ['achievements'] })
    setShowModal(false)
    setEditingAchievement(null)
    setIsCreating(false)
  }

  if (achievementsLoading || teachersLoading) {
    return <TableSkeleton rows={5} columns={7} />
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">科研成果列表</h2>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-ripple transition-all duration-200 hover:shadow-lg"
          >
            添加成果
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4">成果名称</th>
              <th className="text-left py-3 px-4">类型</th>
              <th className="text-left py-3 px-4">作者</th>
              <th className="text-left py-3 px-4">期刊/级别</th>
              <th className="text-left py-3 px-4">发表日期</th>
              <th className="text-left py-3 px-4">所属教师</th>
              {!isStudent && <th className="text-center py-3 px-4">操作</th>}
            </tr>
          </thead>
          <tbody>
            {achievements?.data?.map((achievement) => {
              const teacher = teachers?.data?.find(t => t.id === achievement.teacherId)
              return (
                <tr key={achievement.id} className="border-b table-row-hover">
                  <td className="py-3 px-4 font-medium">{achievement.title}</td>
                  <td className="py-3 px-4">{achieveTypeMap[achievement.type] || achievement.type}</td>
                  <td className="py-3 px-4">{achievement.authors}</td>
                  <td className="py-3 px-4">
                    {achievement.journal || achievement.level || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {achievement.publishDate ? new Date(achievement.publishDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">{teacher?.name || '-'}</td>
                  {!isStudent && (
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewDetail(achievement)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 btn-ripple transition-all duration-200"
                      >
                        详情
                      </button>
                      {canEdit(achievement) && (
                        <button
                          onClick={() => handleEdit(achievement)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2 btn-ripple transition-all duration-200"
                        >
                          编辑
                        </button>
                      )}
                      {canDelete(achievement) && (
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 btn-ripple transition-all duration-200"
                        >
                          删除
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => {
          setShowModal(false)
          setEditingAchievement(null)
          setIsCreating(false)
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden modal-content flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-white">{isCreating ? '添加成果' : '编辑成果'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingAchievement(null)
                  setIsCreating(false)
                }}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">成果名称</label>
                <input
                  type="text"
                  value={editingAchievement?.title || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                  placeholder="请输入成果名称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">成果类型</label>
                <select
                  value={editingAchievement?.type || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, type: e.target.value as 'PAPER' | 'PATENT' | 'PROJECT' | 'AWARD' | 'OTHER' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                >
                  <option value="">请选择类型</option>
                  {Object.entries(achieveTypeMap).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">作者</label>
                <input
                  type="text"
                  value={editingAchievement?.authors || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, authors: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                  placeholder="请输入作者姓名"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">期刊/项目名称</label>
                <input
                  type="text"
                  value={editingAchievement?.journal || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, journal: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="请输入期刊或项目名称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">发表/立项日期</label>
                <input
                  type="date"
                  value={editingAchievement?.publishDate?.split('T')[0] || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, publishDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">影响因子</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingAchievement?.impactFactor || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, impactFactor: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="请输入影响因子"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">级别</label>
                <input
                  type="text"
                  value={editingAchievement?.level || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="请输入成果级别"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">链接地址</label>
                <input
                  type="url"
                  value={editingAchievement?.url || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="请输入成果链接地址"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">关键词</label>
                <input
                  type="text"
                  value={editingAchievement?.keywords || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, keywords: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="多个关键词用逗号分隔"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">成果摘要</label>
                <textarea
                  value={editingAchievement?.summary || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, summary: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                  rows={3}
                  placeholder="请输入成果摘要"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">所属教师</label>
                <select
                  value={editingAchievement?.teacherId || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, teacherId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                >
                  <option value="">请选择教师</option>
                  {teachers?.data?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-5 bg-gray-50 border-t flex justify-end flex-shrink-0">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-green-200"
              >
                {isCreating ? '添加' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => setSelectedAchievement(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden modal-content" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">科研成果详情</h3>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            {/* 标签页切换 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveDetailTab('basic')}
                className={`flex-1 py-3 font-medium transition-all ${
                  activeDetailTab === 'basic' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                基本信息
              </button>
              <button
                onClick={() => setActiveDetailTab('full')}
                className={`flex-1 py-3 font-medium transition-all ${
                  activeDetailTab === 'full' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                完整内容
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[50vh]">
              {activeDetailTab === 'basic' ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                    <div className="text-emerald-600 text-sm font-medium">成果名称</div>
                    <div className="text-xl font-bold text-gray-800 mt-1">{selectedAchievement.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="text-green-600 text-sm font-medium">成果类型</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{achieveTypeMap[selectedAchievement.type] || selectedAchievement.type}</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
                      <div className="text-teal-600 text-sm font-medium">所属教师</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {teachers?.data?.find(t => t.id === selectedAchievement.teacherId)?.name || '-'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4">
                      <div className="text-cyan-600 text-sm font-medium">作者</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{selectedAchievement.authors}</div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4">
                      <div className="text-rose-600 text-sm font-medium">发表日期</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {selectedAchievement.publishDate ? new Date(selectedAchievement.publishDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4">
                      <div className="text-violet-600 text-sm font-medium">期刊/会议</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{selectedAchievement.journal || '-'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                      <div className="text-amber-600 text-sm font-medium">级别</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{selectedAchievement.level || '-'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 col-span-2">
                      <div className="text-blue-600 text-sm font-medium">影响因子</div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">{selectedAchievement.impactFactor || '-'}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* 成果标题 */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-gray-800">{selectedAchievement.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                          {achieveTypeMap[selectedAchievement.type]}
                        </span>
                        {selectedAchievement.level && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                            {selectedAchievement.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 作者信息 */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-500 mb-2">作者</h5>
                      <p className="text-gray-700">{selectedAchievement.authors}</p>
                    </div>

                    {/* 发表信息 */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-500 mb-2">发表信息</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500">期刊/会议：</span>
                          <span className="text-gray-700">{selectedAchievement.journal || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">发表日期：</span>
                          <span className="text-gray-700">
                            {selectedAchievement.publishDate ? new Date(selectedAchievement.publishDate).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">影响因子：</span>
                          <span className="text-blue-600 font-semibold">{selectedAchievement.impactFactor || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">所属教师：</span>
                          <span className="text-gray-700">
                            {teachers?.data?.find(t => t.id === selectedAchievement.teacherId)?.name || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 关键词 */}
                    {selectedAchievement.keywords && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">关键词</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedAchievement.keywords.split(',').map((keyword, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 摘要 */}
                    {selectedAchievement.summary && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">成果摘要</h5>
                        <p className="text-gray-700 leading-relaxed">{selectedAchievement.summary}</p>
                      </div>
                    )}

                    {/* 链接 */}
                    {selectedAchievement.url && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <h5 className="text-sm font-medium text-green-600 mb-3">查看原文</h5>
                        <a
                          href={selectedAchievement.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-green-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          点击跳转查看成果
                        </a>
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedAchievement.url.length > 50 ? selectedAchievement.url.substring(0, 50) + '...' : selectedAchievement.url}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="p-5 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-emerald-200"
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
