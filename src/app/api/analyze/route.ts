import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { AnalysisResponseSchema, type SectionId } from '@/lib/schema'
import { buildSystemPrompt, TOOL_SCHEMA } from '@/lib/prompt'
import { extractVideoId, getVideoMetadata, normalizeYoutubeUrl } from '@/lib/youtube'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromRequest } from '@/lib/auth-server'
import type { Language } from '@/data/locales'

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_CLASSIFY = 'claude-haiku-4-5-20251001'
const MODEL_EXTRACT  = 'claude-sonnet-4-6'

const MAX_URL_LENGTH = 500
const TRANSCRIPT_CHAR_LIMIT = 40_000
const MIN_TRANSCRIPT_CHARS = 100
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 2000
const RETRY_RATE_LIMIT_DELAY_MS = 1500
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504])

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Niche taxonomy ───────────────────────────────────────────────────────────

const NICHE_TYPES = [
  'education_tutorial', 'business_finance', 'podcast_interview',
  'religion_spirituality', 'news_politics', 'health_fitness',
  'tech_review', 'gaming_streaming', 'entertainment_humor',
  'lifestyle_vlog', 'beauty_fashion', 'food_cooking',
  'music_performance', 'diy_howto', 'documentary_history',
] as const

type NicheType = typeof NICHE_TYPES[number]

// ── Niche display names per language ─────────────────────────────────────────

const NICHE_DISPLAY: Record<Language, Record<NicheType, string>> = {
  pt: {
    education_tutorial:    'Educação / Tutorial',
    business_finance:      'Negócios / Finanças',
    podcast_interview:     'Podcast / Entrevista',
    religion_spirituality: 'Religião / Espiritualidade',
    news_politics:         'Notícias / Política',
    health_fitness:        'Saúde / Fitness',
    tech_review:           'Tecnologia / Review',
    gaming_streaming:      'Gaming / Streaming',
    entertainment_humor:   'Entretenimento / Humor',
    lifestyle_vlog:        'Lifestyle / Vlog',
    beauty_fashion:        'Beleza / Moda',
    food_cooking:          'Culinária',
    music_performance:     'Música / Performance',
    diy_howto:             'DIY / How-to',
    documentary_history:   'Documentário / História',
  },
  en: {
    education_tutorial:    'Education / Tutorial',
    business_finance:      'Business / Finance',
    podcast_interview:     'Podcast / Interview',
    religion_spirituality: 'Religion / Spirituality',
    news_politics:         'News / Politics',
    health_fitness:        'Health / Fitness',
    tech_review:           'Technology / Review',
    gaming_streaming:      'Gaming / Streaming',
    entertainment_humor:   'Entertainment / Humor',
    lifestyle_vlog:        'Lifestyle / Vlog',
    beauty_fashion:        'Beauty / Fashion',
    food_cooking:          'Food / Cooking',
    music_performance:     'Music / Performance',
    diy_howto:             'DIY / How-to',
    documentary_history:   'Documentary / History',
  },
  fr: {
    education_tutorial:    'Éducation / Tutoriel',
    business_finance:      'Affaires / Finance',
    podcast_interview:     'Podcast / Interview',
    religion_spirituality: 'Religion / Spiritualité',
    news_politics:         'Actualités / Politique',
    health_fitness:        'Santé / Fitness',
    tech_review:           'Technologie / Critique',
    gaming_streaming:      'Gaming / Streaming',
    entertainment_humor:   'Divertissement / Humour',
    lifestyle_vlog:        'Style de Vie / Vlog',
    beauty_fashion:        'Beauté / Mode',
    food_cooking:          'Cuisine',
    music_performance:     'Musique / Performance',
    diy_howto:             'DIY / Comment faire',
    documentary_history:   'Documentaire / Histoire',
  },
  de: {
    education_tutorial:    'Bildung / Tutorial',
    business_finance:      'Geschäft / Finanzen',
    podcast_interview:     'Podcast / Interview',
    religion_spirituality: 'Religion / Spiritualität',
    news_politics:         'Nachrichten / Politik',
    health_fitness:        'Gesundheit / Fitness',
    tech_review:           'Technologie / Review',
    gaming_streaming:      'Gaming / Streaming',
    entertainment_humor:   'Unterhaltung / Humor',
    lifestyle_vlog:        'Lifestyle / Vlog',
    beauty_fashion:        'Schönheit / Mode',
    food_cooking:          'Kochen & Essen',
    music_performance:     'Musik / Performance',
    diy_howto:             'DIY / Anleitung',
    documentary_history:   'Dokumentarfilm / Geschichte',
  },
}

