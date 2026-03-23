'use client'

import { useToast } from '@/context/ToastContext'

export default function Toast() {
  const { toast } = useToast()

  return (
    <div className={`toast${toast.visible ? ' on' : ''}`} role="status" aria-live="polite">
      <div className="toast-icon">{toast.icon}</div>
      <span>{toast.message}</span>
    </div>
  )
}
