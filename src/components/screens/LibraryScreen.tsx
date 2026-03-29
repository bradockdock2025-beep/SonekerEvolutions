'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useApp }      from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'
import { supabase }    from '@/lib/supabase'
import ThemeToggle     from '@/components/ui/ThemeToggle'
import type { DeepSearchEntry } from '@/types'

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

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function OrphanGroup({
  title,
  items,
  locale,
  onOpen,
}: {
  title: string
  items: DeepSearchEntry[]
  locale: string
  onOpen: (entry: DeepSearchEntry) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lib-ds-group">
      <button className={`lib-ds-group-header clickable${open ? ' open' : ''}`} onClick={() => setOpen(v => !v)}>
        <svg className="lib-ds-group-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <rect x="1" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M3.5 4h4M3.5 6.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
        <span className="lib-ds-group-title">{title}</span>
        <span className="lib-ds-group-count">{items.length}</span>
      </button>
      <div className={`collapsible-grid${open ? ' open' : ''}`}>
        <div className="collapsible-inner">
          <div className="lib-ds-list">
            {items.map(entry => (
              <div
                key={entry.id}
                className="lib-ds-card"
                onClick={() => onOpen(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onOpen(entry)}
              >
                <div className="lib-ds-top">
                  <span className="lib-ds-badge">AI Deep Search</span>
                  <span className="lib-ds-date">
                    {new Date(entry.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div className="lib-ds-term">{entry.term}</div>
                {entry.result?.summary && (
                  <div className="lib-ds-summary">{entry.result.summary}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExplorationSection({
  searches,
  onOpen,
}: {
  searches: DeepSearchEntry[]
  onOpen: (entry: DeepSearchEntry) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="lib-exp-divider" />
      <button
        className={`lib-exp-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <ChevronIcon />
        <span>{searches.length} exploraç{searches.length === 1 ? 'ão' : 'ões'}</span>
        <span className="lib-exp-count">{searches.length}</span>
      </button>
      <div className={`collapsible-grid${open ? ' open' : ''}`}>
        <div className="collapsible-inner">
          <div className="lib-exp-list">
            {searches.map(entry => (
              <button
                key={entry.id}
                className="lib-exp-item"
                onClick={() => onOpen(entry)}
              >
                <span className="lib-exp-dot" />
                <span className="lib-exp-term">{entry.term}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LibraryScreen() {
  const { setScreen, loadSavedAnalysis, openSavedDeepSearch } = useApp()
  const { t, locale } = useLanguage()
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [deepEntries, setDeepEntries] = useState<DeepSearchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'analyses' | 'searches'>('analyses')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const [libRes, deepRes] = await Promise.all([
        fetch('/api/library', { headers }),
        fetch('/api/deep-search/list', { headers }),
      ])
      if (cancelled) return
      const libData = await libRes.json()
      const deepData = await deepRes.json()
      setEntries(Array.isArray(libData) ? libData : [])
      setDeepEntries(Array.isArray(deepData) ? deepData : [])
      setLoading(false)
    }
    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Group deep searches by analysis_id
  const deepByAnalysis = deepEntries.reduce<Record<string, DeepSearchEntry[]>>((acc, entry) => {
    if (!entry.analysis_id) return acc
    if (!acc[entry.analysis_id]) acc[entry.analysis_id] = []
    acc[entry.analysis_id].push(entry)
    return acc
  }, {})


  const handleOpen = (id: string) => {
    setLoadingId(id)
    loadSavedAnalysis(id)
  }

  const handleOpenDeepSearch = (entry: DeepSearchEntry) => {
    // Load the linked analysis first so the result screen has context
    if (entry.analysis_id) {
      loadSavedAnalysis(entry.analysis_id)
    } else {
      setScreen('result')
    }
    openSavedDeepSearch(entry)
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

        {/* Tabs */}
        <div className="lib-tabs">
          <button className={`lib-tab${tab === 'analyses' ? ' active' : ''}`} onClick={() => setTab('analyses')}>
            Análises
            {entries.length > 0 && <span className="lib-tab-count">{entries.length}</span>}
          </button>
          <button className={`lib-tab${tab === 'searches' ? ' active' : ''}`} onClick={() => setTab('searches')}>
            Pesquisas guardadas
            {deepEntries.length > 0 && <span className="lib-tab-count">{deepEntries.length}</span>}
          </button>
        </div>

        {/* ── Analyses tab ── */}
        {tab === 'analyses' && (
          <>
            {!loading && entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: 13 }}>
                {t('lib_empty')}<br />
                <button className="bsm p" style={{ marginTop: 16 }} onClick={() => setScreen('landing')}>
                  {t('lib_first_video')}
                </button>
              </div>
            )}
            <div className="lib-grid">
              {entries.map(entry => {
                const explorations = deepByAnalysis[entry.id] ?? []
                return (
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
                          style={{ objectFit: 'cover' }}
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

                    {/* Explorations section — only if this analysis has saved deep searches */}
                    {explorations.length > 0 && (
                      <ExplorationSection
                        searches={explorations}
                        onOpen={handleOpenDeepSearch}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Orphan searches tab (legacy — searches without analysis_id) ── */}
        {tab === 'searches' && (
          <>
            {deepEntries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: 13 }}>
                Nenhuma pesquisa guardada ainda.
              </div>
            )}
            {(() => {
              const groups: { title: string; items: DeepSearchEntry[] }[] = []
              const seen = new Map<string, DeepSearchEntry[]>()
              for (const e of deepEntries) {
                const key = e.video_title ?? '—'
                if (!seen.has(key)) { seen.set(key, []); groups.push({ title: key, items: seen.get(key)! }) }
                seen.get(key)!.push(e)
              }
              return (
                <div className="lib-ds-groups">
                  {groups.map(group => (
                    <OrphanGroup
                      key={group.title}
                      title={group.title}
                      items={group.items}
                      locale={locale}
                      onOpen={handleOpenDeepSearch}
                    />
                  ))}
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
