'use client'

import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface ThemeToggleProps {
  style?: React.CSSProperties
}

export default function ThemeToggle({ style }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={t('theme_title')}
      style={style}
      aria-label={t('theme_title')}
    >
      {theme === 'light' ? (
        <svg viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M11.5 8.5A5 5 0 015.5 2.5a5 5 0 000 9 5 5 0 006-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}
