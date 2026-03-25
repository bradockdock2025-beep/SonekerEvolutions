import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/billing/plans
 * Public — no auth required. Returns active plans for the pricing section.
 */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('id, name, slug, description, features, interval, price, currency, discount_percent, display_order')
    .eq('is_active', true)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ plans: data ?? [] }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
