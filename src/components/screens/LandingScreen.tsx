'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { extractVideoId } from '@/lib/youtube'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageSelector from '@/components/ui/LanguageSelector'
import type { Locale } from '@/data/locales'

// ── Static data ───────────────────────────────────────────────────────────────

const CATEGORIES: { label: string; colorVar: string; descKey: keyof Locale }[] = [
  { label: 'Concepts',   colorVar: '--concept',   descKey: 'lp_cat_concepts_d'   },
  { label: 'Frameworks', colorVar: '--framework', descKey: 'lp_cat_frameworks_d' },
  { label: 'Insights',   colorVar: '--insight',   descKey: 'lp_cat_insights_d'   },
  { label: 'Vocabulary', colorVar: '--vocab',     descKey: 'lp_cat_vocab_d'      },
  { label: 'Ideas',      colorVar: '--idea',      descKey: 'lp_cat_ideas_d'      },
]

const CAT_ICONS = [
  <svg key="c" viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  <svg key="f" viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  <svg key="i" viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 3C7.24 3 5 5.24 5 8c0 1.8.94 3.38 2.35 4.28V14h5v-1.72C13.06 11.38 14 9.8 14 8c0-2.76-2.24-5-4-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="v" viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M4 5h12M4 8h8M4 11h10M4 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="d" viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 3l1.5 3.5L15 7l-2.5 2.4.5 3.6L10 11.4 7 13l.5-3.6L5 7l3.5-.5L10 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
]

const FEATURES: { icon: React.ReactElement; title: string; descKey: keyof Locale; colorVar: string }[] = [
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    title: 'Knowledge Architecture', descKey: 'lp_feat_ka_d', colorVar: '--concept' },
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Deep Concept Exploration', descKey: 'lp_feat_dce_d', colorVar: '--framework' },
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><path d="M2 11c0-2 1.8-3.5 4-3.5h10c2.2 0 4 1.5 4 3.5s-1.8 3.5-4 3.5H6c-2.2 0-4-1.5-4-3.5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/></svg>,
    title: 'Knowledge Lens', descKey: 'lp_feat_kl_d', colorVar: '--insight' },
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><path d="M8 3H5a2 2 0 00-2 2v4m5-6h9a2 2 0 012 2v4M8 3v16m0 0h9a2 2 0 002-2V9M8 19H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Smart Selection', descKey: 'lp_feat_ss_d', colorVar: '--vocab' },
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><circle cx="4" cy="11" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="18" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 10.5l10-5M6 11.5l10 5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    title: 'Knowledge Map', descKey: 'lp_feat_km_d', colorVar: '--idea' },
  { icon: <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><path d="M11 14l-3-3m3 3l3-3m-3 3V8m-6 5v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Learning Export', descKey: 'lp_feat_le_d', colorVar: '--p' },
]

const HOW_STEPS: { num: string; titleKey: keyof Locale; descKey: keyof Locale }[] = [
  { num: '01', titleKey: 'lp_how_step1_t', descKey: 'lp_how_step1_d' },
  { num: '02', titleKey: 'lp_how_step2_t', descKey: 'lp_how_step2_d' },
  { num: '03', titleKey: 'lp_how_step3_t', descKey: 'lp_how_step3_d' },
]

const TESTIMONIALS = [
  { quote: 'Soneker changed the way I consume YouTube. I used to take messy notes — now I get a complete knowledge map in under a minute.', name: 'Alex Chen', role: 'Product Designer', initials: 'AC', color: '--concept' },
  { quote: 'I analyzed 3 hours of business content and had a full structured architecture ready in 2 minutes. Nothing else comes close.', name: 'Maria Santos', role: 'Entrepreneur', initials: 'MS', color: '--framework' },
  { quote: 'The Deep Search and Knowledge Lens alone make this irreplaceable. I use it for every long-form video I watch.', name: 'Thomas Müller', role: 'Research Analyst', initials: 'TM', color: '--insight' },
]

const FREE_FEATURES = [
  'Unlimited video analyses',
  'All 5 knowledge types',
  'Interactive Knowledge Map',
  'AI Deep Search',
  'Export PDF · Markdown · SVG',
  '5 languages',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Notion sync',
  'Batch processing',
  'Priority AI model',
  'Custom niche presets',
  'Team workspace',
]

