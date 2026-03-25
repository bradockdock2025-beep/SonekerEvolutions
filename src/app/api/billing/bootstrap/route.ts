import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getUserFromRequest } from '@/lib/auth-server'
import crypto from 'crypto'

const FREE_USAGE_LIMIT = parseInt(process.env.FREE_USAGE_LIMIT ?? '3')

/**
 * POST /api/billing/bootstrap
 * Called after a user signs in / signs up.
 * Creates a customer record and free subscription if they don't exist.
 * Restores free usage from email_usage_history to prevent reset abuse.
 */
export async function POST(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = sbUser.email!

  // ── 1. Get or create customer ──────────────────────────────────────────────
  let { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('user_id', sbUser.id)
    .maybeSingle()

  if (!customer) {
    // Check email_usage_history to restore previous free usage
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
    const { data: history } = await supabaseAdmin
      .from('email_usage_history')
      .select('total_free_usage')
      .eq('email_hash', emailHash)
      .maybeSingle()

    const restoredUsage = Math.min(history?.total_free_usage ?? 0, FREE_USAGE_LIMIT)

    const { data: newCustomer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        user_id:          sbUser.id,
        email,
        billing_email:    email,
        free_usage_count: restoredUsage,
      })
      .select()
      .single()

    if (error || !newCustomer) {
      console.error('Bootstrap: failed to create customer', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }
    customer = newCustomer
  }

  // ── 2. Get or create free subscription ────────────────────────────────────
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('customer_id', customer.id)
    .maybeSingle()

  if (!existingSub) {
    const { data: freePlan } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('slug', 'free')
      .single()

    if (freePlan) {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          customer_id: customer.id,
          plan_id:     freePlan.id,
          status:      'free',
        })
    }
  }

  return NextResponse.json({ ok: true, customerId: customer.id })
}
