'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

interface ToastState {
  message: string
  icon: string
  visible: boolean
}

interface ToastContextType {
  showToast: (message: string, icon?: string) => void
  toast: ToastState
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  toast: { message: '', icon: '', visible: false },
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', icon: '', visible: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, icon = '✓') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, icon, visible: true })
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