// ── Per-niche section profiles ────────────────────────────────────────────────

const NICHE_PROFILES: Record<NicheType, { core: SectionId[]; blocked: SectionId[] }> = {
  education_tutorial:    { core: ['resumo', 'conceitual', 'tecnico', 'analitico', 'pragmatico', 'derivado', 'validacao', 'vocabulario', 'conceitos'], blocked: ['mentalidade', 'marketing', 'negocio'] },
  business_finance:      { core: ['resumo', 'conceitual', 'estrategico', 'analitico', 'contextual', 'derivado', 'validacao', 'negocio', 'marketing', 'mentalidade', 'erros', 'playbook', 'contextos'], blocked: [] },
  podcast_interview:     { core: ['resumo', 'contextual', 'analitico', 'citacoes', 'derivado', 'reflexivo', 'conceitual', 'perguntas'], blocked: ['marketing', 'negocio', 'tecnico'] },
  religion_spirituality: { core: ['resumo', 'conceitual', 'contextual', 'pragmatico', 'citacoes', 'derivado', 'reflexivo', 'contextos'], blocked: ['marketing', 'negocio', 'ferramentas'] },
  news_politics:         { core: ['resumo', 'analitico', 'contextual', 'derivado', 'validacao', 'citacoes'], blocked: ['estrategico', 'negocio', 'marketing', 'pragmatico'] },
  health_fitness:        { core: ['resumo', 'pragmatico', 'validacao', 'contextos', 'contextual', 'derivado', 'vocabulario', 'erros'], blocked: ['marketing', 'negocio', 'mentalidade'] },
  tech_review:           { core: ['resumo', 'tecnico', 'validacao', 'pragmatico', 'contextual', 'derivado', 'ferramentas', 'analitico'], blocked: ['marketing', 'negocio'] },
  gaming_streaming:      { core: ['resumo', 'contextual', 'citacoes', 'derivado', 'pragmatico'], blocked: ['negocio', 'marketing', 'validacao'] },
  entertainment_humor:   { core: ['resumo', 'contextual', 'citacoes', 'analitico', 'derivado'], blocked: ['tecnico', 'negocio', 'validacao'] },
  lifestyle_vlog:        { core: ['resumo', 'contextual', 'citacoes', 'derivado', 'reflexivo'], blocked: ['tecnico', 'negocio'] },
  beauty_fashion:        { core: ['resumo', 'pragmatico', 'contextual', 'derivado', 'citacoes', 'vocabulario'], blocked: ['tecnico', 'negocio', 'analitico'] },
  food_cooking:          { core: ['resumo', 'pragmatico', 'tecnico', 'contextual', 'derivado', 'vocabulario', 'erros'], blocked: ['negocio', 'marketing'] },
  music_performance:     { core: ['resumo', 'contextual', 'citacoes', 'derivado', 'reflexivo', 'analitico'], blocked: ['negocio', 'validacao'] },
  diy_howto:             { core: ['resumo', 'pragmatico', 'tecnico', 'contextual', 'derivado', 'validacao', 'erros'], blocked: ['negocio', 'marketing'] },
  documentary_history:   { core: ['resumo', 'contextual', 'analitico', 'derivado', 'validacao', 'citacoes', 'conceitual'], blocked: ['pragmatico', 'negocio', 'marketing'] },
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, baseDelay = RETRY_BASE_DELAY_MS): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn() } catch (err) {
      lastError = err
      if (attempt >= maxRetries) break
      const status = err instanceof ApiError ? err.status : null
      const isRetryable = status === null || RETRYABLE_STATUS.has(status)
      if (!isRetryable) break
      const delay = status === 429 ? RETRY_RATE_LIMIT_DELAY_MS : baseDelay * (attempt + 1)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}

// ── Custom error ──────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Niche classification ──────────────────────────────────────────────────────

