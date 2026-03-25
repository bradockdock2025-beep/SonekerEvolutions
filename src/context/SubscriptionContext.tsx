'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id:               string
  name:             string
  slug:             string
  description:      string
  features:         string[]
  interval:         string | null
  price:            number
  currency:         string
  discount_percent: number
  display_order:    number
}

export interface CustomerInfo {
  id:               string
  email:            string
  billing_name:     string | null
  billing_email:    string | null
  free_usage_count: number
  free_limit:       number
  has_stripe:       boolean
}

export interface Subscription {
  id:                     string
  status:                 string
  stripe_subscription_id: string | null
  cancel_at_period_end:   boolean
  current_period_start:   string | null
  current_period_end:     string | null
  plans:                  Plan | null
}

interface SubscriptionContextType {
  customer:     CustomerInfo | null
  subscription: Subscription | null
  plans:        Plan[]
  isPaid:       boolean
  isFreeLimit:  boolean
  usageLeft:    number
  loading:      boolean
  refresh:      () => Promise<void>
  openCheckout: (planSlug: string) => Promise<void>
  openPortal:   () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType)

// ── Provider ──────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user }                              = useAuth()
  const [customer,     setCustomer]           = useState<CustomerInfo | null>(null)
  const [subscription, setSubscription]       = useState<Subscription | null>(null)
  const [plans,        setPlans]              = useState<Plan[]>([])
  const [loading,      setLoading]            = useState(false)

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  const refresh = useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setCustomer(null)
      setSubscription(null)
      setPlans([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setCustomer(data.customer)
      setSubscription(data.subscription)
      setPlans(data.plans ?? [])
    } catch (err) {
      console.error('SubscriptionContext refresh error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh when user changes
  useEffect(() => {
    if (user) refresh()
    else { setCustomer(null); setSubscription(null); setPlans([]) }
  }, [user, refresh])

  const openCheckout = async (planSlug: string) => {
    const token = await getToken()
    if (!token) return
    const res = await fetch('/api/billing/checkout', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ planSlug }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.error || 'Checkout unavailable')
  }

  const openPortal = async () => {
    const token = await getToken()
    if (!token) return
    const res = await fetch('/api/billing/portal', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.error || 'Billing portal unavailable')
  }

  const isPaid      = subscription?.status === 'active' || subscription?.status === 'trialing'
  const freeLimit   = customer?.free_limit  ?? 3
  const usageCount  = customer?.free_usage_count ?? 0
  const isFreeLimit = !isPaid && usageCount >= freeLimit
  const usageLeft   = isPaid ? Infinity : Math.max(0, freeLimit - usageCount)

  return (
    <SubscriptionContext.Provider value={{
      customer, subscription, plans,
      isPaid, isFreeLimit, usageLeft,
      loading, refresh, openCheckout, openPortal,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
