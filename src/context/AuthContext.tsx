'use client'

import { createContext, useContext, useState } from 'react'

interface User {
  name: string
  email: string
  initials: string
}

interface AuthContextType {
  user: User | null
  isAuthOpen: boolean
  authMode: 'signin' | 'signup'
  authReason: string
  openAuth: (mode?: 'signin' | 'signup', reason?: string) => void
  closeAuth: () => void
  mockSignIn: (name: string, email: string) => void
  updateUser: (name: string, email: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authReason, setAuthReason] = useState('')

  const openAuth = (mode: 'signin' | 'signup' = 'signin', reason = '') => {
    setAuthMode(mode)
    setAuthReason(reason)
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    setIsAuthOpen(false)
    setAuthReason('')
  }

  const mockSignIn = (name: string, email: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    setUser({ name, email, initials })
    setIsAuthOpen(false)
    setAuthReason('')
  }

  const updateUser = (name: string, email: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    setUser({ name, email, initials })
  }

  const signOut = () => setUser(null)

  return (
    <AuthContext.Provider value={{
      user, isAuthOpen, authMode, authReason,
      openAuth, closeAuth, mockSignIn, updateUser, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
