'use client'

import { useState, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import type { VocabEntry } from '@/types'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
    >
      <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VocabCard({ entry }: { entry: VocabEntry }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`vc${open ? ' vc-open' : ''}`}>
      <button className="vc-header" onClick={() => setOpen(v => !v)}>
        <div className="vc-header-left">
          <span className="vc-badge">termo</span>
          <span className="vc-term">{entry.term}</span>
        </div>
        <span className="vc-chevron">
          <ChevronIcon open={open} />
        </span>
      </button>

      <div
        className="vc-body-wrap"
        style={{ maxHeight: open ? (bodyRef.current?.scrollHeight ?? 400) + 'px' : '0px' }}
      >
        <div className="vc-body" ref={bodyRef}>
          <p className="vc-def">{entry.definition}</p>
          {entry.points && entry.points.length > 0 && (
            <ul className="vc-pts">
              {entry.points.map((pt, i) => (
                <li key={i} className="vc-pt">{pt}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SmartVocabulary() {
  const { result } = useApp()
  const vocabulary: VocabEntry[] = result?.vocabulary ?? []

  return (
    <div className="kmap-block" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="blk-label">
        <div className="blk-label-l">
          <span className="blk-dot" style={{ background: 'var(--vocab)' }} />
          Smart Vocabulary
        </div>
        {vocabulary.length > 0 && (
          <span className="kmap-hint">{vocabulary.length} termos</span>
        )}
      </div>

      {vocabulary.length === 0 ? (
        <div style={{ padding: '10px 0 4px', fontSize: 11.5, color: 'var(--text3)' }}>
          Vocabulário disponível após análise.
        </div>
      ) : (
        <div className="vc-list">
          {vocabulary.map(entry => (
            <VocabCard key={entry.term} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
