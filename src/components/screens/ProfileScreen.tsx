'use client'

import { useState } from 'react'
import { useAuth }         from '@/context/AuthContext'
import { useApp }          from '@/context/AppContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { useLanguage }     from '@/context/LanguageContext'

type ApTab = 'overview' | 'profile' | 'subscription' | 'billing' | 'feedback' | 'support'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IGrid = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const IUser = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M2 13.5c0-3.314 2.686-5.5 6-5.5s6 2.186 6 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const ICard = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const IDoc = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IMail = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IPin = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <circle cx="8" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 9.5C8 9.5 3 13 3 6.5a5 5 0 0110 0C13 13 8 9.5 8 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
)
const ISignOut = () => (
  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
    <path d="M10 11l3-3-3-3M13 8H6M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Shared primitives ─────────────────────────────────────────────────────────

function PageHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="ap-head">
      <h1 className="ap-head-title">{title}</h1>
      <p className="ap-head-sub">{sub}</p>
    </div>
  )
}

function Card({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="ap-card">
      {label && <div className="ap-card-label">{label}</div>}
      {children}
    </div>
  )
}

function Row({
  label, value, action, actionLabel, highlight,
}: {
  label: string
  value: React.ReactNode
  action?: () => void
  actionLabel?: string
  highlight?: boolean
}) {
  return (
    <div className={`ap-row${highlight ? ' ap-row-hi' : ''}`}>
      <div className="ap-row-left">
        <div className="ap-row-label">{label}</div>
        <div className="ap-row-value">{value}</div>
      </div>
      {action && (
        <button className="ap-row-action" onClick={action}>{actionLabel}</button>
      )}
    </div>
  )
}

