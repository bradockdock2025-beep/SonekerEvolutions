'use client'

import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { useLanguage } from '@/context/LanguageContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { AnalysisResult } from '@/types'

interface TopbarProps {
  title: string
}

async function exportPdf(result: AnalysisResult, vocabLabel: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '')
  const pageW = 210
  const margin = 18
  const maxW = pageW - margin * 2
  let y = 20

  const addText = (text: string, size: number, bold = false, color: [number,number,number] = [20,20,30]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, maxW)
    lines.forEach((line: string) => {
      if (y > 272) { doc.addPage(); y = 20 }
      doc.text(line, margin, y)
      y += size * 0.45
    })
    y += 2
  }

  const divider = () => {
    if (y > 272) { doc.addPage(); y = 20 }
    doc.setDrawColor(220, 220, 230)
    doc.line(margin, y, pageW - margin, y)
    y += 6
  }

  addText('Soneker', 9, false, [140, 130, 255])
  addText(result.videoTitle, 18, true, [13, 14, 20])
  addText(result.channel, 10, false, [120, 120, 140])
  if (result.niche) addText(result.niche, 10, false, [91, 78, 255])
  y += 4
  divider()

  const sections = [...new Set(result.cards.map(c => c.section))]
  for (const section of sections) {
    const cards = result.cards.filter(c => c.section === section)
    addText(cards[0].badge, 11, true, [91, 78, 255])
    y += 1
    for (const card of cards) {
      if (y > 265) { doc.addPage(); y = 20 }
      addText(card.name, 12, true, [13, 14, 20])
      addText(stripHtml(card.body), 10, false, [60, 65, 90])
      if (card.tags.length) addText(`Tags: ${card.tags.join(', ')}`, 9, false, [140, 140, 160])
      y += 3
    }
    divider()
  }

  if (result.vocabulary.length) {
    addText(vocabLabel, 13, true, [91, 78, 255])
    y += 1
    for (const v of result.vocabulary) {
      addText(v.term, 11, true, [13, 14, 20])
      addText(v.definition, 10, false, [60, 65, 90])
      y += 2
    }
    divider()
  }

  addText('Soneker · soneker.app', 8, false, [180, 180, 200])

  const slug = result.videoTitle.slice(0, 40).replace(/[^a-z0-9]/gi, '-').toLowerCase()
  doc.save(`soneker-${slug}.pdf`)
}

export default function Topbar({ title }: TopbarProps) {
  const { setScreen, setMindMapOpen, result } = useApp()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const thumbnailUrl = result?.thumbnailUrl

  return (
    <div className="topbar">
      <div className="tb-logo">
        <div className="tb-dot" />
        Soneker
      </div>

      <div className="tb-info">
        <div className="tb-thumb">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="40px"
              style={{ objectFit: 'cover', borderRadius: 3 }}
              unoptimized
            />
          ) : (
            <div className="tb-tri" />
          )}
        </div>
        <span className="tb-title">{title}</span>
      </div>

      <div className="tb-acts">
        <ThemeToggle />

        <button className="bsm" onClick={() => setScreen('library')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2h8v9L6 8.5 2 11V2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          <span>{t('topbar_library')}</span>
        </button>

        <button className="bsm p" onClick={() => setMindMapOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.1"/>
            <circle cx="1.5" cy="1.5" r="1" stroke="currentColor" strokeWidth="1"/>
            <circle cx="10.5" cy="1.5" r="1" stroke="currentColor" strokeWidth="1"/>
            <circle cx="1.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1"/>
            <circle cx="10.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1"/>
            <path d="M3.4 3.4l1.2 1.2M7.4 7.4l1.2 1.2M8.6 3.4l-1.2 1.2M4.6 7.4l-1.2 1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span>{t('topbar_mindmap')}</span>
        </button>

        <button className="bsm" onClick={() => {
          if (!result) { showToast(t('topbar_toast_no_data')); return }
          showToast(t('topbar_toast_generating'))
          exportPdf(result, t('exp_vocab_label'))
            .then(() => showToast(t('topbar_toast_exported')))
            .catch(() => showToast(t('topbar_toast_error')))
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 3H3a.8.8 0 00-.8.8v6.4c0 .44.36.8.8.8h6a.8.8 0 00.8-.8V3.8A.8.8 0 009 3H8M4 3V2.2h4V3M4 3h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t('topbar_export')}</span>
        </button>
      </div>
    </div>
  )
}
