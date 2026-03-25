import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { stripe } from '@/lib/stripe'
import { getUserFromRequest } from '@/lib/auth-server'

/**
 * POST /api/billing/checkout
 * Body: { planSlug: 'monthly' | 'annual' }
 * Creates a Stripe Checkout Session for the selected plan.
 */
export async function POST(req: NextRequest) {
  const sbUser = await getUserFromRequest(req)
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { planSlug?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { planSlug } = body
  if (!planSlug || !['monthly', 'annual'].includes(planSlug)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // ── Get plan from DB ───────────────────────────────────────────────────────
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .single()

  if (!plan?.stripe_price_id || plan.stripe_price_id.startsWith('price_REPLACE')) {
    return NextResponse.json({ error: 'Plan not configured. Add Stripe price ID to the plans table.' }, { status: 503 })
  }

  // ── Get or create customer ─────────────────────────────────────────────────
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('user_id', sbUser.id)
    .maybeSingle()

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  // ── Get or create Stripe customer ──────────────────────────────────────────
  let stripeCustomerId = customer.stripe_customer_id

  if (!stripeCustomerId) {
    const stripeCust = await stripe.customers.create({
      email: customer.billing_email || customer.email,
      name:  customer.billing_name  || undefined,
      metadata: { user_id: sbUser.id, customer_id: customer.id },
    })
    stripeCustomerId = stripeCust.id

    await supabaseAdmin
      .from('customers')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', customer.id)
  }

  // ── Create checkout session ────────────────────────────────────────────────
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode:               'subscription',
    customer:           stripeCustomerId,
    line_items:         [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url:        `${origin}/?checkout=success`,
    cancel_url:         `${origin}/?checkout=canceled`,
    subscription_data:  {
      metadata: {
        user_id:     sbUser.id,
        customer_id: customer.id,
        plan_id:     plan.id,
        plan_slug:   plan.slug,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  return NextResponse.json({ url: session.url })
}
