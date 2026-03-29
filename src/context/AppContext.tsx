'use client'

import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'
import type { Screen, KnowledgeLensData, SmartSelectionData, AnalysisResult, DeepSearchResult } from '@/types'

interface AppContextType {
  screen: Screen
  setScreen: (s: Screen) => void
  urlInput: string
  setUrlInput: (v: string) => void
  mindMapOpen: boolean
  setMindMapOpen: (v: boolean) => void
  lens: KnowledgeLensData | null
  setLens: (v: KnowledgeLensData | null) => void
  selection: SmartSelectionData | null
  setSelection: (v: SmartSelectionData | null) => void
  // Analysis state
  result: AnalysisResult | null
  analysisError: string | null
  analysisReady: boolean
  startAnalysis: () => void
  // Deep search
  deepSearch: DeepSearchResult | null
  triggerDeepSearch: (term: string) => void
  openSavedDeepSearch: (entry: import('@/types').DeepSearchEntry) => void
  closeDeepSearch: () => void
  saveDeepSearch: () => Promise<void>
  isSavingDeepSearch: boolean
  // Library
  loadSavedAnalysis: (id: string) => void
  saveAnalysis: () => Promise<string | null>
  savedId: string | null
  isSaving: boolean
  // Map
  addConceptToMap: (term: string) => void
}

