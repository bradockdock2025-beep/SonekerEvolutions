'use client'

import { useLanguage } from '@/context/LanguageContext'
import { SECTION_TO_KEY } from '@/data/locales'

interface FilterBarProps {
  active: string
  onChange: (id: string) => void
  count: number
  /** Only the section IDs actually present in the current result's cards */
  presentSections: string[]
}

// Canonical section order
const SECTION_ORDER = [
  'resumo', 'conceitual', 'tecnico', 'estrategico', 'analitico',
  'contextual', 'pragmatico', 'reflexivo', 'citacoes', 'derivado',
  'validacao', 'marketing', 'negocio', 'ferramentas', 'mentalidade',
  'erros', 'playbook', 'contextos', 'vocabulario', 'conceitos', 'perguntas',
]

export default function FilterBar({ active, onChange, count, presentSections }: FilterBarProps) {
  const { t } = useLanguage()

  const chips = SECTION_ORDER.filter(id => presentSections.includes(id))

  return (
    <>
      <div className="pr-head">
        <span className="pr-label">{t('filter_header')}</span>
        <span className="cnt-badge">{t('filter_sections', { n: count })}</span>
      </div>
      <div className="filter-bar">
        <div className="filter-row">
          <button
            className={`chip${active === 'all' ? ' on' : ''}`}
            onClick={() => onChange('all')}
          >
            {t('filter_all')}
          </button>
          {chips.map(id => {
            const localeKey = SECTION_TO_KEY[id]
            return (
              <button
                key={id}
                className={`chip${active === id ? ' on' : ''}`}
                onClick={() => onChange(id)}
              >
                {localeKey ? t(localeKey) : id}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
