'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { useLanguage } from '@/context/LanguageContext'
import type { KnowledgeCard as KnowledgeCardType } from '@/types'

interface Props {
  card: KnowledgeCardType
}

export default function KnowledgeCard({ card }: Props) {
  const [open, setOpen] = useState(false)
  const [addedToMap, setAddedToMap] = useState(false)
  const { showToast } = useToast()
  const { triggerDeepSearch } = useApp()
  const { t } = useLanguage()

  const toggleCard = () => setOpen(prev => !prev)

  const addToMap = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (addedToMap) return
    setAddedToMap(true)
    showToast(t('card_toast_added', { badge: card.badge }))
  }

  return (
    <div className={`k-card ${card.category}`}>
      <div className={`cc${open ? ' open' : ''}`}>
        <button className="cc-trigger" onClick={toggleCard}>
          <div className="cc-left">
            <span className="badge">{card.badge}</span>
          </div>
          <span className="cc-icon">{open ? '−' : '+'}</span>
        </button>

        <div className="cc-body">
          <div className="cc-inner">
            <div className="k-text">
              <span className="k-name" style={{ color: `var(--${card.category})` }}>
                {card.name}
              </span>
              <span dangerouslySetInnerHTML={{ __html: card.body }} />

              <div className="k-tags">
                {card.tags.map((tag, i) => (
                  <span className="k-tag" key={i}>{tag}</span>
                ))}
              </div>

              <div className="btn-row">
                <button className="btn-deep" onClick={e => { e.stopPropagation(); triggerDeepSearch(card.name) }}>
                  {t('card_explore')}
                </button>
                <button
                  className={`btn-add-map${addedToMap ? ' added' : ''}`}
                  onClick={addToMap}
                  disabled={addedToMap}
                >
                  {addedToMap ? t('card_on_map') : t('card_add_map')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
