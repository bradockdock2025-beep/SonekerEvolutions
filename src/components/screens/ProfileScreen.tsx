'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'

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

const NAV: { id: ApTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'Visão geral',        icon: <IGrid /> },
  { id: 'profile',      label: 'Perfil',              icon: <IUser /> },
  { id: 'subscription', label: 'Assinatura e plano',  icon: <ICard /> },
  { id: 'billing',      label: 'Política de cobrança', icon: <IDoc /> },
  { id: 'feedback',     label: 'Feedback',            icon: <IMail /> },
  { id: 'support',      label: 'Suporte',             icon: <IPin /> },
]

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

function EditRow({
  label, value, onSave,
}: {
  label: string
  value: string
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)

  if (editing) {
    return (
      <div className="ap-row ap-row-editing">
        <div className="ap-row-left" style={{ flex: 1 }}>
          <div className="ap-row-label">{label}</div>
          <input
            className="ap-edit-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
          />
        </div>
        <div className="ap-edit-actions">
          <button className="ap-edit-save" onClick={() => { onSave(draft); setEditing(false) }}>Salvar</button>
          <button className="ap-edit-cancel" onClick={() => { setDraft(value); setEditing(false) }}>Cancelar</button>
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
      <button className="ap-row-action" onClick={() => setEditing(true)}>Editar</button>
    </div>
  )
}

function PlanCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="ap-plan-card">
      <div>
        <div className="ap-plan-eyebrow">PLANO ATUAL</div>
        <div className="ap-plan-name">Gratuito</div>
        <div className="ap-plan-desc">Plano gratuito</div>
      </div>
      <button className="ap-plan-upgrade" onClick={onUpgrade}>Fazer upgrade →</button>
    </div>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function OverviewSection({ user }: { user: { name: string; email: string } }) {
  return (
    <>
      <PageHead title="Visão geral" sub="Seu resumo de conta" />
      <PlanCard onUpgrade={() => {}} />
      <Card label="DETALHES DA CONTA">
        <Row label="Nome" value={user.name} />
        <Row label="E-mail" value={user.email} />
        <Row label="Membro desde" value="março de 2026" />
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

  return (
    <>
      <PageHead title="Perfil" sub="Gerencie suas informações pessoais" />

      <Card label="INFORMAÇÕES PESSOAIS">
        <EditRow label="Nome completo" value={name} onSave={v => { setName(v); updateUser(v, email) }} />
        <EditRow label="E-mail" value={email} onSave={v => { setEmail(v); updateUser(name, v) }} />
        <EditRow label="Nome de exibição" value={name} onSave={v => { setName(v); updateUser(v, email) }} />
      </Card>

      <Card label="FOTO DE PERFIL">
        <div className="ap-row">
          <div className="ap-row-left">
            <div className="ap-row-label">Avatar</div>
            <div className="ap-row-value">Usando iniciais geradas</div>
          </div>
          <div className="ap-avatar-row-right">
            <div className="ap-av-sm">{user.initials}</div>
            <button className="ap-row-action">Alterar</button>
          </div>
        </div>
      </Card>

      <Card label="SEGURANÇA">
        <Row label="Senha" value="Atualize sua senha de acesso" action={() => {}} actionLabel="Alterar" />
        <Row label="Sair" value="Encerrar sua sessão atual" action={() => {}} actionLabel="Sair" />
      </Card>
    </>
  )
}

function SubscriptionSection() {
  return (
    <>
      <PageHead title="Assinatura e plano" sub="Gerencie sua assinatura e cobrança" />
      <PlanCard onUpgrade={() => {}} />
      <Card label="INFORMAÇÕES DE COBRANÇA">
        <Row label="Método de pagamento" value="Nenhum cartão cadastrado" action={() => {}} actionLabel="Adicionar" />
        <Row label="Status da assinatura" value="Plano gratuito" />
        <EditRow label="Nome de cobrança" value="bradockdock2025" onSave={() => {}} />
        <EditRow label="E-mail de cobrança" value="bradockdock2025@gmail.com" onSave={() => {}} />
        <Row label="Política de cobrança" value="Cobrança recorrente, cancelamento, reembolsos e disputas de pagamento." action={() => {}} actionLabel="Ver" />
      </Card>
    </>
  )
}

function BillingPolicySection() {
  return (
    <>
      <PageHead title="Política de cobrança" sub="Regras claras para renovação, cancelamento, reembolso e disputas de pagamento." />
      <Card label="COMO A SUA ASSINATURA FUNCIONA">
        <Row
          label="Cobrança recorrente"
          value="As assinaturas pagas renovam automaticamente no período mensal ou anual escolhido até que as próximas renovações sejam canceladas."
        />
        <Row
          label="Cancelamento"
          value="O cancelamento interrompe apenas a próxima renovação. O acesso permanece ativo até o fim do período já pago."
        />
        <Row
          label="Reembolsos"
          value="Valores pagos não são reembolsáveis."
        />
        <Row
          label="Disputas de pagamento"
          value="Chargebacks e disputas ainda podem ser abertos junto ao emissor do cartão e seguem as regras da bandeira."
        />
      </Card>
    </>
  )
}

function FeedbackSection() {
  return (
    <>
      <PageHead title="Feedback" sub="Envie sugestões, relate problemas ou compartilhe feedback do produto." />
      <Card label="E-MAIL DE CONTATO">
        <Row label="E-mail de feedback" value="feedback@soneker.com" action={() => {}} actionLabel="Enviar e-mail" />
        <Row label="O que enviar" value="Use este canal para ideias de produto, bugs e feedback geral." />
      </Card>
    </>
  )
}

function SupportSection() {
  return (
    <>
      <PageHead title="Suporte" sub="Obtenha ajuda com acesso, cobrança ou problemas da conta." />
      <Card label="CONTATO DE SUPORTE">
        <Row label="E-mail de suporte" value="support@soneker.com" action={() => {}} actionLabel="Contactar suporte" />
        <Row label="Quando usar suporte" value="Use este canal para acesso à conta, assinatura, cobrança e pedidos de suporte técnico." />
      </Card>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, updateUser, signOut } = useAuth()
  const { setScreen }                 = useApp()
  const [tab, setTab]                 = useState<ApTab>('overview')

  if (!user) { setScreen('landing'); return null }

  return (
    <div className="ap-root">

      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">

        {/* Back to home */}
        <button className="ap-sb-back" onClick={() => setScreen('landing')}>
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Identity */}
        <div className="ap-sb-identity">
          <div className="ap-sb-av">{user.initials}</div>
          <div className="ap-sb-name">{user.name}</div>
          <div className="ap-sb-email">{user.email}</div>
          <div className="ap-sb-badge">● Plano Gratuito</div>
        </div>

        {/* Nav */}
        <nav className="ap-sb-nav">
          <div className="ap-sb-group">GERAL</div>
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

        {/* Footer */}
        <div className="ap-sb-footer">
          <button
            className="ap-sb-signout"
            onClick={() => { signOut(); setScreen('landing') }}
          >
            <ISignOut />
            Sair
          </button>
        </div>

      </aside>

      {/* ── Content ── */}
      <main className="ap-main">
        <div className="ap-scroll">
          <div className="ap-inner">
            {tab === 'overview'     && <OverviewSection user={user} />}
            {tab === 'profile'      && <ProfileSection user={user} updateUser={updateUser} />}
            {tab === 'subscription' && <SubscriptionSection />}
            {tab === 'billing'      && <BillingPolicySection />}
            {tab === 'feedback'     && <FeedbackSection />}
            {tab === 'support'      && <SupportSection />}
          </div>
        </div>
      </main>

    </div>
  )
}
