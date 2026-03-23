'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'

export default function KnowledgeLens() {
  const { lens, setLens } = useApp()
  const lensRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!lens || !lensRef.current) return

    const el = lensRef.current
    const vw = window.innerWidth
    const w = 256
    const h = el.offsetHeight || 140

    let x = lens.x
    let y = lens.y - h - 8

    if (x + w > vw - 16) x = vw - w - 16
    if (x < 16) x = 16
    if (y < 16) y = lens.y + 30

    setPos({ x, y })
  }, [lens])

  if (!lens) return null

  return (
    <div
      ref={lensRef}
      className="klens"
      style={{ left: pos.x, top: pos.y }}
      onMouseLeave={() => setLens(null)}
    >
      <div className="kl-name">{lens.term}</div>
      <div className="kl-def">{lens.definition}</div>
      {lens.points && lens.points.length > 0 && (
        <div className="kl-pts">
          {lens.points.map((pt, i) => (
            <div className="kl-pt" key={i}>{pt}</div>
          ))}
        </div>
      )}
    </div>
  )
}
