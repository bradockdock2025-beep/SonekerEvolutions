'use client'

import { useEffect, useState, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'

type StepState = 'pending' | 'active' | 'done'

const STEP_ACTIVATE_DELAYS = [0, 900, 1800, 2700]
const STEP_DONE_DELAYS     = [900, 1800, 2700, 3600]

export default function LoadingScreen() {
  const { setScreen, analysisReady, analysisError, result } = useApp()
  const { t } = useLanguage()
  const [steps, setSteps] = useState<StepState[]>(['active', 'pending', 'pending', 'pending'])
  const [animDone, setAnimDone] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedAtRef = useRef<number>(Date.now())

  const STEP_LABELS = [
    t('load_step1'),
    t('load_step2'),
    t('load_step3'),
    t('load_step4'),
  ]

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    STEP_ACTIVATE_DELAYS.slice(1).forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setSteps(prev => {
            const next = [...prev]
            next[i] = 'done'
            next[i + 1] = 'active'
            return next
          })
        }, delay)
      )
    })

    timers.push(
      setTimeout(() => {
        setSteps(['done', 'done', 'done', 'done'])
        setAnimDone(true)
      }, STEP_DONE_DELAYS[3])
    )

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  useEffect(() => {
    if (animDone && !analysisReady) {
      setSteps(prev => {
        const next = [...prev]
        next[3] = 'active'
        return next
      })
      waitTimerRef.current = setTimeout(() => setShowWaiting(true), 800)
    }
    return () => {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
    }
  }, [animDone, analysisReady])

  useEffect(() => {
    if (!analysisReady) return

    if (analysisError) {
      const timer = setTimeout(() => setScreen('landing'), 2200)
      return () => clearTimeout(timer)
    }

    if (result) {
      const elapsed = Date.now() - mountedAtRef.current
      const delay = animDone ? 400 : Math.max(0, STEP_DONE_DELAYS[3] - elapsed) + 400
      const timer = setTimeout(() => setScreen('result'), Math.max(delay, 400))
      return () => clearTimeout(timer)
    }
  }, [analysisReady, analysisError, result, animDone, setScreen])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg)',
        minHeight: '100vh',
      }}
    >
      <div className="load-in">
        <div className="sp-wrap">
          <div className="sp-ring" />
          <div className="sp-ring" />
          <div className="sp-core">
            <svg viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="2.2" stroke="#a398ff" strokeWidth="1.1"/>
              <path d="M6.5 1.5v2M6.5 9.5v2M1.5 6.5h2M9.5 6.5h2" stroke="#a398ff" strokeWidth="1" strokeLinecap="round" opacity=".55"/>
            </svg>
          </div>
        </div>

        <h2 className="load-title">
          {analysisError ? t('load_title_error') : t('load_title')}
        </h2>
        <p className="load-sub">
          {analysisError
            ? analysisError
            : showWaiting
              ? t('load_processing')
              : t('load_analyzing')}
        </p>

        <div className="steps">
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              className={`step${steps[i] === 'active' ? ' active' : steps[i] === 'done' ? ' done' : ''}`}
              style={analysisError && i === 3 ? { borderColor: 'rgba(255,80,80,0.4)' } : undefined}
            >
              <div className="step-ind">
                {steps[i] === 'active' && !analysisError && <div className="step-dot" />}
                {steps[i] === 'active' && analysisError && (
                  <span style={{ fontSize: 10, color: 'rgba(255,80,80,0.8)' }}>✕</span>
                )}
                {steps[i] === 'done' && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="step-lbl">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
