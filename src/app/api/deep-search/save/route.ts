import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromRequest } from '@/lib/auth-server'

// POST — save a deep search result linked to an analysis
export async function POST(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { term: string; videoTitle?: string; analysisId?: string; result: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { term, videoTitle, analysisId, result } = body
  if (!term?.trim() || !result) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('deep_searches')
    .insert({
      user_id:     sbUser.id,
      term:        term.trim(),
      video_title: videoTitle ?? null,
      analysis_id: analysisId ?? null,
      result,
    })
    .select('id')
    .single()

  if (error) {
    console.error('deep-search save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

// GET — check if a term is already saved for a specific analysis, return result if yes
export async function GET(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const term       = req.nextUrl.searchParams.get('term')?.trim()
  const analysisId = req.nextUrl.searchParams.get('analysisId')?.trim()

  if (!term) return NextResponse.json({ error: 'term required' }, { status: 400 })

  let query = supabaseAdmin
    .from('deep_searches')
    .select('id, term, result')
    .eq('user_id', sbUser.id)
    .ilike('term', term)
    .order('created_at', { ascending: false })
    .limit(1)

  // Scope to the specific analysis when possible
  if (analysisId) {
    query = query.eq('analysis_id', analysisId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ found: false })

  return NextResponse.json({ found: true, id: data.id, result: data.result })
}
