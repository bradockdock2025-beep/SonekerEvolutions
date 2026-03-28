'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
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

type MobileTab = 'cards' | 'map' | 'vocab'

export default function ResultScreen() {
  const { result, setScreen } = useApp()
  const [activeSection, setActiveSection] = useState('all')
  const [leftWidth, setLeftWidth] = useState(50)
  const [mobileTab, setMobileTab] = useState<MobileTab>('cards')
  const [isMobile, setIsMobile] = useState(false)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const presentSections = result ? [...new Set(result.cards.map(c => c.section))] : []

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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

  // ── MOBILE LAYOUT ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="res-mob-root">
        <Topbar title={result.videoTitle} />

        {/* Compact video header */}
        <div className="mob-vid-header">
          <div className="mob-vid-thumb">
            {result.thumbnailUrl ? (
              <Image
                src={result.thumbnailUrl}
                alt={result.videoTitle}
                fill
                sizes="88px"
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1440,#0a0818)' }} />
            )}
            <div className="mob-vid-play-icon">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                <path d="M0 0L10 6L0 12V0Z" />
              </svg>
            </div>
          </div>
          <div className="mob-vid-info">
            <div className="mob-vid-title">{result.videoTitle}</div>
            <div className="mob-vid-meta">
              {result.channel && <span>{result.channel}</span>}
              {result.niche && (
                <>
                  <span className="mob-dot" />
                  <span style={{ color: 'var(--p2)' }}>{result.niche}</span>
                </>
              )}
            </div>
            <div className="mob-ai-indicator">
              <span className="mob-ai-dot" />
              <span className="mob-ai-text">
                <strong>{result.cards.length}</strong> concepts extracted
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mob-tabbar">
          <button
            className={`mob-tab-btn${mobileTab === 'cards' ? ' on' : ''}`}
            onClick={() => setMobileTab('cards')}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="3" y="9" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="3" y="15" width="9" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Cards
          </button>
          <button
            className={`mob-tab-btn${mobileTab === 'map' ? ' on' : ''}`}
            onClick={() => setMobileTab('map')}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="3.5" cy="5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="16.5" cy="5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="3.5" cy="15" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="16.5" cy="15" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7.3 8.3L5.1 6.4M12.7 8.3L14.9 6.4M7.3 11.7L5.1 13.6M12.7 11.7L14.9 13.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            Map
          </button>
          <button
            className={`mob-tab-btn${mobileTab === 'vocab' ? ' on' : ''}`}
            onClick={() => setMobileTab('vocab')}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 9h10M3 13h12M3 17h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Vocab
          </button>
        </div>

        {/* Tab content */}
        <div className="mob-tab-body">
          {mobileTab === 'cards' && (
            <div className="mob-cards-panel">
              <FilterBar
                active={activeSection}
                onChange={setActiveSection}
                count={result.cards.length}
                presentSections={presentSections}
              />
              <div className="mob-cards-scroll">
                <div className="k-list">
                  {filteredCards.map(card => (
                    <KnowledgeCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {mobileTab === 'map' && (
            <div className="mob-map-panel">
              <KnowledgeMap />
            </div>
          )}
          {mobileTab === 'vocab' && (
            <div className="mob-vocab-panel">
              <SmartVocabulary />
            </div>
          )}
        </div>

        <ExportBar />
        <SmartSelection />
        <DeepSearchPanel />
      </div>
    )
  }

  // ── DESKTOP LAYOUT (unchanged) ──────────────────────────────────────────────
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
