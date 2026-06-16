import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { teacherApi, courseApi, evaluationApi, achievementApi } from '../services/api'
import { TeacherProfile, Course, Evaluation, Achievement } from '../types'
import { useAuthStore } from '../store/authStore'
import { TableSkeleton } from '../components/Skeleton'

export default function TeacherPage() {
  const [searchParams] = useSearchParams()
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Partial<TeacherProfile> | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const queryClient = useQueryClient()
  const { user, teacherProfile } = useAuthStore()

  // 权限判断
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'
  const canEdit = (teacherId: string) => {
    if (isAdmin) return true
    if (isTeacher && teacherProfile?.id === teacherId) return true
    return false
  }
  const canDelete = isAdmin

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherApi.getAll()
  })

  // 获取教师的课程、评价和成果
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll(),
    enabled: !!selectedTeacher
  })

  const { data: evaluations } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationApi.getAll(),
    enabled: !!selectedTeacher
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementApi.getAll(),
    enabled: !!selectedTeacher
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setSelectedTeacher(null)
    }
  })

  const calculateMutation = useMutation({
    mutationFn: (id: string) => teacherApi.calculateScore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    }
  })

  // 处理URL参数，自动打开详情模态框
  useEffect(() => {
    const detailId = searchParams.get('detail')
    if (detailId && teachers?.data) {
      const teacher = teachers.data.find(t => t.id === detailId)
      if (teacher) {
        setSelectedTeacher(teacher)
        setShowModal(true)
      }
    }
  }, [searchParams, teachers])

  const handleViewDetail = (teacher: TeacherProfile) => {
    setSelectedTeacher(teacher)
    setShowModal(true)
  }

  const handleEdit = (teacher: TeacherProfile) => {
    if (!canEdit(teacher.id)) return
    setEditingTeacher(teacher)
    setAvatarPreview(teacher.avatar || '')
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!canDelete) return
    if (confirm('确定要删除这位教师吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSave = async () => {
    if (editingTeacher?.id) {
      try {
        console.log('Saving teacher:', editingTeacher.id, { hasAvatar: !!editingTeacher.avatar })
        const response = await teacherApi.update(editingTeacher.id, editingTeacher)
        console.log('Response:', response)
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['teachers'] })
          alert('保存成功')
        } else {
          alert(response.message || '保存失败')
        }
      } catch (error) {
        console.error('Save error:', error)
        alert('保存失败：' + (error as Error).message)
      }
    }
    setShowModal(false)
    setEditingTeacher(null)
    setAvatarPreview('')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // 压缩图片
        compressImage(base64String, 800, 800).then(compressedBase64 => {
          setAvatarPreview(compressedBase64)
          if (editingTeacher) {
            setEditingTeacher({ ...editingTeacher, avatar: compressedBase64 })
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const compressImage = (base64String: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // 创建canvas并绘制压缩后的图片
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // 使用较低的质量压缩
          const compressed = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressed)
        } else {
          resolve(base64String)
        }
      }
      img.src = base64String
    })
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview('')
    if (editingTeacher) {
      setEditingTeacher({ ...editingTeacher, avatar: '' })
    }
  }

  const radarOption = selectedTeacher ? {
    title: { text: `${selectedTeacher.name} - 能力雷达图`, left: 'center' },
    tooltip: {},
    legend: { data: ['能力值'], bottom: 10 },
    radar: {
      indicator: [
        { name: '教学能力', max: 100 },
        { name: '科研能力', max: 100 },
        { name: '服务能力', max: 100 },
        { name: '协作能力', max: 100 },
        { name: '创新能力', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          selectedTeacher.abilityRadar.teaching,
          selectedTeacher.abilityRadar.research,
          selectedTeacher.abilityRadar.service,
          selectedTeacher.abilityRadar.collaboration,
          selectedTeacher.abilityRadar.innovation
        ],
        name: '能力值'
      }]
    }]
  } : null

  // 类型映射
  const evalTypeMap: Record<string, string> = {
    TEACHING: '教学评价',
    RESEARCH: '科研评价',
    SERVICE: '服务评价',
    COLLABORATION: '协作评价',
    INNOVATION: '创新评价'
  }

  const achieveTypeMap: Record<string, string> = {
    PAPER: '论文',
    PATENT: '专利',
    PROJECT: '项目',
    AWARD: '奖项',
    OTHER: '其他'
  }

  // 计算当前教师的课程、评价和成果
  const teacherCourses = selectedTeacher 
    ? (courses?.data || []).filter((c: Course) => c.teacherId === selectedTeacher.id)
    : []

  const teacherEvaluations = selectedTeacher
    ? (evaluations?.data || []).filter((e: Evaluation) => e.teacherId === selectedTeacher.id)
    : []

  const teacherAchievements = selectedTeacher
    ? (achievements?.data || []).filter((a: Achievement) => a.teacherId === selectedTeacher.id)
    : []

  // 计算评价统计
  const averageScore = teacherEvaluations.length > 0
    ? (teacherEvaluations.reduce((sum, e) => sum + e.score, 0) / teacherEvaluations.length).toFixed(1)
    : '0'

  const teachingCount = teacherEvaluations.filter(e => e.type === 'TEACHING').length
  const researchCount = teacherEvaluations.filter(e => e.type === 'RESEARCH').length

  if (isLoading) {
    return <TableSkeleton rows={8} columns={6} />
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">教师列表</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4">头像</th>
              <th className="text-left py-3 px-4">姓名</th>
              <th className="text-left py-3 px-4">职称</th>
              <th className="text-left py-3 px-4">学院</th>
              <th className="text-left py-3 px-4">部门</th>
              <th className="text-right py-3 px-4">综合评分</th>
              <th className="text-left py-3 px-4">标签</th>
              {!isStudent && <th className="text-center py-3 px-4">操作</th>}
            </tr>
          </thead>
          <tbody>
            {teachers?.data?.map((teacher) => (
              <tr key={teacher.id} className="border-b table-row-hover">
                <td className="py-3 px-4">
                  {teacher.avatar ? (
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {teacher.name.charAt(0)}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium">{teacher.name}</td>
                <td className="py-3 px-4">{teacher.title}</td>
                <td className="py-3 px-4">{teacher.college}</td>
                <td className="py-3 px-4">{teacher.department}</td>
                <td className="py-3 px-4 text-right font-semibold">{teacher.overallScore}</td>
                <td className="py-3 px-4">
                  {teacher.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                {!isStudent && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleViewDetail(teacher)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 btn-ripple transition-all duration-200"
                    >
                      详情
                    </button>
                    {canEdit(teacher.id) && (
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2 btn-ripple transition-all duration-200"
                      >
                        编辑
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 btn-ripple transition-all duration-200"
                      >
                        删除
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay" onClick={() => {
          setShowModal(false)
          setEditingTeacher(null)
          setAvatarPreview('')
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto modal-content" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editingTeacher ? '编辑教师信息' : `${selectedTeacher?.name} - 教师详情`}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingTeacher(null)
                  setAvatarPreview('')
                }}
                className="close-btn text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {editingTeacher ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">头像</label>
                    <div className="flex items-center gap-4">
                      {avatarPreview ? (
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="头像预览"
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
                          />
                          <button
                            onClick={handleRemoveAvatar}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 ring-4 ring-gray-50">
                          {editingTeacher.name?.charAt(0) || '头像'}
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 cursor-pointer inline-block btn-ripple transition-all"
                        >
                          上传头像
                        </label>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">姓名</label>
                        <input
                          type="text"
                          value={editingTeacher.name || ''}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">职称</label>
                        <input
                          type="text"
                          value={editingTeacher.title || ''}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">学院</label>
                        <input
                          type="text"
                          value={editingTeacher.college || ''}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, college: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">部门</label>
                        <input
                          type="text"
                          value={editingTeacher.department || ''}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">学历</label>
                    <select
                      value={editingTeacher.education || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, education: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                      <option value="">请选择学历</option>
                      <option value="专科">专科</option>
                      <option value="本科">本科</option>
                      <option value="硕士">硕士</option>
                      <option value="博士">博士</option>
                      <option value="博士后">博士后</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">专业</label>
                    <input
                      type="text"
                      value={editingTeacher.major || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, major: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="请输入专业名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">入职日期</label>
                    <input
                      type="date"
                      value={editingTeacher.hireDate ? new Date(editingTeacher.hireDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, hireDate: e.target.value ? new Date(e.target.value) : null })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">个人简介</label>
                    <textarea
                      value={editingTeacher.description || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                      rows={4}
                      placeholder="请输入个人简介"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleSave}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-indigo-200"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : selectedTeacher ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {selectedTeacher.avatar ? (
                        <img
                          src={selectedTeacher.avatar}
                          alt={selectedTeacher.name}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl ring-4 ring-white shadow-lg">
                          {selectedTeacher.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-800 mb-1">{selectedTeacher.name}</div>
                      <div className="text-indigo-600 font-medium">{selectedTeacher.title}</div>
                      <div className="text-gray-500 mt-1">{selectedTeacher.college} - {selectedTeacher.department}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="text-blue-600 text-sm font-medium">学历</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{selectedTeacher.education || '-'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="text-purple-600 text-sm font-medium">专业</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">{selectedTeacher.major || '-'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4">
                      <div className="text-rose-600 text-sm font-medium">入职日期</div>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {selectedTeacher.hireDate ? new Date(selectedTeacher.hireDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                      <div className="text-amber-600 text-sm font-medium">综合评分</div>
                      <div className="text-2xl font-bold text-amber-600 mt-1">{selectedTeacher.overallScore}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-gray-600 text-sm font-medium mb-3">标签</div>
                    {selectedTeacher.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-lg mr-2 mb-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-gray-600 text-sm font-medium mb-3">个人简介</div>
                    <p className="text-gray-700 leading-relaxed">{selectedTeacher.description || '暂无简介'}</p>
                  </div>

                  {/* 任教课程 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-600 text-sm font-medium">任教课程</div>
                      <span className="text-xs text-gray-400">共 {teacherCourses.length} 门</span>
                    </div>
                    <div className="space-y-2">
                      {teacherCourses.length > 0 ? (
                        teacherCourses.slice(0, 5).map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <div>
                              <div className="font-medium text-gray-800">{course.name}</div>
                              <div className="text-xs text-gray-500">{course.code} · {course.year}学年 {course.semester}学期 · {course.credit}学分</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">暂无任教课程</div>
                      )}
                    </div>
                    {teacherCourses.length > 5 && (
                      <div className="text-center mt-2 text-sm text-indigo-500 cursor-pointer hover:text-indigo-600">
                        查看全部 {teacherCourses.length} 门课程
                      </div>
                    )}
                  </div>

                  {/* 评价统计 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-600 text-sm font-medium">评价统计</div>
                      <span className="text-xs text-gray-400">共 {teacherEvaluations.length} 条</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{averageScore}</div>
                        <div className="text-xs text-blue-600">平均评分</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{teachingCount}</div>
                        <div className="text-xs text-green-600">教学评价</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{researchCount}</div>
                        <div className="text-xs text-purple-600">科研评价</div>
                      </div>
                    </div>
                    {teacherEvaluations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-500">最近评价:</div>
                        {teacherEvaluations.slice(0, 3).map((evalItem) => (
                          <div key={evalItem.id} className="p-2 bg-white rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{evalTypeMap[evalItem.type]}</span>
                              <span className="text-xs font-medium text-amber-600">{evalItem.score}分</span>
                            </div>
                            {evalItem.comment && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{evalItem.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 科研成果 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-600 text-sm font-medium">科研成果</div>
                      <span className="text-xs text-gray-400">共 {teacherAchievements.length} 项</span>
                    </div>
                    <div className="space-y-2">
                      {teacherAchievements.length > 0 ? (
                        teacherAchievements.slice(0, 5).map((achievement) => (
                          <div key={achievement.id} className="p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 line-clamp-1">{achievement.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded mr-2">
                                    {achieveTypeMap[achievement.type]}
                                  </span>
                                  {achievement.journal && <span>{achievement.journal}</span>}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{achievement.authors}</div>
                              </div>
                              {achievement.impactFactor && (
                                <div className="text-right">
                                  <div className="text-sm font-bold text-blue-600">{achievement.impactFactor}</div>
                                  <div className="text-xs text-gray-400">影响因子</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">暂无科研成果</div>
                      )}
                    </div>
                    {teacherAchievements.length > 5 && (
                      <div className="text-center mt-2 text-sm text-indigo-500 cursor-pointer hover:text-indigo-600">
                        查看全部 {teacherAchievements.length} 项成果
                      </div>
                    )}
                  </div>

                  {/* 能力雷达图 */}
                  {radarOption && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-gray-600 text-sm font-medium mb-3">能力雷达图</div>
                      <ReactECharts option={radarOption} style={{ height: '350px' }} />
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => calculateMutation.mutate(selectedTeacher.id)}
                      disabled={calculateMutation.isPending}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium btn-ripple transition-all hover:shadow-lg hover:shadow-green-200 disabled:opacity-50"
                    >
                      {calculateMutation.isPending ? '计算中...' : '重新计算评分'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