function EditRow({ label, value, onSave, editLabel, saveLabel, cancelLabel }: {
  label: string
  value: string
  onSave: (v: string) => void
  editLabel: string
  saveLabel: string
  cancelLabel: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)

  if (editing) {
    return (
      <div className="ap-row ap-row-editing">
        <div className="ap-row-left" style={{ flex: 1 }}>
          <div className="ap-row-label">{label}</div>
          <input className="ap-edit-input" value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
        </div>
        <div className="ap-edit-actions">
          <button className="ap-edit-save"   onClick={() => { onSave(draft); setEditing(false) }}>{saveLabel}</button>
          <button className="ap-edit-cancel" onClick={() => { setDraft(value); setEditing(false) }}>{cancelLabel}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="ap-row">
      <div className="ap-row-left">
        <div className="ap-row-label">{label}</div>
        <div className="ap-row-value">{value}</div>
      </div>
      <button className="ap-row-action" onClick={() => setEditing(true)}>{editLabel}</button>
    </div>
  )
}

// ── Dynamic plan card ─────────────────────────────────────────────────────────

function PlanCard({ onUpgrade, onPortal }: { onUpgrade: () => void; onPortal: () => void }) {
  const { subscription, isPaid, customer } = useSubscription()
  const { t } = useLanguage()
  const dateLocale = t('date_locale')
  const planName = subscription?.plans?.name ?? t('ap_free_plan_name')

  return (
    <div className="ap-plan-card">
      <div>
        <div className="ap-plan-eyebrow">{t('ap_current_plan')}</div>
        <div className="ap-plan-name">{planName}</div>
        {!isPaid && (
          <div className="ap-plan-desc">
            {customer?.free_usage_count ?? 0} / {customer?.free_limit ?? 3} {t('ap_free_usage')}
          </div>
        )}
        {isPaid && subscription?.cancel_at_period_end && (
          <div className="ap-plan-desc">{t('ap_cancels_end')}</div>
        )}
        {isPaid && !subscription?.cancel_at_period_end && subscription?.current_period_end && (
          <div className="ap-plan-desc">
            {t('ap_renews')} {new Date(subscription.current_period_end).toLocaleDateString(dateLocale)}
          </div>
        )}
      </div>
      {isPaid
        ? <button className="ap-plan-upgrade" onClick={onPortal}>{t('ap_manage_sub')}</button>
        : <button className="ap-plan-upgrade" onClick={onUpgrade}>{t('ap_upgrade_btn')}</button>
      }
    </div>
  )
}

// ── Upgrade modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { plans, openCheckout } = useSubscription()
  const { t } = useLanguage()
  const paidPlans = plans.filter(p => p.slug !== 'free')

  return (
    <div className="up-overlay" onClick={onClose}>
      <div className="up-modal" onClick={e => e.stopPropagation()}>
        <button className="up-close" onClick={onClose}>✕</button>
        <div className="up-title">{t('ap_up_title')}</div>
        <div className="up-sub">{t('ap_up_sub')}</div>
        <div className="up-plans">
          {paidPlans.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('ap_up_no_plans')}</p>
          )}
          {paidPlans.map(plan => {
            const isAnnual  = plan.interval === 'year'
            const localName = isAnnual ? t('plan_annual_name') : t('plan_monthly_name')
            const features  = isAnnual
              ? [t('plan_paid_f1'), t('plan_paid_f2'), t('plan_paid_f3'), t('plan_paid_f4'), t('plan_paid_f5'), t('plan_paid_f6'), t('plan_annual_f7')]
              : [t('plan_paid_f1'), t('plan_paid_f2'), t('plan_paid_f3'), t('plan_paid_f4'), t('plan_paid_f5'), t('plan_paid_f6')]
            return (
              <div key={plan.id} className="up-plan-card">
                {plan.discount_percent > 0 && (
                  <div className="up-plan-badge">{t('ap_up_save')} {plan.discount_percent}%</div>
                )}
                <div className="up-plan-name">{localName}</div>
                <div className="up-plan-price">
                  ${plan.price.toFixed(2)}
                  <span className="up-plan-interval">
                    {isAnnual ? t('ap_per_year') : t('ap_per_month')}
                  </span>
                </div>
                <ul className="up-plan-features">
                  {features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button className="up-plan-btn" onClick={() => openCheckout(plan.slug)}>
                  {t('ap_up_start')} {localName}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function OverviewSection({ user, onUpgrade, onPortal }: {
  user: { name: string; email: string }
  onUpgrade: () => void
  onPortal:  () => void
}) {
  const { customer, isPaid, usageLeft } = useSubscription()
  const { t } = useLanguage()

  return (
    <>
      <PageHead title={t('ap_overview_title')} sub={t('ap_overview_sub')} />
      <PlanCard onUpgrade={onUpgrade} onPortal={onPortal} />
      <Card label={t('ap_account_details')}>
        <Row label={t('ap_label_name')}  value={user.name} />
        <Row label={t('ap_label_email')} value={user.email} />
        <Row
          label={t('ap_analyses_available')}
          value={isPaid
            ? t('ap_unlimited')
            : `${usageLeft} ${usageLeft === 1 ? t('ap_remaining_one') : t('ap_remaining_many')}`
          }
          highlight={!isPaid && usageLeft === 0}
        />
        {customer?.id && (
          <Row label={t('ap_account_id')} value={customer.id.slice(0, 8) + '…'} />
        )}
      </Card>
    </>
  )
}

function ProfileSection({ user, updateUser }: {
  user: { name: string; email: string; initials: string }
  updateUser: (name: string, email: string) => void
}) {
  const [name, setName]   = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const { signOut }       = useAuth()
  const { setScreen }     = useApp()
  const { t }             = useLanguage()

  return (
    <>
      <PageHead title={t('ap_profile_title')} sub={t('ap_profile_sub')} />
      <Card label={t('ap_personal_info')}>
        <EditRow
          label={t('ap_full_name')}
          value={name}
          onSave={v => { setName(v); updateUser(v, email) }}
          editLabel={t('ap_edit')}
          saveLabel={t('ap_save')}
          cancelLabel={t('ap_cancel')}
        />
        <EditRow
          label={t('ap_label_email')}
          value={email}
          onSave={v => { setEmail(v); updateUser(name, v) }}
          editLabel={t('ap_edit')}
          saveLabel={t('ap_save')}
          cancelLabel={t('ap_cancel')}
        />
      </Card>
      <Card label={t('ap_avatar_section')}>
        <div className="ap-row">
          <div className="ap-row-left">
            <div className="ap-row-label">{t('ap_profile_pic')}</div>
            <div className="ap-row-value">{t('ap_profile_pic_desc')}</div>
          </div>
          <div className="ap-avatar-row-right">
            <div className="ap-av-sm">{user.initials}</div>
          </div>
        </div>
      </Card>
      <Card label={t('ap_session_section')}>
        <Row
          label={t('ap_signout_label')}
          value={t('ap_signout_desc')}
          action={() => { signOut(); setScreen('landing') }}
          actionLabel={t('ap_signout')}
        />
      </Card>
    </>
  )
}

function SubscriptionSection({ onUpgrade, onPortal }: { onUpgrade: () => void; onPortal: () => void }) {
  const { subscription, customer, isPaid, plans, openCheckout } = useSubscription()
  const { t } = useLanguage()
  const dateLocale = t('date_locale')
  const paidPlans = plans.filter(p => p.slug !== 'free')

  const statusLabel: Record<string, string> = {
    active:   t('ap_status_active'),
    trialing: t('ap_status_trialing'),
    past_due: t('ap_status_past_due'),
    canceled: t('ap_status_canceled'),
    free:     t('ap_status_free'),
  }

  return (
    <>
      <PageHead title={t('ap_sub_title')} sub={t('ap_sub_sub')} />
      <PlanCard onUpgrade={onUpgrade} onPortal={onPortal} />

      {isPaid && (
        <Card label={t('ap_sub_details')}>
          <Row label={t('ap_status_label')} value={statusLabel[subscription?.status ?? ''] ?? subscription?.status ?? '—'} />
          <Row label={t('ap_plan_label')}   value={subscription?.plans?.name ?? '—'} />
          <Row
            label={t('ap_period_label')}
            value={subscription?.current_period_start && subscription?.current_period_end
              ? `${new Date(subscription.current_period_start).toLocaleDateString(dateLocale)} → ${new Date(subscription.current_period_end).toLocaleDateString(dateLocale)}`
              : '—'
            }
          />
          <Row
            label={t('ap_autorenew_label')}
            value={subscription?.cancel_at_period_end ? t('ap_autorenew_off') : t('ap_autorenew_on')}
          />
          <Row
            label={t('ap_portal_label')}
            value={t('ap_portal_desc')}
            action={onPortal}
            actionLabel={t('ap_open_portal')}
          />
        </Card>
      )}

      {!isPaid && paidPlans.length > 0 && (
        <Card label={t('ap_pro_plans')}>
          {paidPlans.map(plan => {
            const isAnnual = plan.interval === 'year'
            const localName = isAnnual ? t('plan_annual_name') : t('plan_monthly_name')
            const localDesc = isAnnual ? t('plan_annual_desc') : t('plan_monthly_desc')
            return (
              <div key={plan.id} className="ap-row">
                <div className="ap-row-left">
                  <div className="ap-row-label">
                    {localName}
                    {plan.discount_percent > 0 && (
                      <span style={{ marginLeft: 8, color: 'var(--p)', fontSize: 11 }}>−{plan.discount_percent}%</span>
                    )}
                  </div>
                  <div className="ap-row-value">
                    ${plan.price.toFixed(2)}{isAnnual ? t('ap_per_year') : t('ap_per_month')} · {localDesc}
                  </div>
                </div>
                <button className="ap-row-action" onClick={() => openCheckout(plan.slug)}>{t('ap_choose')}</button>
              </div>
            )
          })}
        </Card>
      )}

      <Card label={t('ap_billing_data')}>
        <Row label={t('ap_billing_name')}  value={customer?.billing_name  || customer?.email || '—'} />
        <Row label={t('ap_billing_email')} value={customer?.billing_email || customer?.email || '—'} />
      </Card>
    </>
  )
}

function BillingPolicySection() {
  const { t } = useLanguage()
  return (
    <>
      <PageHead title={t('ap_billing_title')} sub={t('ap_billing_sub')} />
      <Card label={t('ap_billing_how')}>
        <Row label={t('ap_billing_recurring')}     value={t('ap_billing_recurring_desc')} />
        <Row label={t('ap_billing_cancel_label')}  value={t('ap_billing_cancel_desc')} />
        <Row label={t('ap_billing_refund')}        value={t('ap_billing_refund_desc')} />
        <Row label={t('ap_billing_dispute')}       value={t('ap_billing_dispute_desc')} />
      </Card>
    </>
  )
}

function FeedbackSection() {
  const { t } = useLanguage()
  return (
    <>
      <PageHead title={t('ap_feedback_title')} sub={t('ap_feedback_sub')} />
      <Card label={t('ap_feedback_contact')}>
        <Row
          label={t('ap_feedback_label')}
          value="feedback@soneker.com"
          action={() => { window.location.href = 'mailto:feedback@soneker.com' }}
          actionLabel={t('ap_feedback_send')}
        />
        <Row label={t('ap_feedback_what')} value={t('ap_feedback_what_desc')} />
      </Card>
    </>
  )
}

function SupportSection() {
  const { t } = useLanguage()
  return (
    <>
      <PageHead title={t('ap_support_title')} sub={t('ap_support_sub')} />
      <Card label={t('ap_support_contact')}>
        <Row
          label={t('ap_support_label')}
          value="support@soneker.com"
          action={() => { window.location.href = 'mailto:support@soneker.com' }}
          actionLabel={t('ap_support_contact_btn')}
        />
        <Row label={t('ap_support_when')} value={t('ap_support_when_desc')} />
      </Card>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, updateUser, signOut } = useAuth()
  const { setScreen }                 = useApp()
  const { isPaid, openPortal }        = useSubscription()
  const { t }                         = useLanguage()
  const [tab, setTab]                 = useState<ApTab>('overview')
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!user) { setScreen('landing'); return null }

  const NAV: { id: ApTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',     label: t('ap_nav_overview'),     icon: <IGrid /> },
    { id: 'profile',      label: t('ap_nav_profile'),      icon: <IUser /> },
    { id: 'subscription', label: t('ap_nav_subscription'), icon: <ICard /> },
    { id: 'billing',      label: t('ap_nav_billing'),      icon: <IDoc /> },
    { id: 'feedback',     label: t('ap_nav_feedback'),     icon: <IMail /> },
    { id: 'support',      label: t('ap_nav_support'),      icon: <IPin /> },
  ]

  const handleUpgrade = () => setShowUpgrade(true)
  const handlePortal  = () => openPortal()

  return (
    <div className="ap-root">

      <aside className="ap-sidebar">
        <button className="ap-sb-back" onClick={() => setScreen('landing')}>
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('ap_back')}
        </button>

        <div className="ap-sb-identity">
          <div className="ap-sb-av">{user.initials}</div>
          <div className="ap-sb-name">{user.name}</div>
          <div className="ap-sb-email">{user.email}</div>
          <div className="ap-sb-badge">{isPaid ? t('ap_pro_badge') : t('ap_free_badge')}</div>
        </div>

        <nav className="ap-sb-nav">
          <div className="ap-sb-group">{t('ap_nav_general')}</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`ap-sb-item${tab === item.id ? ' ap-sb-on' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ap-sb-footer">
          <button className="ap-sb-signout" onClick={() => { signOut(); setScreen('landing') }}>
            <ISignOut />
            {t('ap_signout')}
          </button>
        </div>
      </aside>

      <main className="ap-main">
        <div className="ap-scroll">
          <div className="ap-inner">
            {tab === 'overview'     && <OverviewSection user={user} onUpgrade={handleUpgrade} onPortal={handlePortal} />}
            {tab === 'profile'      && <ProfileSection  user={user} updateUser={updateUser} />}
            {tab === 'subscription' && <SubscriptionSection onUpgrade={handleUpgrade} onPortal={handlePortal} />}
            {tab === 'billing'      && <BillingPolicySection />}
            {tab === 'feedback'     && <FeedbackSection />}
            {tab === 'support'      && <SupportSection />}
          </div>
        </div>
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
