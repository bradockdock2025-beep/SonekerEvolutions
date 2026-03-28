'use client'

import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import type { Screen } from '@/types'

export default function BottomNav() {
  const { screen, setScreen } = useApp()
  const { t } = useLanguage()
  const { user } = useAuth()

  const activeId = screen === 'loading' ? 'landing' : screen

  const NAV_ITEMS: { id: Screen; labelKey: 'nav_home' | 'nav_knowledge' | 'nav_library' | 'nav_account'; icon: React.ReactNode }[] = [
    {
      id: 'landing',
      labelKey: 'nav_home',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'result',
      labelKey: 'nav_knowledge',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'library',
      labelKey: 'nav_library',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 3h12a1 1 0 011 1v13l-5-3-3 2-5-2V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      labelKey: 'nav_account',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="bnav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`bn${activeId === item.id ? ' on' : ''}`}
          onClick={() => {
            if ((item.id === 'library' || item.id === 'profile') && !user) {
              setScreen('signin')
            } else {
              setScreen(item.id)
            }
          }}
          aria-label={t(item.labelKey)}
        >
          {item.icon}
          <span className="bn-l">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}
