'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Language, Locale } from '@/data/locales'
import { pt } from '@/data/locales/pt'
import { en } from '@/data/locales/en'
import { fr } from '@/data/locales/fr'
import { de } from '@/data/locales/de'

// ── Locale registry ───────────────────────────────────────────────────────────

const LOCALES: Record<Language, Locale> = { pt, en, fr, de }

// ── Auto-detect from browser ──────────────────────────────────────────────────

function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('pt')) return 'pt'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('de')) return 'de'
  return 'en'
}

// ── Context ───────────────────────────────────────────────────────────────────

interface LanguageContextType {
  language: Language
  setLanguage: (l: Language) => void
  /** Translate a key, optionally replacing {var} placeholders */
  t: (key: keyof Locale, vars?: Record<string, string | number>) => string
  /** BCP-47 locale string for date formatting, e.g. 'pt-PT' */
  locale: string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key as string,
  locale: 'en-GB',
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('soneker-language') as Language | null
    const valid: Language[] = ['pt', 'en', 'fr', 'de']
    const initial = (stored && valid.includes(stored)) ? stored : detectLanguage()
    setLanguageState(initial)
    document.documentElement.lang = initial
  }, [])

  const setLanguage = (l: Language) => {
    setLanguageState(l)
    localStorage.setItem('soneker-language', l)
    document.documentElement.lang = l
  }

  const t = (key: keyof Locale, vars?: Record<string, string | number>): string => {
    let str = LOCALES[language][key] ?? (key as string)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  const locale = LOCALES[language].date_locale

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
