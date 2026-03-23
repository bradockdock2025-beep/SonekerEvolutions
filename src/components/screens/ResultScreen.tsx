'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import Topbar from '@/components/result/Topbar'
import VideoPlayer from '@/components/result/VideoPlayer'
import KnowledgeMap from '@/components/result/KnowledgeMap'
import SmartVocabulary from '@/components/result/SmartVocabulary'
import KnowledgeCard from '@/components/result/KnowledgeCard'
import FilterBar from '@/components/result/FilterBar'
import ExportBar from '@/components/result/ExportBar'
import SmartSelection from '@/components/ui/SmartSelection'
import DeepSearchPanel from '@/components/ui/DeepSearchPanel'

export default function ResultScreen() {
  const { result, setScreen } = useApp()
  const [activeSection, setActiveSection] = useState('all')
  const [leftWidth, setLeftWidth] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const presentSections = result ? [...new Set(result.cards.map(c => c.section))] : []

  useEffect(() => {
    if (!result) return
    const prev = document.title
    document.title = `${result.videoTitle} — Soneker`
    return () => { document.title = prev }
  }, [result?.videoTitle])

  useEffect(() => {
    if (activeSection !== 'all' && !(presentSections as string[]).includes(activeSection)) {
      setActiveSection('all')
    }
  }, [activeSection, presentSections])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftWidth(Math.min(Math.max(pct, 20), 80))
    }

    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  if (!result) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, color: 'var(--text3)' }}>
        <span style={{ fontSize: 13 }}>Nenhuma análise disponível.</span>
        <button className="bsm p" onClick={() => setScreen('landing')}>← Novo vídeo</button>
      </div>
    )
  }

  const filteredCards = activeSection === 'all'
    ? result.cards
    : result.cards.filter(c => c.section === activeSection)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar title={result.videoTitle} />

      <div className="res-body" ref={containerRef}>
        <div className="panel-l" style={{ flex: `0 0 ${leftWidth}%`, maxWidth: `${leftWidth}%` }}>
          <VideoPlayer />
          <KnowledgeMap />
          <SmartVocabulary />
        </div>

        <div className="split-divider" onMouseDown={onMouseDown} />

        <div className="panel-r">
          <FilterBar
            active={activeSection}
            onChange={setActiveSection}
            count={result.cards.length}
            presentSections={presentSections}
          />
          <div className="k-scroll">
            <div className="k-list">
              {filteredCards.map(card => (
                <KnowledgeCard key={card.id} card={card} />
              ))}
            </div>
          </div>
          <ExportBar />
        </div>
      </div>

      <SmartSelection />
      <DeepSearchPanel />
    </div>
  )
}
