'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  initials: string
}

interface AuthContextType {
  user: User | null
  sendOtp: (email: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  updateUser: (name: string, email: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

function toUser(sb: { id: string; email?: string; user_metadata?: { name?: string; full_name?: string } }): User {
  const email    = sb.email ?? ''
  const name     = sb.user_metadata?.name ?? sb.user_metadata?.full_name ?? email.split('@')[0]
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  return { id: sb.id, name, email, initials }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(toUser(data.session.user))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? toUser(session.user) : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    return { error: error?.message ?? null }
  }

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { error: error?.message ?? null }
  }

  const updateUser = async (name: string, email: string) => {
    await supabase.auth.updateUser({ email, data: { name } })
    setUser(prev => prev ? {
      ...prev, name, email,
      initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    } : null)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
