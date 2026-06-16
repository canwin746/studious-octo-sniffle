import { LoginResponse, ApiResponse, TeacherProfile, Course, Evaluation, Achievement, User, AdminLog } from '../types'

const BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:3001/api'

const getToken = () => localStorage.getItem('token')

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return response.json()
  },

  register: async (username: string, password: string, email?: string, phone?: string, role: string = 'STUDENT'): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, phone, role })
    })
    return response.json()
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  }
}

export const teacherApi = {
  getAll: async (): Promise<ApiResponse<TeacherProfile[]>> => {
    const response = await fetch(`${BASE_URL}/teachers`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getMe: async (): Promise<ApiResponse<TeacherProfile>> => {
    const response = await fetch(`${BASE_URL}/teachers/me`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getById: async (id: string): Promise<ApiResponse<TeacherProfile>> => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  create: async (data: Omit<TeacherProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TeacherProfile>> => {
    const response = await fetch(`${BASE_URL}/teachers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  update: async (id: string, data: Partial<TeacherProfile>): Promise<ApiResponse<TeacherProfile>> => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  calculateScore: async (id: string): Promise<ApiResponse<TeacherProfile>> => {
    const response = await fetch(`${BASE_URL}/teachers/${id}/calculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  }
}

export const courseApi = {
  getAll: async (): Promise<ApiResponse<Course[]>> => {
    const response = await fetch(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getById: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  create: async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Course>> => {
    const response = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  update: async (id: string, data: Partial<Course>): Promise<ApiResponse<Course>> => {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  }
}

export const evaluationApi = {
  getAll: async (): Promise<ApiResponse<Evaluation[]>> => {
    const response = await fetch(`${BASE_URL}/evaluations`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getById: async (id: string): Promise<ApiResponse<Evaluation>> => {
    const response = await fetch(`${BASE_URL}/evaluations/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  create: async (data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Evaluation>> => {
    const response = await fetch(`${BASE_URL}/evaluations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  update: async (id: string, data: Partial<Evaluation>): Promise<ApiResponse<Evaluation>> => {
    const response = await fetch(`${BASE_URL}/evaluations/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/evaluations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  }
}

export const achievementApi = {
  getAll: async (): Promise<ApiResponse<Achievement[]>> => {
    const response = await fetch(`${BASE_URL}/achievements`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getById: async (id: string): Promise<ApiResponse<Achievement>> => {
    const response = await fetch(`${BASE_URL}/achievements/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  create: async (data: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Achievement>> => {
    const response = await fetch(`${BASE_URL}/achievements`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  update: async (id: string, data: Partial<Achievement>): Promise<ApiResponse<Achievement>> => {
    const response = await fetch(`${BASE_URL}/achievements/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/achievements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  }
}

export const adminApi = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  getLogs: async (): Promise<ApiResponse<AdminLog[]>> => {
    const response = await fetch(`${BASE_URL}/admin/logs`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  createUser: async (data: { username: string; password: string; role: string; email?: string; phone?: string }): Promise<ApiResponse<User>> => {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  updateUser: async (id: string, data: { username: string; role: string; email?: string; phone?: string }): Promise<ApiResponse<User>> => {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    return response.json()
  },

  resetPassword: async (id: string, password: string): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ password })
    })
    return response.json()
  }
}
