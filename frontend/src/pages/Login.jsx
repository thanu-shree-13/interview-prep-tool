import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const googleProvider = new GoogleAuthProvider()

/* ================================================================
   STYLES
================================================================ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #0a0a0a;
  --surface:      #111111;
  --surface-2:    #1a1a1a;
  --border:       #1f1f1f;
  --border-focus: #333;
  --text:         #ededed;
  --text-2:       #888;
  --text-3:       #555;
  --accent:       #fff;
  --accent-dim:   rgba(255,255,255,0.06);
  --blue:         #2563eb;
  --blue-glow:    rgba(37,99,235,0.15);
  --green:        #16a34a;
  --radius-sm:    8px;
  --radius:       10px;
  --radius-lg:    14px;
  --font:         'Geist', -apple-system, sans-serif;
  --mono:         'Geist Mono', monospace;
  --ease:         cubic-bezier(0.16,1,0.3,1);
  --shadow:       0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4);
}

html, body { height: 100%; background: var(--bg); }

/* ── Root layout ── */
.lp {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  background: var(--bg);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ── Ambient background geometry ── */
.lp-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* large blurred orbs */
.lp-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.06;
}

.lp-orb-1 {
  width: 600px; height: 600px;
  top: -200px; left: -150px;
  background: #2563eb;
  animation: orb-drift-1 20s ease-in-out infinite;
}

.lp-orb-2 {
  width: 500px; height: 500px;
  bottom: -200px; right: -100px;
  background: #7c3aed;
  animation: orb-drift-2 25s ease-in-out infinite;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(60px, 40px); }
}

@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-40px, -60px); }
}

/* fine dot grid */
.lp-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
}

/* ── Card ── */
.lp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: card-in 0.5s var(--ease) both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* thin top accent line */
.lp-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent);
}

/* ── Card header ── */
.lp-card-head {
  padding: 28px 28px 0;
}

/* Logo mark */
.lp-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
}

.lp-logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(37,99,235,0.35);
  flex-shrink: 0;
}

.lp-logo-mark svg { display: block; }

.lp-logo-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.lp-head-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.03em;
  margin-bottom: 5px;
  line-height: 1.2;
}

.lp-head-sub {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.5;
  font-weight: 400;
}

/* ── Card body ── */
.lp-card-body {
  padding: 24px 28px 28px;
}

/* Google button */
.lp-g-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border-focus);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13.5px;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  letter-spacing: -0.01em;
}

.lp-g-btn:hover:not(:disabled) {
  background: #222;
  border-color: #444;
  transform: translateY(-1px);
}

.lp-g-btn:active:not(:disabled) { transform: translateY(0); }
.lp-g-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.lp-g-btn svg { flex-shrink: 0; }

/* Divider */
.lp-sep {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.lp-sep-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.lp-sep-txt {
  font-size: 11.5px;
  color: var(--text-3);
  white-space: nowrap;
  font-family: var(--mono);
  letter-spacing: 0.04em;
}

/* Fields */
.lp-field { margin-bottom: 12px; }

.lp-row-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.lp-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-2);
  letter-spacing: -0.01em;
}

.lp-forgot {
  font-size: 12px;
  color: var(--text-3);
  cursor: pointer;
  transition: color 0.15s;
  font-weight: 400;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font);
}

.lp-forgot:hover { color: var(--text); }

.lp-input {
  display: block;
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 13.5px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  letter-spacing: -0.01em;
  -webkit-appearance: none;
}

.lp-input::placeholder { color: var(--text-3); }

.lp-input:focus {
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
}

/* Error */
.lp-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.18);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  margin-bottom: 14px;
  color: #f87171;
  font-size: 12.5px;
  line-height: 1.5;
}

.lp-error svg { flex-shrink: 0; margin-top: 1px; }

/* Submit */
.lp-submit {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: none;
  background: var(--text);
  color: #0a0a0a;
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 20px;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  letter-spacing: -0.02em;
  position: relative;
}

.lp-submit:hover:not(:disabled) {
  background: #e8e8e8;
  transform: translateY(-1px);
}

.lp-submit:active:not(:disabled) { transform: translateY(0); }
.lp-submit:disabled { opacity: 0.35; cursor: not-allowed; }

/* spinner */
.lp-spin {
  display: inline-block;
  width: 12px; height: 12px;
  border: 1.5px solid rgba(0,0,0,0.15);
  border-top-color: #0a0a0a;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 7px;
}

