'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import type { Screen } from '@/types'

const OTP_LENGTH = 8

interface AuthScreenProps {
  mode: 'signin' | 'signup'
}

export default function AuthScreen({ mode: initialMode }: AuthScreenProps) {
  const { sendOtp, verifyOtp, user } = useAuth()
  const { setScreen }                = useApp()

  const [mode, setMode]     = useState(initialMode)
  const [step, setStep]     = useState<'email' | 'otp'>('email')
  const [email, setEmail]   = useState('')
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')
  const [shake, setShake]   = useState(false)
  const [resend, setResend] = useState(0)
  const emailRef            = useRef<HTMLInputElement>(null)
  const inputRefs           = useRef<(HTMLInputElement | null)[]>([])

  // Redirect when already signed in
  useEffect(() => {
    if (user) setScreen('landing')
  }, [user, setScreen])

  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  useEffect(() => {
    if (resend <= 0) return
    const t = setTimeout(() => setResend(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resend])

  const triggerShake = useCallback(() => {
    setShake(true); setTimeout(() => setShake(false), 500)
  }, [])

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m); setError(''); setEmail('')
    setScreen(m as Screen)
  }

  // ── Step 1: send OTP ──────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoad(true); setError('')
    const { error: err } = await sendOtp(email.trim())
    setLoad(false)
    if (err) { setError(err); triggerShake() }
    else { setStep('otp'); setResend(60); setTimeout(() => inputRefs.current[0]?.focus(), 80) }
  }

  // ── Step 2: digit input ───────────────────────────────────────
  const handleDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[index] = char; setDigits(next); setError('')
    if (char && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    if (char && next.every(d => d !== '')) submitOtp(next.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) { const n = [...digits]; n[index] = ''; setDigits(n) }
      else if (index > 0) inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft'  && index > 0)              inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    if (pasted.length === OTP_LENGTH) submitOtp(pasted)
  }

  const submitOtp = async (token: string) => {
    setLoad(true); setError('')
    const { error: err } = await verifyOtp(email.trim(), token)
    setLoad(false)
    if (err) {
      setError('Invalid code. Please try again.')
      setDigits(Array(OTP_LENGTH).fill(''))
      triggerShake()
      setTimeout(() => inputRefs.current[0]?.focus(), 80)
    }
    // Success: useEffect above detects user change → redirects to landing
  }

  const handleResend = async () => {
    if (resend > 0) return
    setError(''); setDigits(Array(OTP_LENGTH).fill(''))
    const { error: err } = await sendOtp(email.trim())
    if (err) setError(err)
    else { setResend(60); setTimeout(() => inputRefs.current[0]?.focus(), 80) }
  }

  return (
    <div className="sg-root">
      <div className={`sg-card${shake ? ' sg-shake' : ''}`}>

        {/* Back to landing */}
        <button className="sg-back-home" onClick={() => setScreen('landing')}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* ── Email step ── */}
        {step === 'email' && (
          <>
            <div className="sg-icon">
              <svg viewBox="0 0 20 20" fill="none" width="30" height="30">
                <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,.4)" stroke="#fff" strokeWidth="1.2"/>
                <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4.9 4.9l1.5 1.5M13.6 13.6l1.5 1.5M4.9 15.1l1.5-1.5M13.6 6.4l1.5-1.5" stroke="rgba(255,255,255,.55)" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className="sg-title">
              {mode === 'signin' ? 'Access your account' : 'Create your account'}
            </h1>
            <h2 className="sg-subtitle">Get a code by email</h2>
            <p className="sg-desc">
              {mode === 'signin'
                ? "We'll send a temporary code to confirm access."
                : "We'll send a temporary code to confirm your registration."}
            </p>

            <form className="sg-form" onSubmit={handleSend}>
              <div className="sg-field">
                <label className="sg-label">Email</label>
                <input
                  ref={emailRef}
                  className="sg-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  required
                />
                <span className={`sg-hint${error ? ' sg-hint-err' : ''}`}>
                  {error || 'Enter your email to continue.'}
                </span>
              </div>

              <button type="submit" className="sg-btn" disabled={loading || !email.trim()}>
                {loading ? <span className="sg-spin" /> : 'Get code'}
              </button>
            </form>

            <p className="sg-toggle">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="sg-toggle-link"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                {mode === 'signin' ? 'Create account' : 'Log in'}
              </button>
            </p>
          </>
        )}

        {/* ── OTP step ── */}
        {step === 'otp' && (
          <>
            <div className="sg-icon sg-icon-mail">
              <svg viewBox="0 0 20 20" fill="none" width="30" height="30">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="#fff" strokeWidth="1.4"/>
                <path d="M2 7l8 5 8-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="sg-title">Check your email</h1>
            <h2 className="sg-subtitle">Enter your verification code</h2>
            <p className="sg-desc">
              We sent a {OTP_LENGTH}-digit code to{' '}
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>

            <div className="sg-otp-row" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  className={`sg-otp-box${d ? ' sg-otp-filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && <p className="sg-hint sg-hint-err" style={{ textAlign: 'center' }}>{error}</p>}

            <button
              className="sg-btn"
              onClick={() => submitOtp(digits.join(''))}
              disabled={loading || digits.some(d => !d)}
            >
              {loading ? <span className="sg-spin" /> : 'Verify code'}
            </button>

            <p className="sg-toggle">
              Didn&apos;t receive it?{' '}
              {resend > 0
                ? <span style={{ color: 'var(--text3)' }}>Resend in {resend}s</span>
                : <button className="sg-toggle-link" onClick={handleResend}>Resend code</button>
              }
            </p>

            <button
              className="sg-back"
              onClick={() => { setStep('email'); setError(''); setDigits(Array(OTP_LENGTH).fill('')) }}
            >
              ← Back
            </button>
          </>
        )}

      </div>
    </div>
  )
}
