export interface User {
  id: string
  username: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'
  email?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface TeacherProfile {
  id: string
  userId: string
  name: string
  avatar?: string
  title?: string
  department: string
  college: string
  education?: string
  major?: string
  hireDate?: string
  abilityRadar: {
    teaching: number
    research: number
    service: number
    collaboration: number
    innovation: number
  }
  tags: string[]
  overallScore: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  name: string
  code: string
  credit: number
  semester: string
  year: number
  teacherId: string
  createdAt: string
  updatedAt: string
}

export interface Evaluation {
  id: string
  type: 'TEACHING' | 'RESEARCH' | 'SERVICE' | 'COLLABORATION' | 'INNOVATION'
  score: number
  comment?: string
  evaluator: string
  evaluateDate: string
  teacherId: string
  courseId?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  title: string
  type: 'PAPER' | 'PATENT' | 'PROJECT' | 'AWARD' | 'OTHER'
  authors: string
  journal?: string
  publishDate?: string
  impactFactor?: number
  level?: string
  teacherId: string
  url?: string
  summary?: string
  keywords?: string
  createdAt: string
  updatedAt: string
}

export interface AdminLog {
  id: string
  action: string
  targetType: string
  targetId: string
  description?: string
  operatorId: string
  createdAt: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: string
      username: string
      role: string
      teacherProfile?: TeacherProfile
    }
  }
  message: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}
