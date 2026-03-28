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
  closeDeepSearch: () => void
  // Library
  loadSavedAnalysis: (id: string) => void
  saveAnalysis: () => Promise<void>
  savedId: string | null   // ID of the saved analysis (null = not saved yet)
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

  const triggerDeepSearch = (term: string) => {
    setDeepSearch({ term, title: term, summary: '', points: [], examples: [], related: [], phase: 'loading' })
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

  const closeDeepSearch = () => setDeepSearch(null)

  const addConceptToMap = (term: string) => {
    if (!result) return
    const root = result.mapConcepts.find(c => c.isRoot) ?? result.mapConcepts[0]
    const newConcept = {
      id: `user-${Date.now()}`,
      label: term.slice(0, 32),
      category: 'concept' as const,
      isRoot: false,
      connections: [],
      definition: t('app_concept_manual', { term }),
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

  const saveAnalysis = async () => {
    if (!result) return
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
          result,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setSavedId(data.id ?? null)
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
      deepSearch, triggerDeepSearch, closeDeepSearch,
      saveAnalysis, loadSavedAnalysis, savedId, isSaving,
      addConceptToMap,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
