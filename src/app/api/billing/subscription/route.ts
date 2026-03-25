import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromRequest } from '@/lib/auth-server'

/**
 * GET /api/billing/subscription
 * Returns the current user's subscription state + plan info + active plans for purchase.
 */
export async function GET(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Customer ───────────────────────────────────────────────────────────────
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('user_id', sbUser.id)
    .maybeSingle()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found. Please sign in again.' }, { status: 404 })
  }

  // ── Active subscription (most recent paid first, fallback free) ───────────
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select(`
      id, status, stripe_subscription_id,
      cancel_at_period_end, current_period_start, current_period_end,
      created_at, updated_at,
      plans (id, name, slug, description, features, interval, price, currency, discount_percent, display_order)
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  // Prefer an active paid subscription
  const activePaid = subscriptions?.find(s =>
    s.status === 'active' || s.status === 'trialing'
  )
  const currentSub = activePaid ?? subscriptions?.[0] ?? null

  // ── All purchasable plans ──────────────────────────────────────────────────
  const { data: allPlans } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const FREE_LIMIT = parseInt(process.env.FREE_USAGE_LIMIT ?? '3')

  return NextResponse.json({
    customer: {
      id:              customer.id,
      email:           customer.email,
      billing_name:    customer.billing_name,
      billing_email:   customer.billing_email,
      free_usage_count: customer.free_usage_count,
      free_limit:      FREE_LIMIT,
      has_stripe:      !!customer.stripe_customer_id,
    },
    subscription: currentSub,
    plans:        allPlans ?? [],
  })
}
