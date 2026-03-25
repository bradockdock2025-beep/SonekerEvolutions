'use client'

import { useApp } from '@/context/AppContext'
import type { VocabEntry } from '@/types'

export default function SmartVocabulary() {
  const { setLens, lens, result } = useApp()

  const vocabulary: VocabEntry[] = result?.vocabulary ?? []

  const handleMouseEnter = (entry: VocabEntry, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setLens({
      term: entry.term,
      definition: entry.definition,
      points: entry.points,
      x: rect.left,
      y: rect.top - 10,
    })
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    const related = e.relatedTarget
    if (related instanceof HTMLElement && related.closest('.klens')) return
    setLens(null)
  }

  const handleTap = (entry: VocabEntry, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (lens?.term === entry.term) {
      setLens(null)
    } else {
      setLens({
        term: entry.term,
        definition: entry.definition,
        points: entry.points,
        x: rect.left,
        y: rect.top - 10,
      })
    }
  }

  return (
    <div className="kmap-block" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="blk-label">
        <div className="blk-label-l">
          <span className="blk-dot" style={{ background: 'var(--vocab)' }} />
          Smart Vocabulary
        </div>
        <span className="kmap-hint">hover para definição rápida</span>
      </div>
      {vocabulary.length === 0 && (
        <div style={{ padding: '10px 0 4px', fontSize: 11.5, color: 'var(--text3)' }}>
          Vocabulário disponível após análise.
        </div>
      )}
      <div className="vocab-grid">
        {vocabulary.map(entry => (
          <div
            key={entry.term}
            className="vocab-pill"
            onMouseEnter={e => handleMouseEnter(entry, e)}
            onMouseLeave={handleMouseLeave}
            onClick={e => handleTap(entry, e)}
          >
            <span className="vocab-pill-dot" />
            {entry.term}
          </div>
        ))}
      </div>
    </div>
  )
}
