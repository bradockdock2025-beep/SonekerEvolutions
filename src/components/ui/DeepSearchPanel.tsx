'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'

export default function DeepSearchPanel() {
  const { deepSearch, closeDeepSearch, triggerDeepSearch } = useApp()
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!deepSearch || deepSearch.phase !== 'done') return
    const { title, summary, points, examples } = deepSearch
    const lines = [
      title,
      '',
      summary,
      '',
      ...(Array.isArray(points) && points.length ? [`${t('dsp_points')}:`, ...points.map(p => `• ${p}`), ''] : []),
      ...(Array.isArray(examples) && examples.length ? [`${t('dsp_examples')}:`, ...examples.map(e => `→ ${e}`)] : []),
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!deepSearch) return null

  const { title, summary, points, examples, related, phase, error } = deepSearch

  return (
    <div className="dsp-overlay" onClick={e => e.target === e.currentTarget && closeDeepSearch()}>
      <div className="dsp">
        <div className="dsp-head">
          <div className="dsp-title-row">
            <span className="dsp-ai-dot" />
            <span className="dsp-label">AI Deep Search</span>
          </div>
          <button className="dsp-copy" onClick={handleCopy} aria-label="Copy">
            {copied ? '✓' : (
              <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
                <rect x="3.5" y="3.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1 7.5V1h6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <button className="dsp-close" onClick={closeDeepSearch} aria-label={t('sel_close')}>×</button>
        </div>

        {phase === 'loading' && (
          <div className="dsp-loading">
            <div className="dsp-spin" />
            <span>{t('dsp_loading')}</span>
          </div>
        )}

        {phase === 'error' && (
          <div className="dsp-error">
            {t('dsp_error')}{error ?? ''}
          </div>
        )}

        {phase === 'done' && (
          <div className="dsp-body">
            <div className="dsp-term-title">{title}</div>
            <p className="dsp-summary">{summary}</p>

            {Array.isArray(points) && points.length > 0 && (
              <div className="dsp-section">
                <div className="dsp-sec-label">{t('dsp_points')}</div>
                <ul className="dsp-list">
                  {points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            )}

            {Array.isArray(examples) && examples.length > 0 && (
              <div className="dsp-section">
                <div className="dsp-sec-label">{t('dsp_examples')}</div>
                <ul className="dsp-list examples">
                  {examples.map((ex, i) => <li key={i}>{ex}</li>)}
                </ul>
              </div>
            )}

            {Array.isArray(related) && related.length > 0 && (
              <div className="dsp-section">
                <div className="dsp-sec-label">{t('dsp_related')}</div>
                <div className="dsp-related">
                  {related.map((r, i) => (
                    <button
                      key={i}
                      className="dsp-rel-tag"
                      onClick={() => triggerDeepSearch(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
