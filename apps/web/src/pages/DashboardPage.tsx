import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { teacherApi, courseApi, evaluationApi, achievementApi } from '../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherApi.getAll()
  })

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll()
  })

  const { data: evaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationApi.getAll()
  })

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementApi.getAll()
  })

  if (teachersLoading || coursesLoading || evaluationsLoading || achievementsLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  const teacherCount = teachers?.data?.length || 0
  const courseCount = courses?.data?.length || 0
  const evaluationCount = evaluations?.data?.length || 0
  const achievementCount = achievements?.data?.length || 0

  const collegeStats = teachers?.data?.reduce((acc, t) => {
    acc[t.college] = (acc[t.college] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const titleStats = teachers?.data?.reduce((acc, t) => {
    acc[t.title || '其他'] = (acc[t.title || '其他'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const abilityData = teachers?.data?.[0]?.abilityRadar || {
    teaching: 0,
    research: 0,
    service: 0,
    collaboration: 0,
    innovation: 0
  }

  const radarOption = {
    title: { text: '能力雷达图', left: 'center' },
    tooltip: {},
    legend: { data: ['综合能力'], bottom: 10 },
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
        value: [abilityData.teaching, abilityData.research, abilityData.service, abilityData.collaboration, abilityData.innovation],
        name: '综合能力'
      }]
    }]
  }

  const collegeOption = {
    title: { text: '学院分布', left: 'center' },
    tooltip: {},
    legend: { bottom: 10 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(collegeStats || {}).map(([name, value]) => ({ name, value }))
    }]
  }

  const titleOption = {
    title: { text: '职称分布', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: Object.keys(titleStats || {}) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: Object.values(titleStats || {}) }]
  }

  const scoreDistribution = teachers?.data?.reduce((acc, t) => {
    const range = Math.floor(t.overallScore / 10) * 10
    acc[`${range}-${range + 9}`] = (acc[`${range}-${range + 9}`] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const scoreOption = {
    title: { text: '综合评分分布', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: Object.keys(scoreDistribution || {}) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: Object.values(scoreDistribution || {}) }]
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/teachers')}
        >
          <div className="text-gray-500 text-sm mb-2">教师总数</div>
          <div className="text-3xl font-bold text-blue-600">{teacherCount}</div>
        </div>
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:shadow-green-100 transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/courses')}
        >
          <div className="text-gray-500 text-sm mb-2">课程总数</div>
          <div className="text-3xl font-bold text-green-600">{courseCount}</div>
        </div>
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:shadow-purple-100 transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/evaluations')}
        >
          <div className="text-gray-500 text-sm mb-2">评价总数</div>
          <div className="text-3xl font-bold text-purple-600">{evaluationCount}</div>
        </div>
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/achievements')}
        >
          <div className="text-gray-500 text-sm mb-2">科研成果</div>
          <div className="text-3xl font-bold text-orange-600">{achievementCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts option={radarOption} style={{ height: '300px' }} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts option={collegeOption} style={{ height: '300px' }} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts option={titleOption} style={{ height: '300px' }} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts option={scoreOption} style={{ height: '300px' }} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">教师评分概览</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">姓名</th>
                <th className="text-left py-3 px-4">职称</th>
                <th className="text-left py-3 px-4">学院</th>
                <th className="text-right py-3 px-4">综合评分</th>
                <th className="text-left py-3 px-4">标签</th>
                <th className="text-center py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {teachers?.data?.slice(0, 5).map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{teacher.name}</td>
                  <td className="py-3 px-4">{teacher.title}</td>
                  <td className="py-3 px-4">{teacher.college}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {teacher.overallScore}
                  </td>
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
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => navigate(`/teachers?detail=${teacher.id}`)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-lg btn-ripple transition-all hover:shadow-lg hover:shadow-indigo-200"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
