'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { useLanguage } from '@/context/LanguageContext'

export default function VideoPlayer() {
  const { result } = useApp()
  const { t } = useLanguage()
  const [playing, setPlaying] = useState(false)
  const videoId = result?.videoId
  const thumbnailUrl = result?.thumbnailUrl

  return (
    <div className="v-block">
      <div
        className="vplayer"
        onClick={() => { if (videoId && !playing) setPlaying(true) }}
        style={{ cursor: videoId ? 'pointer' : 'default' }}
      >
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 'var(--rsm)' }}
          />
        ) : (
          <>
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={result?.videoTitle ?? ''}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <div className="vp-bg" />
            )}
            <div className="vp-play">
              <div className="vp-tri" />
            </div>
          </>
        )}
      </div>

      <div className="v-title">{result?.videoTitle}</div>
      <div className="v-meta">
        <span className="v-mi">{result?.channel}</span>
        {result?.niche && (
          <>
            <span className="v-sep" />
            <span className="v-mi" style={{ color: 'var(--p)', fontWeight: 500 }}>
              {result.niche}
            </span>
          </>
        )}
      </div>

      <div className="ai-layer-bar">
        <div className="ai-layer-dot" />
        <div className="ai-layer-text">
          <strong>{t('player_ai_active')}</strong> — {t('player_ai_extracted', { n: result?.cards?.length ?? 0 })}
        </div>
      </div>
    </div>
  )
}
