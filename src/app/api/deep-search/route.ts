import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Language } from '@/data/locales'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANGUAGE_NAMES: Record<Language, string> = {
  pt: 'Português de Portugal',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
}

const TOOL = {
  name: 'deep_search_result',
  description: 'Returns a structured deep exploration of a concept.',
  input_schema: {
    type: 'object' as const,
    required: ['title', 'summary', 'points'],
    properties: {
      title:    { type: 'string', description: 'Concept title (1-5 words)' },
      summary:  { type: 'string', description: '2-3 sentence deep explanation' },
      points:   { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5, description: 'Key insights' },
      examples: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3, description: 'Practical examples' },
      related:  { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5, description: 'Related concepts' },
    },
  },
}

export async function POST(req: NextRequest) {
  try {
    const { term, videoTitle, niche, language } = await req.json()
    if (!term?.trim()) return NextResponse.json({ error: 'Term required' }, { status: 400 })

    const lang: Language = (['pt', 'en', 'fr', 'de'].includes(language)) ? language : 'pt'
    const langName = LANGUAGE_NAMES[lang]

    const context = [
      videoTitle ? `video: "${videoTitle}"` : null,
      niche      ? `niche: ${niche}`        : null,
    ].filter(Boolean).join(', ')

    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'deep_search_result' },
      messages: [{
        role: 'user',
        content: `Explain in depth the concept: "${term}"${context ? `\nContext: ${context}` : ''}\nRespond in ${langName}.`,
      }],
    })

    const toolBlock = res.content.find(b => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return NextResponse.json({ error: 'No result from AI' }, { status: 502 })
    }

    return NextResponse.json(toolBlock.input)
  } catch (err) {
    console.error('deep-search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