async function classifyNiche(transcript: string): Promise<NicheType> {
  const sample = transcript.slice(0, 5000)
  try {
    const res = await withRetry(() =>
      anthropic.messages.create({
        model: MODEL_CLASSIFY,
        max_tokens: 256,
        messages: [{ role: 'user', content: `Classify this transcript excerpt into exactly one niche. Available niches: ${NICHE_TYPES.join(', ')}.\n\nReturn ONLY valid JSON: {"primary":"niche_id","confidence":0.85}\n\nTranscript excerpt:\n${sample}` }],
      })
    )
    const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const primary = parsed.primary as string
      if ((NICHE_TYPES as readonly string[]).includes(primary)) {
        console.log(`Niche classified: ${primary} (confidence: ${parsed.confidence})`)
        return primary as NicheType
      }
    }
  } catch (err) {
    console.warn('Niche classification failed, defaulting to education_tutorial:', err)
  }
  return 'education_tutorial'
}

// ── Transcript fetcher ────────────────────────────────────────────────────────

async function fetchTranscript(videoId: string): Promise<string> {
  const apiKey = process.env.SUPADATA_API_KEY
  if (!apiKey) throw new ApiError(500, 'SUPADATA_NOT_CONFIGURED', 'Transcription service not configured')

  return withRetry(async () => {
    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${encodeURIComponent(videoId)}&text=true`,
      { headers: { 'x-api-key': apiKey }, next: { revalidate: 0 } }
    )
    if (!res.ok) {
      const body = await res.text()
      console.error('Supadata error:', res.status, body)
      if (res.status === 404 || res.status === 422) throw new ApiError(422, 'TRANSCRIPT_UNAVAILABLE', 'No subtitles available for this video.')
      if (res.status === 429) throw new ApiError(503, 'TRANSCRIPT_RATE_LIMITED', 'Transcription service busy. Please try again.')
      if (RETRYABLE_STATUS.has(res.status)) throw new ApiError(503, 'TRANSCRIPT_RETRYABLE', 'Transcription service temporarily unavailable')
      throw new ApiError(502, 'TRANSCRIPT_FAILED', 'Could not retrieve the video transcript.')
    }
    const data = await res.json()
    if (typeof data.content === 'string' && data.content.length > 0) return data.content
    if (Array.isArray(data.content)) return (data.content as { text: string }[]).map(c => c.text).join(' ')
    throw new ApiError(422, 'TRANSCRIPT_EMPTY', 'Transcript not available for this video.')
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────

const FREE_USAGE_LIMIT = parseInt(process.env.FREE_USAGE_LIMIT ?? '3')

export async function POST(req: NextRequest) {
  try {
    // ── Auth + access control ──────────────────────────────────────────────
    const sbUser = await getUserFromRequest(req)
    if (!sbUser) {
      return NextResponse.json({ message: 'Sign in to analyse videos.', code: 'UNAUTHENTICATED' }, { status: 401 })
    }

    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, free_usage_count, stripe_customer_id')
      .eq('user_id', sbUser.id)
      .maybeSingle()

    if (!customer) {
      return NextResponse.json({ message: 'Account not found. Please sign in again.', code: 'NO_CUSTOMER' }, { status: 403 })
    }

    // Check for an active paid subscription
    const { data: paidSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('customer_id', customer.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    const isPaid = !!paidSub
    const usageBefore = customer.free_usage_count

    if (!isPaid && usageBefore >= FREE_USAGE_LIMIT) {
      // Log blocked attempt
      await supabaseAdmin.from('usage_logs').insert({
        customer_id:  customer.id,
        mode:         'free',
        status:       'blocked',
        usage_before: usageBefore,
        usage_after:  usageBefore,
      })
      return NextResponse.json({
        message: 'Free limit reached. Upgrade to Pro for unlimited analyses.',
        code:    'FREE_LIMIT_REACHED',
        limit:   FREE_USAGE_LIMIT,
        used:    usageBefore,
      }, { status: 403 })
    }

    let body: { url?: string; language?: string }
    try { body = await req.json() } catch { return NextResponse.json({ message: 'Invalid request body' }, { status: 400 }) }

    const rawUrl = body.url?.trim() ?? ''
    const language: Language = (['pt', 'en', 'fr', 'de'].includes(body.language ?? '')) ? (body.language as Language) : 'pt'

    if (!rawUrl) return NextResponse.json({ message: 'URL is required' }, { status: 400 })
    if (rawUrl.length > MAX_URL_LENGTH) return NextResponse.json({ message: 'URL is too long' }, { status: 400 })

    const normalizedUrl = normalizeYoutubeUrl(rawUrl)
    const videoId = extractVideoId(normalizedUrl)
    if (!videoId) return NextResponse.json({ message: 'Invalid YouTube URL. Use a link like youtube.com/watch?v=...' }, { status: 400 })

    const [metadata, rawTranscript] = await Promise.all([getVideoMetadata(videoId), fetchTranscript(videoId)])

    if (rawTranscript.length < MIN_TRANSCRIPT_CHARS) {
      return NextResponse.json({ message: 'Transcript too short. The video may not have subtitles.' }, { status: 400 })
    }

    const transcript = rawTranscript.length > TRANSCRIPT_CHAR_LIMIT
      ? rawTranscript.slice(0, TRANSCRIPT_CHAR_LIMIT) + '\n[transcript truncated for analysis]'
      : rawTranscript

    const niche = await classifyNiche(transcript)
    const profile = NICHE_PROFILES[niche]
    const nicheDisplayName = NICHE_DISPLAY[language][niche]

    console.log(`Analyzing: "${metadata.title}" | Niche: ${nicheDisplayName} | Lang: ${language} | Transcript: ${transcript.length} chars`)

    const response = await withRetry(() =>
      anthropic.messages.create({
        model: MODEL_EXTRACT,
        max_tokens: 12000,
        system: buildSystemPrompt(niche, nicheDisplayName, profile.core, profile.blocked, language),
        tools: [TOOL_SCHEMA],
        tool_choice: { type: 'tool', name: 'extract_knowledge_architecture' },
        messages: [{ role: 'user', content: `Title: ${metadata.title}\nChannel: ${metadata.channel}\nDetected niche: ${nicheDisplayName}\n\nTranscript:\n${transcript}` }],
      })
    )

    const toolBlock = response.content.find(b => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') throw new ApiError(502, 'CLAUDE_NO_TOOL_OUTPUT', 'Claude did not return structured data')

    // Diagnostic: log raw vocabulary from Claude before Zod parsing
    const rawInput = toolBlock.input as Record<string, unknown>
    const rawVocab = rawInput?.vocabulary
    console.log(`[vocabulary] Claude returned ${Array.isArray(rawVocab) ? rawVocab.length : 'non-array'} items:`, JSON.stringify(rawVocab)?.slice(0, 500))

    const parsed = AnalysisResponseSchema.safeParse(toolBlock.input)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      console.error('Zod validation failed:', parsed.error.flatten())
      throw new ApiError(502, 'INVALID_ANALYSIS_DATA', `Invalid data: ${firstIssue?.path.join('.')} — ${firstIssue?.message}`)
    }
    console.log(`[vocabulary] After Zod: ${parsed.data.vocabulary.length} items`)

    // ── Post-success: increment free usage + log ───────────────────────────
    const usageAfter = isPaid ? usageBefore : usageBefore + 1
    if (!isPaid) {
      await supabaseAdmin
        .from('customers')
        .update({ free_usage_count: usageAfter })
        .eq('id', customer.id)
    }
    await supabaseAdmin.from('usage_logs').insert({
      customer_id:  customer.id,
      mode:         isPaid ? 'paid' : 'free',
      status:       'success',
      usage_before: usageBefore,
      usage_after:  usageAfter,
      metadata:     { videoId, niche, language },
    })

    return NextResponse.json({
      ...parsed.data,
      videoId:      videoId,
      videoTitle:   metadata.title || parsed.data.videoTitle,
      channel:      metadata.channel,
      thumbnailUrl: metadata.thumbnailUrl,
      niche:        nicheDisplayName,
      nicheId:      niche,
    })
  } catch (error) {
    console.error('Analyze route error:', error)
    if (error instanceof ApiError) {
      const httpStatus = error.status >= 400 && error.status < 600 ? error.status : 500
      return NextResponse.json({ message: error.message, code: error.code }, { status: httpStatus })
    }
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
