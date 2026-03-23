'use client'

import { useLanguage } from '@/context/LanguageContext'
import { LANGUAGES } from '@/data/locales'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
      role="group"
      aria-label="Select language"
    >
      {LANGUAGES.map(lang => {
        const active = lang.code === language
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            title={lang.nativeName}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 8px',
              borderRadius: 20,
              border: `1px solid ${active ? 'var(--p)' : 'var(--border)'}`,
              background: active ? 'rgba(108,95,255,0.12)' : 'transparent',
              color: active ? 'var(--p)' : 'var(--text3)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              letterSpacing: '0.04em',
              transition: 'all 0.15s ease',
              lineHeight: 1,
              height: 24,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        )
      })}
    </div>
  )
}
