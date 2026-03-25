import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { stripe } from '@/lib/stripe'
import { getUserFromRequest } from '@/lib/auth-server'

/**
 * POST /api/billing/portal
 * Creates a Stripe Billing Portal session for the authenticated user.
 * Only available when the customer has an active paid subscription.
 */
export async function POST(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('user_id', sbUser.id)
    .maybeSingle()

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer:   customer.stripe_customer_id,
    return_url: `${origin}/`,
  })

  return NextResponse.json({ url: session.url })
}
