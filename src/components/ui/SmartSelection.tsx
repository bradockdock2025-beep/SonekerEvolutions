'use client'

import { useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { useLanguage } from '@/context/LanguageContext'

export default function SmartSelection() {
  const { selection, setSelection, result, addConceptToMap } = useApp()
  const { showToast } = useToast()
  const { t, language } = useLanguage()
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const resultRef = useRef({ videoTitle: result?.videoTitle, niche: result?.niche })
  useEffect(() => {
    resultRef.current = { videoTitle: result?.videoTitle, niche: result?.niche }
  }, [result?.videoTitle, result?.niche])

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection()
      const text = sel?.toString().trim() ?? ''
      if (text.length < 8) return

      const range = sel?.getRangeAt(0)
      if (!range) return

      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
      abortRef.current?.abort()

      delayTimerRef.current = setTimeout(() => {
        const pending = {
          text,
          title: '',
          definition: '',
          points: [] as string[],
          x: 0,
          y: 0,
          phase: 'loading' as const,
        }
        setSelection(pending)

        const controller = new AbortController()
        abortRef.current = controller

        fetch('/api/deep-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            term: text,
            videoTitle: resultRef.current.videoTitle,
            niche: resultRef.current.niche,
            language,
          }),
          signal: controller.signal,
        })
          .then(async res => {
            const data = await res.json()
            setSelection({
              ...pending,
              title:      typeof data.title   === 'string' ? data.title   : text,
              definition: typeof data.summary === 'string' ? data.summary : '',
              points:     Array.isArray(data.points) ? data.points : [],
              phase: 'done',
            })
          })
          .catch(err => {
            if (err instanceof DOMException && err.name === 'AbortError') return
            setSelection({ ...pending, title: text, definition: t('sel_not_found'), points: [], phase: 'done' })
          })
      }, 340)
    }

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.sel-pop')) {
        if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
        abortRef.current?.abort()
        setSelection(null)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
      abortRef.current?.abort()
    }
  }, [setSelection, language, t])

  if (!selection) return null

  return (
    <div className="sel-pop">
      <div className="sel-hd">
        {selection.phase === 'loading' ? (
          <div className="sel-spin" />
        ) : (
          <span style={{ fontSize: 13, color: 'var(--framework)' }}>✓</span>
        )}
        <div className={`sel-lbl${selection.phase === 'done' ? ' done' : ''}`}>
          {selection.phase === 'loading' ? t('sel_searching') : t('sel_found')}
        </div>
      </div>

      {selection.phase === 'done' && (
        <>
          <div className="sel-scroll">
            <div className="sel-title">{selection.title}</div>
            <div className="sel-def">{selection.definition}</div>
            <div className="sel-pts">
              {Array.isArray(selection.points) && selection.points.map((pt, i) => (
                <div className="sel-pt" key={i}>{pt}</div>
              ))}
            </div>
          </div>
          <div className="sel-acts">
            <button className="sel-act" onClick={() => setSelection(null)}>{t('sel_close')}</button>
            <button
              className="sel-act p"
              onClick={() => {
                addConceptToMap(selection.text)
                setSelection(null)
                showToast(t('sel_toast_added'))
              }}
            >
              {t('sel_add_map')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
