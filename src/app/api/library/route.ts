import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { videoId, videoTitle, channel, thumbnailUrl, niche, nicheId, cardCount, result } = body as {
    videoId: string; videoTitle: string; channel: string
    thumbnailUrl?: string; niche?: string; nicheId?: string
    cardCount: number; result: unknown
  }

  if (!videoId || !videoTitle || !result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert({
      video_id:      videoId,
      video_title:   videoTitle,
      channel:       channel ?? null,
      thumbnail_url: thumbnailUrl ?? null,
      niche:         niche ?? null,
      niche_id:      nicheId ?? null,
      card_count:    cardCount ?? 0,
      result,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Library save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('id, created_at, video_id, video_title, channel, thumbnail_url, niche, card_count')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Library fetch error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