.lp-spin-white {
  border: 1.5px solid rgba(255,255,255,0.15);
  border-top-color: rgba(255,255,255,0.7);
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Toggle */
.lp-toggle {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
}

.lp-toggle-link {
  color: var(--text-2);
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.15s;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lp-toggle-link:hover { color: var(--text); }

/* ── Card footer / trust strip ── */
.lp-card-foot {
  border-top: 1px solid var(--border);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.lp-trust {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-3);
  font-family: var(--mono);
  letter-spacing: 0.02em;
}

.lp-trust svg { opacity: 0.5; }

/* ── Feature pills below card ── */
.lp-pills {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
  animation: card-in 0.5s var(--ease) 0.1s both;
}

.lp-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 11.5px;
  color: var(--text-3);
  letter-spacing: -0.01em;
  font-family: var(--font);
}

.lp-pill-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--green);
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .lp { padding: 16px; align-items: flex-start; padding-top: 48px; }
  .lp-card-body { padding: 20px 20px 24px; }
  .lp-card-head { padding: 22px 20px 0; }
  .lp-card-foot { padding: 12px 20px; gap: 16px; }
}
`

/* ================================================================
   SVG ICONS
================================================================ */
const LogoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="8" cy="8" r="2" fill="white"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const WarnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

/* ================================================================
   COMPONENT
================================================================ */
export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  const fmtErr = (msg = '') =>
    msg.replace('Firebase: ', '').replace(/\(auth\/.*?\)\.?/g, '').trim()
    || 'Something went wrong. Please try again.'

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      isSignup
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password)
      navigate('/home')
    } catch (err) { setError(fmtErr(err.message)) }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/home')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(fmtErr(err.message))
    }
    setGLoading(false)
  }

  const onKey    = e => { if (e.key === 'Enter') handleSubmit() }
  const toggle   = () => { setIsSignup(p => !p); setError('') }

  return (
    <div className="lp">

      {/* Ambient BG */}
      <div className="lp-bg">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-grid" />
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── CARD ── */}
        <div className="lp-card">

          {/* HEAD */}
          <div className="lp-card-head">
            <div className="lp-logo">
              <div className="lp-logo-mark"><LogoIcon /></div>
              <span className="lp-logo-name">Interview Prep AI</span>
            </div>
            <h1 className="lp-head-title">
              {isSignup ? 'Create an account' : 'Sign in'}
            </h1>
            <p className="lp-head-sub" style={{ marginBottom: 0, paddingBottom: 20 }}>
              {isSignup
                ? 'Start practising with AI-powered mock interviews.'
                : 'Welcome back. Enter your credentials to continue.'}
            </p>
          </div>

          {/* BODY */}
          <div className="lp-card-body">

            {/* Google */}
            <button className="lp-g-btn" onClick={handleGoogle} disabled={gLoading || loading}>
              {gLoading
                ? <><span className="lp-spin lp-spin-white" />Connecting to Google…</>
                : <><GoogleIcon />Continue with Google</>
              }
            </button>

            {/* Divider */}
            <div className="lp-sep">
              <div className="lp-sep-line" />
              <span className="lp-sep-txt">or</span>
              <div className="lp-sep-line" />
            </div>

            {/* Email */}
            <div className="lp-field">
              <div className="lp-row-label">
                <label className="lp-label">Email address</label>
              </div>
              <input
                className="lp-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-row-label">
                <label className="lp-label">Password</label>
                {!isSignup && (
                  <button className="lp-forgot" onClick={() => {}}>Forgot password?</button>
                )}
              </div>
              <input
                className="lp-input"
                type="password"
                placeholder={isSignup ? 'At least 8 characters' : '••••••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error">
                <WarnIcon />{error}
              </div>
            )}

            {/* Submit */}
            <button className="lp-submit" onClick={handleSubmit} disabled={loading || gLoading}>
              {loading && <span className="lp-spin" />}
              {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
            </button>

            {/* Toggle */}
            <div className="lp-toggle">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <span className="lp-toggle-link" onClick={toggle}>
                {isSignup ? 'Sign in' : 'Sign up'}
              </span>
            </div>

          </div>

          {/* FOOT */}
          <div className="lp-card-foot">
            <div className="lp-trust"><ShieldIcon />SOC 2 Type II</div>
            <div className="lp-trust"><LockIcon />End-to-end encrypted</div>
          </div>
        </div>

        {/* Pills below card */}
        <div className="lp-pills">
          <div className="lp-pill">
            <div className="lp-pill-dot" />
            All systems operational
          </div>
          <div className="lp-pill">GDPR compliant</div>
          <div className="lp-pill">99.9% uptime</div>
        </div>

      </div>
    </div>
  )
}