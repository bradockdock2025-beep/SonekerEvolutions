'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AuthModal() {
  const { isAuthOpen, authMode, authReason, closeAuth, mockSignIn } = useAuth()

  const [mode, setMode]               = useState<'signin' | 'signup'>(authMode)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [socialLoading, setSocial]    = useState<string | null>(null)
  const overlayRef                    = useRef<HTMLDivElement>(null)

  useEffect(() => { setMode(authMode) }, [authMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuth() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeAuth])

  useEffect(() => {
    document.body.style.overflow = isAuthOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isAuthOpen])

  if (!isAuthOpen) return null

  const reset = () => { setName(''); setEmail(''); setPassword('') }

  const switchMode = (m: 'signin' | 'signup') => { setMode(m); reset() }

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeAuth()
  }

  const handleSocial = (provider: 'google' | 'github') => {
    setSocial(provider)
    const data = {
      google: { name: 'Alex Chen',    email: 'alex@gmail.com'  },
      github: { name: 'Alex Chen',    email: 'alex@github.com' },
    }
    setTimeout(() => {
      mockSignIn(data[provider].name, data[provider].email)
      setSocial(null)
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (mode === 'signup' && !name) return
    setLoading(true)
    setTimeout(() => {
      mockSignIn(mode === 'signup' ? name : email.split('@')[0], email)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="auth-card" role="dialog" aria-modal="true">

        {/* Close */}
        <button className="auth-close" onClick={closeAuth} aria-label="Close">
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-mark" style={{ width: 30, height: 30 }}>
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" fill="rgba(108,95,255,.3)" stroke="#6c5fff" strokeWidth="1"/>
              <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke="#a398ff" strokeWidth="1.1" strokeLinecap="round"/>
              <path d="M4 4l1.2 1.2M10.8 10.8l1.2 1.2M4 12l1.2-1.2M10.8 5.2l1.2-1.2" stroke="#a398ff" strokeWidth=".9" strokeLinecap="round" opacity=".45"/>
            </svg>
          </div>
          <span className="auth-logo-name">Soneker</span>
        </div>

        {/* Contextual reason */}
        {authReason && (
          <div className="auth-reason">
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 5v4M7 4v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {authReason}
          </div>
        )}

        {/* Heading */}
        <h2 className="auth-heading">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="auth-sub">
          {mode === 'signin'
            ? 'Sign in to access your saved analyses and library.'
            : 'Start free. No credit card required.'}
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'signin' ? ' auth-tab-on' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${mode === 'signup' ? ' auth-tab-on' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Social buttons */}
        <div className="auth-socials">
          <button
            className="auth-social"
            onClick={() => handleSocial('google')}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === 'google' ? <span className="auth-spin" /> : (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>Google</span>
          </button>

          <button
            className="auth-social"
            onClick={() => handleSocial('github')}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === 'github' ? <span className="auth-spin" /> : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider"><span>or continue with email</span></div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Alex Chen"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              {mode === 'signin' && (
                <button type="button" className="auth-forgot">Forgot password?</button>
              )}
            </div>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || !!socialLoading}
          >
            {loading
              ? <span className="auth-spin auth-spin-white" />
              : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Toggle */}
        <p className="auth-toggle">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-toggle-btn"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        {/* Terms */}
        <p className="auth-terms">
          By continuing you agree to our{' '}
          <button className="auth-link">Terms</button> and{' '}
          <button className="auth-link">Privacy Policy</button>
        </p>

      </div>
    </div>
  )
}