// ── Product mockup ────────────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="lp-mock" aria-hidden>
      {/* Topbar simulation */}
      <div className="lp-mock-bar">
        <div className="lp-mock-bar-dot" style={{ background: '#ff5f57' }} />
        <div className="lp-mock-bar-dot" style={{ background: '#febc2e' }} />
        <div className="lp-mock-bar-dot" style={{ background: '#28c840' }} />
        <span className="lp-mock-bar-title">Knowledge Architecture</span>
        <span className="lp-mock-bar-count">14 cards</span>
      </div>
      {/* Video info strip */}
      <div className="lp-mock-vid">
        <div className="lp-mock-thumb">
          <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
            <circle cx="10" cy="10" r="8" fill="rgba(91,78,255,.18)" stroke="var(--p)" strokeWidth="1.2"/>
            <path d="M8 7.5l5 2.5-5 2.5V7.5z" fill="var(--p)"/>
          </svg>
        </div>
        <div className="lp-mock-vid-info">
          <div className="lp-mock-vid-title">The Art of Thinking Clearly</div>
          <div className="lp-mock-vid-ch">Rolf Dobelli · Philosophy · 48 min</div>
        </div>
      </div>
      {/* Cards */}
      <div className="lp-mock-cards">
        <div className="lp-mock-card">
          <div className="lp-mock-badge" style={{ color: 'var(--concept)', background: 'color-mix(in srgb, var(--concept) 10%, transparent)' }}>
            Executive Summary
          </div>
          <div className="lp-mock-body">
            Cognitive biases <span className="lp-mock-mark">systematically distort</span> how we perceive reality and make decisions every single day.
          </div>
          <div className="lp-mock-tags">
            <span className="lp-mock-tag" style={{ color: 'var(--concept)', background: 'color-mix(in srgb, var(--concept) 10%, transparent)' }}>concept</span>
            <span className="lp-mock-tag" style={{ color: 'var(--framework)', background: 'color-mix(in srgb, var(--framework) 10%, transparent)' }}>framework</span>
          </div>
        </div>
        <div className="lp-mock-card">
          <div className="lp-mock-badge" style={{ color: 'var(--insight)', background: 'color-mix(in srgb, var(--insight) 10%, transparent)' }}>
            Conceptual Knowledge
          </div>
          <div className="lp-mock-body">
            The <span className="lp-mock-mark lp-mock-mark-amber">Sunk Cost Fallacy</span> — we continue endeavors purely because of past investment, ignoring future value.
          </div>
        </div>
        <div className="lp-mock-card">
          <div className="lp-mock-badge" style={{ color: 'var(--framework)', background: 'color-mix(in srgb, var(--framework) 10%, transparent)' }}>
            Strategic Knowledge
          </div>
          <div className="lp-mock-body">
            <span className="lp-mock-mark lp-mock-mark-green">Survivorship Bias</span> leads to systematically overestimating success rates across every domain.
          </div>
        </div>
      </div>
      {/* Fade out at bottom */}
      <div className="lp-mock-fade" />
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

