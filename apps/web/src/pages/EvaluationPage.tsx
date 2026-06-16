import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationApi, teacherApi, courseApi } from '../services/api'
import { Evaluation } from '../types'
import { useAuthStore } from '../store/authStore'
import { TableSkeleton } from '../components/Skeleton'

const evalTypeMap: Record<string, string> = {
  TEACHING: '教学评价',
  RESEARCH: '科研评价',
  SERVICE: '服务评价',
  COLLABORATION: '协作评价',
  INNOVATION: '创新评价'
}

export default function EvaluationPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingEvaluation, setEditingEvaluation] = useState<Partial<Evaluation> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const queryClient = useQueryClient()
  const { user, teacherProfile } = useAuthStore()

  // 权限判断
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'

  // 筛选评价：教师可以看到所有评价
  const filterEvaluations = (evaluations: Evaluation[] | undefined) => {
    if (!evaluations) return []
    // 教师、学生和管理员都可以看到所有评价
    return evaluations
  }

  const canEdit = (evaluation: Evaluation) => {
    if (isAdmin) return true
    // 学生只能编辑自己的评价（通过评价人名称匹配）
    if (isStudent && evaluation.evaluator === user?.username) return true
    // 教师可以编辑自己创建的评价
    if (isTeacher && evaluation.evaluator === user?.username) return true
    return false
  }

  const canDelete = (evaluation: Evaluation) => {
    if (isAdmin) return true
    // 学生只能删除自己的评价
    if (isStudent && evaluation.evaluator === user?.username) return true
    // 教师可以删除自己创建的评价
    if (isTeacher && evaluation.evaluator === user?.username) return true
    return false
  }

  const canCreate = isAdmin || isStudent || isTeacher

  const { data: evaluationsData, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationApi.getAll()
  })

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherApi.getAll()
  })

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll()
  })

  const evaluations = filterEvaluations(evaluationsData?.data)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => evaluationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    }
  })

  const handleCreate = () => {
    if (!canCreate) return
    setIsCreating(true)
    setEditingEvaluation({ evaluator: user?.username || '' })
    setShowModal(true)
  }

  const handleEdit = (evaluation: Evaluation) => {
    if (!canEdit(evaluation)) return
    setIsCreating(false)
    setEditingEvaluation(evaluation)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!canDelete(evaluations.find(e => e.id === id) as Evaluation)) return
    if (confirm('确定要删除这条评价吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleViewDetail = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation)
  }

  const handleSave = async () => {
    if (isCreating && editingEvaluation) {
      await evaluationApi.create({
        type: editingEvaluation.type as 'TEACHING' | 'RESEARCH' | 'SERVICE' | 'COLLABORATION' | 'INNOVATION' || 'TEACHING',
        score: editingEvaluation.score || 0,
        comment: editingEvaluation.comment,
        evaluator: editingEvaluation.evaluator || user?.username || '',
        teacherId: editingEvaluation.teacherId || '',
        courseId: editingEvaluation.courseId,
        evaluateDate: new Date().toISOString()
      })
    } else if (editingEvaluation?.id) {
      await evaluationApi.update(editingEvaluation.id, editingEvaluation)
    }
    queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    setShowModal(false)
    setEditingEvaluation(null)
    setIsCreating(false)
  }

  if (evaluationsLoading || teachersLoading || coursesLoading) {
    return <TableSkeleton rows={5} columns={7} />
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">评价列表</h2>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-ripple transition-all duration-200 hover:shadow-lg"
          >
            添加评价
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4">评价类型</th>
              <th className="text-center py-3 px-4">评分</th>
              <th className="text-left py-3 px-4">评价人</th>
              <th className="text-left py-3 px-4">评价对象</th>
              <th className="text-left py-3 px-4">课程</th>
              <th className="text-left py-3 px-4">评价日期</th>
              <th className="text-center py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {evaluations?.map((evaluation) => {
              const teacher = teachers?.data?.find(t => t.id === evaluation.teacherId)
              const course = courses?.data?.find(c => c.id === evaluation.courseId)
              return (
                <tr key={evaluation.id} className="border-b table-row-hover">
                  <td className="py-3 px-4">{evalTypeMap[evaluation.type] || evaluation.type}</td>
                  <td className="py-3 px-4 text-center font-semibold">{evaluation.score}</td>
                  <td className="py-3 px-4">{evaluation.evaluator}</td>
                  <td className="py-3 px-4">{teacher?.name || '-'}</td>
                  <td className="py-3 px-4">{course?.name || '-'}</td>
                  <td className="py-3 px-4">
                    {new Date(evaluation.evaluateDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleViewDetail(evaluation)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 btn-ripple transition-all duration-200"
                    >
                      详情
                    </button>
                    {canEdit(evaluation) && (
                      <button
                        onClick={() => handleEdit(evaluation)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2 btn-ripple transition-all duration-200"
                      >
                        编辑
                      </button>
                    )}
                    {canDelete(evaluation) && (
                      <button
                        onClick={() => handleDelete(evaluation.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 btn-ripple transition-all duration-200"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => {
          setShowModal(false)
          setEditingEvaluation(null)
          setIsCreating(false)
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 modal-content overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{isCreating ? '添加评价' : '编辑评价'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEvaluation(null)
                  setIsCreating(false)
                }}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">评价类型</label>
                <select
                  value={editingEvaluation?.type || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, type: e.target.value as 'TEACHING' | 'RESEARCH' | 'SERVICE' | 'COLLABORATION' | 'INNOVATION' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                >
                  <option value="">请选择评价类型</option>
                  {Object.entries(evalTypeMap).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">评分 (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingEvaluation?.score || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, score: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">评价人</label>
                <input
                  type="text"
                  value={editingEvaluation?.evaluator || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, evaluator: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                  disabled={isStudent}
                  placeholder="请输入评价人姓名"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">评价对象</label>
                <select
                  value={editingEvaluation?.teacherId || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, teacherId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">关联课程 (可选)</label>
                <select
                  value={editingEvaluation?.courseId || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, courseId: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="">请选择课程</option>
                  {courses?.data?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">评价内容 (可选)</label>
                <textarea
                  value={editingEvaluation?.comment || ''}
                  onChange={(e) => setEditingEvaluation({ ...editingEvaluation, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  rows={4}
                  placeholder="请输入评价内容"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-blue-200"
                >
                  {isCreating ? '添加' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => setSelectedEvaluation(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 modal-content overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">评价详情</h3>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-blue-600 text-sm font-medium">评价类型</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">{evalTypeMap[selectedEvaluation.type] || selectedEvaluation.type}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                  <div className="text-amber-600 text-sm font-medium">评分</div>
                  <div className="text-3xl font-bold text-amber-600 mt-1">{selectedEvaluation.score}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-green-600 text-sm font-medium">评价人</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">{selectedEvaluation.evaluator}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-purple-600 text-sm font-medium">评价对象</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">
                    {teachers?.data?.find(t => t.id === selectedEvaluation.teacherId)?.name || '-'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4">
                  <div className="text-cyan-600 text-sm font-medium">关联课程</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">
                    {courses?.data?.find(c => c.id === selectedEvaluation.courseId)?.name || '-'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4">
                  <div className="text-rose-600 text-sm font-medium">评价日期</div>
                  <div className="text-lg font-semibold text-gray-800 mt-1">
                    {new Date(selectedEvaluation.evaluateDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {selectedEvaluation.comment && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-3">评价内容</div>
                  <div className="text-gray-700 leading-relaxed">{selectedEvaluation.comment}</div>
                </div>
              )}
            </div>
            <div className="p-5 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-indigo-200"
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
