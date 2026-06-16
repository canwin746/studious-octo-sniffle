import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseApi, teacherApi } from '../services/api'
import { Course } from '../types'
import { useAuthStore } from '../store/authStore'
import { TableSkeleton } from '../components/Skeleton'

export default function CoursePage() {
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()
  const { user, teacherProfile } = useAuthStore()

  // 权限判断
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'
  const canEdit = (course: Course) => {
    if (isAdmin) return true
    if (isTeacher && teacherProfile?.id === course.teacherId) return true
    return false
  }
  const canDelete = (course: Course) => {
    if (isAdmin) return true
    if (isTeacher && teacherProfile?.id === course.teacherId) return true
    return false
  }
  const canCreate = isAdmin || isTeacher

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll()
  })

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherApi.getAll()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })

  const handleCreate = () => {
    if (!canCreate) return
    setIsCreating(true)
    setEditingCourse({})
    setShowModal(true)
  }

  const handleEdit = (course: Course) => {
    if (!canEdit(course)) return
    setIsCreating(false)
    setEditingCourse(course)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!canDelete(courses?.data?.find(c => c.id === id) as Course)) return
    if (confirm('确定要删除这门课程吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSave = async () => {
    if (isCreating && editingCourse) {
      await courseApi.create({
        name: editingCourse.name || '',
        code: editingCourse.code || '',
        credit: editingCourse.credit || 3,
        semester: editingCourse.semester || '',
        year: editingCourse.year || new Date().getFullYear(),
        teacherId: editingCourse.teacherId || ''
      })
    } else if (editingCourse?.id) {
      await courseApi.update(editingCourse.id, editingCourse)
    }
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    setShowModal(false)
    setEditingCourse(null)
    setIsCreating(false)
  }

  if (coursesLoading || teachersLoading) {
    return <TableSkeleton rows={5} columns={6} />
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">课程列表</h2>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-ripple transition-all duration-200 hover:shadow-lg"
          >
            添加课程
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4">课程名称</th>
              <th className="text-left py-3 px-4">课程代码</th>
              <th className="text-center py-3 px-4">学分</th>
              <th className="text-left py-3 px-4">学年</th>
              <th className="text-left py-3 px-4">学期</th>
              <th className="text-left py-3 px-4">授课教师</th>
              {!isStudent && <th className="text-center py-3 px-4">操作</th>}
            </tr>
          </thead>
          <tbody>
            {courses?.data?.map((course) => {
              const teacher = teachers?.data?.find(t => t.id === course.teacherId)
              return (
                <tr key={course.id} className="border-b table-row-hover">
                  <td className="py-3 px-4 font-medium">{course.name}</td>
                  <td className="py-3 px-4">{course.code}</td>
                  <td className="py-3 px-4 text-center">{course.credit}</td>
                  <td className="py-3 px-4">{course.year}</td>
                  <td className="py-3 px-4">{course.semester}</td>
                  <td className="py-3 px-4">{teacher?.name || '-'}</td>
                  {!isStudent && (
                    <td className="py-3 px-4 text-center">
                      {canEdit(course) && (
                        <button
                          onClick={() => handleEdit(course)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2 btn-ripple transition-all duration-200"
                        >
                          编辑
                        </button>
                      )}
                      {canDelete(course) && (
                        <button
                          onClick={() => handleDelete(course.id)}
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
          setEditingCourse(null)
          setIsCreating(false)
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 modal-content overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{isCreating ? '添加课程' : '编辑课程'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCourse(null)
                  setIsCreating(false)
                }}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">课程名称</label>
                <input
                  type="text"
                  value={editingCourse?.name || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                  placeholder="请输入课程名称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">课程代码</label>
                <input
                  type="text"
                  value={editingCourse?.code || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                  placeholder="请输入课程代码"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">学分</label>
                <input
                  type="number"
                  value={editingCourse?.credit || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, credit: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="请输入学分"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">学年</label>
                <input
                  type="number"
                  value={editingCourse?.year || new Date().getFullYear()}
                  onChange={(e) => setEditingCourse({ ...editingCourse, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">学期</label>
                <select
                  value={editingCourse?.semester || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, semester: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                >
                  <option value="">请选择学期</option>
                  <option value="秋季">秋季</option>
                  <option value="春季">春季</option>
                  <option value="夏季">夏季</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">授课教师</label>
                <select
                  value={editingCourse?.teacherId || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, teacherId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
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
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-orange-200"
                >
                  {isCreating ? '添加' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