// ── User dropdown ─────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, signOut, openAuth } = useAuth()
  const { setScreen }               = useApp()
  const [open, setOpen]             = useState(false)
  const ref                         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return (
    <>
      <button className="lp-nav-signin" onClick={() => openAuth('signin')}>Sign In</button>
      <button className="lp-nav-cta"    onClick={() => openAuth('signup')}>Try Free</button>
    </>
  )

  return (
    <div className="lp-nav-user" ref={ref}>
      <button className="lp-nav-av" onClick={() => setOpen(o => !o)}>
        {user.initials}
      </button>
      {open && (
        <div className="lp-nav-drop">
          <div className="lp-nav-drop-head">
            <div className="lp-nav-drop-name">{user.name}</div>
            <div className="lp-nav-drop-email">{user.email}</div>
          </div>
          <div className="lp-nav-drop-sep" />
          <button className="lp-nav-drop-item" onClick={() => { setScreen('library'); setOpen(false) }}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M3 2h10a1 1 0 011 1v11l-4-2.5-2 1.5-4-2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            Library
          </button>
          <button className="lp-nav-drop-item" onClick={() => { setScreen('profile'); setOpen(false) }}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2.5 14c0-3 11-3 11 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Account
          </button>
          <div className="lp-nav-drop-sep" />
          <button className="lp-nav-drop-item lp-nav-drop-out" onClick={() => { signOut(); setOpen(false) }}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M10 11l3-3-3-3M13 8H6M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LandingScreen() {
  const { urlInput, setUrlInput, startAnalysis } = useApp()
  const { t } = useLanguage()
  const [inputError, setInputError] = useState(false)
  const [ctaError,   setCtaError]   = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const ctaInputRef  = useRef<HTMLInputElement>(null)

  const tryAnalyze = (setErr: (v: boolean) => void, ref: React.RefObject<HTMLInputElement | null>) => {
    const trimmed = urlInput.trim()
    if (!trimmed || !extractVideoId(trimmed)) {
      setErr(true)
      setTimeout(() => setErr(false), 1400)
      ref.current?.focus()
      return
    }
    startAnalysis()
  }

  const onHeroKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') tryAnalyze(setInputError, heroInputRef) }
  const onCtaKey  = (e: React.KeyboardEvent) => { if (e.key === 'Enter') tryAnalyze(setCtaError,   ctaInputRef)  }

  return (
    <div className="lp-page">

      {/* ── Sticky Nav ──────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <div className="logo-mark" style={{ width: 26, height: 26 }}>
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" fill="rgba(108,95,255,.3)" stroke="#6c5fff" strokeWidth="1"/>
                <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke="#a398ff" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M4 4l1.2 1.2M10.8 10.8l1.2 1.2M4 12l1.2-1.2M10.8 5.2l1.2-1.2" stroke="#a398ff" strokeWidth=".9" strokeLinecap="round" opacity=".45"/>
              </svg>
            </div>
            <span className="lp-nav-brand">Soneker</span>
          </div>
          <div className="lp-nav-controls">
            <LanguageSelector />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-dot-grid" />
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />

        <div className="lp-hero-inner">
          {/* Left column */}
          <div className="lp-hero-left">
            <div className="lp-badge">{t('lp_powered_by')}</div>

            <h1 className="lp-h1">
              {t('land_headline_1')}<br />
              <em>{t('land_headline_2')}</em><br />
              {t('land_headline_3')}
            </h1>

            <p className="lp-sub">{t('land_sub')}</p>

            <div className="lp-input-wrap">
              <input
                ref={heroInputRef}
                className={`lp-input${inputError ? ' lp-input-err' : ''}`}
                type="text"
                placeholder={t('land_placeholder')}
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={onHeroKey}
                autoComplete="off"
              />
              <button className="lp-btn-go" onClick={() => tryAnalyze(setInputError, heroInputRef)}>
                {t('land_analyze')}
              </button>
            </div>
            <p className="lp-hint">{t('land_hint')}</p>

            {/* Trust strip */}
            <div className="lp-trust">
              <span className="lp-trust-item">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M2 6l3 3 5-5" stroke="var(--framework)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t('lp_trust_model')}
              </span>
              <span className="lp-trust-sep" />
              <span className="lp-trust-item">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M2 6l3 3 5-5" stroke="var(--framework)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t('lp_trust_niches')}
              </span>
              <span className="lp-trust-sep" />
              <span className="lp-trust-item">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M2 6l3 3 5-5" stroke="var(--framework)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t('lp_trust_langs')}
              </span>
              <span className="lp-trust-sep" />
              <span className="lp-trust-item">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M2 6l3 3 5-5" stroke="var(--framework)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t('lp_trust_exports')}
              </span>
            </div>
          </div>

          {/* Right column — product demo video */}
          <div className="lp-hero-right">
            <div className="lp-demo-frame">
              <div className="lp-demo-bar">
                <span className="lp-demo-dot" style={{ background: '#ff5f57' }} />
                <span className="lp-demo-dot" style={{ background: '#febc2e' }} />
                <span className="lp-demo-dot" style={{ background: '#28c840' }} />
              </div>
              <video
                className="lp-demo-video"
                src="/demo.webm"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ────────────────────────────────────────────── */}
      <div className="lp-social-bar">
        <div className="lp-social-inner">
          <div className="lp-social-avatars">
            {['AC','MS','TM','LK','PR'].map((i, idx) => (
              <div key={idx} className="lp-social-av" style={{ zIndex: 5 - idx, background: `var(${['--concept','--framework','--insight','--vocab','--idea'][idx]})` }}>
                {i}
              </div>
            ))}
          </div>
          <div className="lp-social-stars">{'★★★★★'}</div>
          <div className="lp-social-text">
            <strong>2,400+</strong> {t('lp_social_label')}
          </div>
        </div>
      </div>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <section className="lp-section lp-cats-section">
        <div className="lp-section-inner">
          <h2 className="lp-s-head">{t('lp_cat_label')}</h2>
          <p className="lp-s-sub">{t('lp_cat_desc')}</p>
          <div className="lp-cats-grid">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="lp-cat-card" style={{ '--cat-c': `var(${cat.colorVar})` } as React.CSSProperties}>
                <div className="lp-cat-icon" style={{ color: `var(${cat.colorVar})` }}>{CAT_ICONS[i]}</div>
                <div className="lp-cat-name">{cat.label}</div>
                <div className="lp-cat-desc">{t(cat.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="lp-section lp-how-section">
        <div className="lp-section-inner">
          <h2 className="lp-s-head">{t('lp_how_label')}</h2>
          <div className="lp-steps">
            {HOW_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className="lp-step">
                  <div className="lp-step-num">{step.num}</div>
                  <div className="lp-step-title">{t(step.titleKey)}</div>
                  <div className="lp-step-desc">{t(step.descKey)}</div>
                </div>
                {i < HOW_STEPS.length - 1 && (
                  <div className="lp-step-arrow" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                      <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="lp-section lp-feats-section">
        <div className="lp-section-inner">
          <h2 className="lp-s-head">{t('lp_feat_label')}</h2>
          <div className="lp-feats-grid">
            {FEATURES.map((feat, i) => (
              <div key={i} className="lp-feat-card" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="lp-feat-icon" style={{ color: `var(${feat.colorVar})` }}>{feat.icon}</div>
                <div className="lp-feat-title">{feat.title}</div>
                <div className="lp-feat-desc">{t(feat.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="lp-section lp-testi-section">
        <div className="lp-section-inner">
          <h2 className="lp-s-head">Loved by learners worldwide</h2>
          <div className="lp-testi-grid">
            {TESTIMONIALS.map((t_, i) => (
              <div key={i} className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-quote">"{t_.quote}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-av" style={{ background: `var(${t_.color})` }}>{t_.initials}</div>
                  <div>
                    <div className="lp-testi-name">{t_.name}</div>
                    <div className="lp-testi-role">{t_.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="lp-section lp-price-section">
        <div className="lp-section-inner">
          <h2 className="lp-s-head">{t('lp_price_label')}</h2>
          <p className="lp-s-sub">{t('lp_price_sub')}</p>
          <div className="lp-price-grid">
            {/* Free tier */}
            <div className="lp-price-card">
              <div className="lp-price-head">
                <span className="lp-price-name">{t('lp_price_free_name')}</span>
                <span className="lp-price-tag">{t('lp_price_free_tag')}</span>
              </div>
              <div className="lp-price-amount">
                <span className="lp-price-currency">$</span>
                <span className="lp-price-num">0</span>
                <span className="lp-price-per">/mo</span>
              </div>
              <ul className="lp-price-list">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="lp-price-item">
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M2 7l3.5 3.5 6.5-6.5" stroke="var(--framework)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="lp-price-btn lp-price-btn-free" onClick={() => heroInputRef.current?.focus()}>
                {t('lp_price_free_btn')}
              </button>
            </div>
            {/* Pro tier */}
            <div className="lp-price-card lp-price-card-pro">
              <div className="lp-price-pro-badge">Coming Soon</div>
              <div className="lp-price-head">
                <span className="lp-price-name">{t('lp_price_pro_name')}</span>
                <span className="lp-price-tag lp-price-tag-pro">{t('lp_price_pro_tag')}</span>
              </div>
              <div className="lp-price-amount">
                <span className="lp-price-currency">$</span>
                <span className="lp-price-num">12</span>
                <span className="lp-price-per">/mo</span>
              </div>
              <ul className="lp-price-list">
                {PRO_FEATURES.map((f, i) => (
                  <li key={i} className="lp-price-item">
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M2 7l3.5 3.5 6.5-6.5" stroke="var(--p)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="lp-price-btn lp-price-btn-pro">
                {t('lp_price_pro_btn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="lp-cta-section">
        <div className="lp-orb lp-orb-cta" />
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">{t('lp_cta_title')}</h2>
          <p className="lp-cta-sub">{t('lp_cta_sub')}</p>
          <div className="lp-input-wrap lp-cta-input-wrap">
            <input
              ref={ctaInputRef}
              className={`lp-input${ctaError ? ' lp-input-err' : ''}`}
              type="text"
              placeholder={t('land_placeholder')}
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={onCtaKey}
              autoComplete="off"
            />
            <button className="lp-btn-go" onClick={() => tryAnalyze(setCtaError, ctaInputRef)}>
              {t('land_analyze')}
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
