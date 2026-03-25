import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

/**
 * POST /api/billing/webhook
 * Receives Stripe events and syncs subscription state to the local DB.
 *
 * Events handled:
 *  - checkout.session.completed
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 *  - invoice.payment_failed
 */
export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Checkout completed: subscription was created ─────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const stripeSubId = session.subscription as string
        if (!stripeSubId) break

        const sub = await stripe.subscriptions.retrieve(stripeSubId)
        await upsertSubscription(sub)
        break
      }

      // ── Subscription updated (renewal, upgrade, downgrade, cancel) ───────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscription(sub)
        break
      }

      // ── Subscription deleted (hard cancel) ──────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Payment failed ───────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe API clover, subscription ID is on parent.subscription_details
        const subId = (invoice.parent as Stripe.Invoice.Parent | null)?.subscription_details?.subscription as string | null
        if (!subId) break
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subId)
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error(`Webhook handler error [${event.type}]:`, err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── Helper: sync a Stripe subscription to local DB ────────────────────────────

async function upsertSubscription(sub: Stripe.Subscription) {
  const stripeCustomerId = sub.customer as string
  const metadata         = sub.metadata as Record<string, string>

  // Find the local customer
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (!customer) {
    console.error('Webhook: customer not found for stripe_customer_id', stripeCustomerId)
    return
  }

  // Resolve the local plan from metadata or stripe price ID
  let planId: string | null = metadata?.plan_id ?? null

  if (!planId) {
    const priceId = sub.items.data[0]?.price.id
    if (priceId) {
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .maybeSingle()
      planId = plan?.id ?? null
    }
  }

  if (!planId) {
    console.error('Webhook: could not resolve plan_id for subscription', sub.id)
    return
  }

  // In Stripe API clover, period fields moved from Subscription to SubscriptionItem
  const item        = sub.items.data[0]
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null
  const periodEnd   = item?.current_period_end
    ? new Date(item.current_period_end   * 1000).toISOString()
    : null

  const stripeStatus = sub.status // active | past_due | canceled | trialing | etc.

  // Check for an existing paid subscription for this customer (prevent duplicates)
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_id:               planId,
        status:                stripeStatus,
        cancel_at_period_end:  sub.cancel_at_period_end,
        current_period_start:  periodStart,
        current_period_end:    periodEnd,
        updated_at:            new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    // Archive the old free subscription by marking it as superseded
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('customer_id', customer.id)
      .eq('status', 'free')

    await supabaseAdmin
      .from('subscriptions')
      .insert({
        customer_id:           customer.id,
        plan_id:               planId,
        status:                stripeStatus,
        stripe_subscription_id: sub.id,
        cancel_at_period_end:  sub.cancel_at_period_end,
        current_period_start:  periodStart,
        current_period_end:    periodEnd,
      })
  }
}
