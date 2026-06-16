import { create } from 'zustand'
import { User, TeacherProfile } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  teacherProfile: TeacherProfile | null
  isAuthenticated: boolean
  login: (token: string, user: User, profile?: TeacherProfile) => void
  logout: () => void
  setProfile: (profile: TeacherProfile) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  teacherProfile: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user, profile) => {
    localStorage.setItem('token', token)
    set({ 
      token, 
      user, 
      teacherProfile: profile || null, 
      isAuthenticated: true 
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ 
      user: null, 
      token: null, 
      teacherProfile: null, 
      isAuthenticated: false 
    })
  },

  setProfile: (profile) => {
    set({ teacherProfile: profile })
  }
}))
