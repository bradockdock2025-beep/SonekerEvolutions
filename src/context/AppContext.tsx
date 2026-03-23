'use client'

import { createContext, useContext, useState, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
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
    await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  }

  const loadSavedAnalysis = (id: string) => {
    fetch(`/api/library/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setResult({ ...data, mapNodes: [], mapEdges: [] })
        setScreen('result')
      })
      .catch(err => console.error('Load analysis failed:', err))
  }

  const abortRef = useRef<AbortController | null>(null)

  const startAnalysis = () => {
    if (!urlInput.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setResult(null)
    setAnalysisError(null)
    setAnalysisReady(false)
    setScreen('loading')

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      saveAnalysis, loadSavedAnalysis, addConceptToMap,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