const AppContext = createContext<AppContextType>({} as AppContextType)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage()

  const [screen, setScreen] = useState<Screen>('landing')
  const [urlInput, setUrlInput] = useState('')
  const [mindMapOpen, setMindMapOpen] = useState(false)
  const [lens, setLens] = useState<KnowledgeLensData | null>(null)
  const [selection, setSelection] = useState<SmartSelectionData | null>(null)

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deepSearch, setDeepSearch] = useState<DeepSearchResult | null>(null)
  const [isSavingDeepSearch, setIsSavingDeepSearch] = useState(false)

  const triggerDeepSearch = async (term: string) => {
    setDeepSearch({ term, title: term, summary: '', points: [], examples: [], related: [], phase: 'loading' })

    try {
      // Check DB cache first
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const cacheUrl = new URL('/api/deep-search/save', window.location.origin)
      cacheUrl.searchParams.set('term', term)
      if (savedId) cacheUrl.searchParams.set('analysisId', savedId)
      const cacheRes = await fetch(cacheUrl.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (cacheRes.ok) {
        const cacheData = await cacheRes.json()
        if (cacheData.found && cacheData.result) {
          const r = cacheData.result
          setDeepSearch({
            term,
            title:    typeof r.title   === 'string' ? r.title   : term,
            summary:  typeof r.summary === 'string' ? r.summary : '',
            points:   Array.isArray(r.points)   ? r.points   : [],
            examples: Array.isArray(r.examples) ? r.examples : [],
            related:  Array.isArray(r.related)  ? r.related  : [],
            phase: 'done',
            savedId: cacheData.id,
          })
          return
        }
      }
    } catch { /* ignore cache errors, proceed to Claude */ }

    // Not cached — call Claude
    fetch('/api/deep-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, videoTitle: result?.videoTitle, niche: result?.niche, language }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('app_err_search'))
        setDeepSearch({
          term,
          title:    typeof data.title   === 'string' ? data.title   : term,
          summary:  typeof data.summary === 'string' ? data.summary : '',
          points:   Array.isArray(data.points)   ? data.points   : [],
          examples: Array.isArray(data.examples) ? data.examples : [],
          related:  Array.isArray(data.related)  ? data.related  : [],
          phase: 'done',
        })
      })
      .catch(err => {
        setDeepSearch(prev => prev ? { ...prev, phase: 'error', error: err.message } : null)
      })
  }

  const openSavedDeepSearch = (entry: import('@/types').DeepSearchEntry) => {
    const r = entry.result
    setDeepSearch({
      term:     entry.term,
      title:    typeof r.title   === 'string' ? r.title   : entry.term,
      summary:  typeof r.summary === 'string' ? r.summary : '',
      points:   Array.isArray(r.points)   ? r.points   : [],
      examples: Array.isArray(r.examples) ? r.examples : [],
      related:  Array.isArray(r.related)  ? r.related  : [],
      phase:    'done',
      savedId:  entry.id,
    })
  }

  const closeDeepSearch = () => setDeepSearch(null)

  const saveDeepSearch = async () => {
    if (!deepSearch || deepSearch.phase !== 'done' || deepSearch.savedId) return
    setIsSavingDeepSearch(true)
    try {
      // Ensure the main analysis is saved first and capture the id synchronously
      let currentAnalysisId = savedId
      if (result && !currentAnalysisId) {
        currentAnalysisId = await saveAnalysis()
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch('/api/deep-search/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          term:       deepSearch.term,
          videoTitle: result?.videoTitle ?? null,
          analysisId: currentAnalysisId ?? null,
          result: {
            title:    deepSearch.title,
            summary:  deepSearch.summary,
            points:   deepSearch.points,
            examples: deepSearch.examples,
            related:  deepSearch.related,
          },
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setDeepSearch(prev => prev ? { ...prev, savedId: data.id } : null)
    } finally {
      setIsSavingDeepSearch(false)
    }
  }

  const addConceptToMap = (term: string) => {
    if (!result) return
    const root = result.mapConcepts.find(c => c.isRoot) ?? result.mapConcepts[0]
    const newConcept: import('@/types').MapConceptRaw = {
      id: `user-${Date.now()}`,
      label: term.slice(0, 32),
      category: 'concept',
      isRoot: false,
      connections: [],
      connectionLabels: {},
      role: 'concept',
      centralQuestion: t('app_concept_manual', { term }),
    }
    const updatedRoot = root
      ? { ...root, connections: [...(root.connections ?? []), newConcept.id] }
      : root
    setResult(prev => {
      if (!prev) return prev
      const concepts = updatedRoot
        ? prev.mapConcepts.map(c => c.id === updatedRoot.id ? updatedRoot : c)
        : prev.mapConcepts
      return { ...prev, mapConcepts: [...concepts, newConcept] }
    })
  }

  const saveAnalysis = async (): Promise<string | null> => {
    if (!result) return null
    setIsSaving(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          videoId:      result.videoId ?? '',
          videoTitle:   result.videoTitle,
          channel:      result.channel,
          thumbnailUrl: result.thumbnailUrl,
          niche:        result.niche,
          nicheId:      result.nicheId,
          cardCount:    result.cards.length,
          language,
          result,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      const id = data.id ?? null
      setSavedId(id)
      return id
    } finally {
      setIsSaving(false)
    }
  }

  const loadSavedAnalysis = async (id: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    fetch(`/api/library/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setResult({ ...data, mapNodes: [], mapEdges: [] })
        setSavedId(id)
        setScreen('result')
      })
      .catch(err => console.error('Load analysis failed:', err))
  }

  const abortRef = useRef<AbortController | null>(null)

  // Restore pending URL after login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const pending = localStorage.getItem('pending_url')
        if (pending) {
          localStorage.removeItem('pending_url')
          setUrlInput(pending)
          setScreen('landing')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const startAnalysis = async () => {
    if (!urlInput.trim()) return

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    // Not authenticated — save URL and redirect to sign in
    if (!token) {
      localStorage.setItem('pending_url', urlInput.trim())
      setScreen('signin')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setResult(null)
    setAnalysisError(null)
    setAnalysisReady(false)
    setSavedId(null)
    setScreen('loading')

    fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url: urlInput.trim(), language }),
      signal: controller.signal,
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || t('app_err_analysis'))
        setResult({ ...data, mapNodes: [], mapEdges: [] })
        setAnalysisReady(true)
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setAnalysisError(err instanceof Error ? err.message : t('app_err_unknown'))
        setAnalysisReady(true)
      })
  }

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      urlInput, setUrlInput,
      mindMapOpen, setMindMapOpen,
      lens, setLens,
      selection, setSelection,
      result, analysisError, analysisReady,
      startAnalysis,
      deepSearch, triggerDeepSearch, openSavedDeepSearch, closeDeepSearch, saveDeepSearch, isSavingDeepSearch,
      saveAnalysis, loadSavedAnalysis, savedId, isSaving,
      addConceptToMap,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
