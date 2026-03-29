import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }        from '@/lib/supabase-admin'
import { getUserFromRequest }   from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { videoId, videoTitle, channel, thumbnailUrl, niche, nicheId, cardCount, language, result } = body as {
    videoId: string; videoTitle: string; channel: string
    thumbnailUrl?: string; niche?: string; nicheId?: string
    cardCount: number; language?: string; result: unknown
  }

  if (!videoId || !videoTitle || !result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const lang = language ?? 'pt'

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert({
      user_id:       sbUser.id,
      video_id:      videoId,
      video_title:   videoTitle,
      channel:       channel ?? null,
      thumbnail_url: thumbnailUrl ?? null,
      niche:         niche ?? null,
      niche_id:      nicheId ?? null,
      card_count:    cardCount ?? 0,
      language:      lang,
      result,
    })
    .select('id')
    .single()

  if (error) {
    // Duplicate (same video + same language): update existing record
    if (error.code === '23505') {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('analyses')
        .update({
          video_title:   videoTitle,
          channel:       channel ?? null,
          thumbnail_url: thumbnailUrl ?? null,
          niche:         niche ?? null,
          niche_id:      nicheId ?? null,
          card_count:    cardCount ?? 0,
          result,
        })
        .eq('user_id', sbUser.id)
        .eq('video_id', videoId)
        .eq('language', lang)
        .select('id')
        .single()
      if (updateError) {
        console.error('Library update error:', updateError.message)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json({ id: updated.id })
    }
    console.error('Library save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function GET(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('id, created_at, video_id, video_title, channel, thumbnail_url, niche, card_count')
    .eq('user_id', sbUser.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Library fetch error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
