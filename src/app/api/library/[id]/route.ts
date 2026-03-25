import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }        from '@/lib/supabase-admin'
import { getUserFromRequest }   from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('result')
    .eq('id', id)
    .eq('user_id', sbUser.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data.result)
}
