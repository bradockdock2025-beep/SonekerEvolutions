'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface LibraryEntry {
  id: string
  created_at: string
  video_id: string
  video_title: string
  channel: string
  thumbnail_url: string | null
  niche: string | null
  card_count: number
}

export default function LibraryScreen() {
  const { setScreen, loadSavedAnalysis } = useApp()
  const { t, locale } = useLanguage()
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleOpen = (id: string) => {
    setLoadingId(id)
    loadSavedAnalysis(id)
  }

  const countLabel = loading
    ? t('lib_loading')
    : t(entries.length === 1 ? 'lib_count_singular' : 'lib_count_plural', { n: entries.length })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="lib-top">
        <div className="tb-logo">
          <div className="tb-dot" />
          Soneker
        </div>
        <ThemeToggle style={{ marginLeft: 'auto', marginRight: 8 }} />
        <button className="bsm" onClick={() => setScreen('landing')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t('lib_new_video')}</span>
        </button>
      </div>

      <div className="lib-body">
        <div className="lib-h">
          <div>
            <div className="lib-title">{t('lib_title')}</div>
            <div className="lib-sub">{countLabel}</div>
          </div>
          <button className="bsm p" onClick={() => setScreen('landing')}>{t('lib_new_short')}</button>
        </div>

        {!loading && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: 13 }}>
            {t('lib_empty')}<br />
            <button className="bsm p" style={{ marginTop: 16 }} onClick={() => setScreen('landing')}>
              {t('lib_first_video')}
            </button>
          </div>
        )}

        <div className="lib-grid">
          {entries.map(entry => (
            <div
              key={entry.id}
              className={`lib-card${loadingId === entry.id ? ' loading' : ''}`}
              onClick={() => handleOpen(entry.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleOpen(entry.id)}
            >
              <div className="lib-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                {entry.thumbnail_url ? (
                  <Image
                    src={entry.thumbnail_url}
                    alt={entry.video_title}
                    fill
                    sizes="200px"
                    style={{ objectFit: 'cover', opacity: 0.7 }}
                    unoptimized
                  />
                ) : (
                  <div className="lib-thumb-bg" style={{ background: 'linear-gradient(135deg, #1a1630 0%, #0e1e1a 100%)' }} />
                )}
                <div className="lib-tplay">
                  {loadingId === entry.id
                    ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    : <div className="lib-tri" />
                  }
                </div>
              </div>
              <div className="lib-card-t">{entry.video_title}</div>
              <div className="lib-meta">
                <span className="lib-chan">{entry.channel}</span>
                <span className="lib-cnt">{entry.card_count} {t('lib_extracted')}</span>
              </div>
              <div className="lib-tags">
                {entry.niche && <span className="lib-tag">{entry.niche}</span>}
                <span className="lib-tag" style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                  {new Date(entry.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
