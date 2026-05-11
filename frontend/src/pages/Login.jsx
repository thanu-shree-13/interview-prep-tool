import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #f5f5f4;
  --surface:      #ffffff;
  --border:       rgba(0,0,0,0.1);
  --border-focus: rgba(0,0,0,0.25);
  --text:         #111;
  --text-2:       #555;
  --text-3:       #999;
  --radius-sm:    7px;
  --radius:       9px;
  --radius-lg:    12px;
  --font:         'Geist', -apple-system, sans-serif;
}

html, body { height: 100%; background: var(--bg); }

.lp {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  background: var(--bg);
  padding: 24px;
}

.lp-card {
  width: 100%;
  max-width: 380px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);
  overflow: hidden;
}

.lp-card-head {
  padding: 28px 28px 22px;
  border-bottom: 1px solid var(--border);
}

.lp-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
}

.lp-logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 4px;
}

.lp-head-sub {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.5;
}

.lp-card-body {
  padding: 22px 28px 28px;
}

.lp-g-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 13.5px;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  margin-bottom: 18px;
  transition: background 0.15s, border-color 0.15s;
}

.lp-g-btn:hover:not(:disabled) { background: #fafafa; border-color: var(--border-focus); }
.lp-g-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lp-g-btn svg { flex-shrink: 0; }

.lp-sep {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.lp-sep-line { flex: 1; height: 1px; background: var(--border); }

.lp-sep-txt {
  font-size: 12px;
  color: var(--text-3);
}

.lp-field { margin-bottom: 12px; }

.lp-row-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.lp-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
}

.lp-forgot {
  font-size: 12.5px;
  color: var(--text-3);
  cursor: pointer;
  transition: color 0.15s;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lp-forgot:hover { color: var(--text); }

.lp-input {
  display: block;
  width: 100%;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 13.5px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
}

.lp-input::placeholder { color: var(--text-3); }

.lp-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.lp-error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  margin-bottom: 14px;
  color: #b91c1c;
  font-size: 12.5px;
  line-height: 1.5;
}

.lp-error svg { flex-shrink: 0; margin-top: 1px; }

.lp-info {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  margin-bottom: 14px;
  color: #166534;
  font-size: 12.5px;
  line-height: 1.5;
}

.lp-submit {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: none;
  background: #111;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 18px;
  transition: background 0.15s, opacity 0.15s;
  letter-spacing: -0.01em;
}

.lp-submit:hover:not(:disabled) { background: #222; }
.lp-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.lp-spin {
  display: inline-block;
  width: 12px; height: 12px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lp-spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 7px;
}

.lp-spin-dark {
  border: 1.5px solid rgba(0,0,0,0.12);
  border-top-color: rgba(0,0,0,0.5);
}

@keyframes lp-spin { to { transform: rotate(360deg); } }

.lp-toggle {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
}

.lp-toggle-link {
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s;
}

.lp-toggle-link:hover { opacity: 0.7; }

@media (max-width: 480px) {
  .lp { padding: 16px; align-items: flex-start; padding-top: 40px; }
  .lp-card-body { padding: 18px 20px 24px; }
  .lp-card-head { padding: 22px 20px 18px; }
}
`

const googleProvider = new GoogleAuthProvider()

const LogoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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

const WarnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
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
    setLoading(true); setError(''); setInfo('')
    try {
      isSignup
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password)
      navigate('/home')
    } catch (err) {
      setError(fmtErr(err.message))
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGLoading(true); setError(''); setInfo('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/home')
    } catch (err) {
      // If popup is blocked, fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider)
          // Page will redirect; no further action needed
        } catch (redirectErr) {
          setError(fmtErr(redirectErr.message))
        }
      } else if (err.code !== 'auth/cancelled-popup-request') {
        setError(fmtErr(err.message))
      }
    }
    setGLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address above, then click Forgot password.'); return }
    setError(''); setInfo('')
    try {
      await sendPasswordResetEmail(auth, email)
      setInfo('Password reset email sent. Check your inbox.')
    } catch (err) {
      setError(fmtErr(err.message))
    }
  }

  const onKey  = e => { if (e.key === 'Enter') handleSubmit() }
  const toggle = () => { setIsSignup(p => !p); setError(''); setInfo('') }

  return (
    <div className="lp">
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
          <p className="lp-head-sub">
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
              ? <><span className="lp-spin lp-spin-dark" />Connecting…</>
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
              placeholder="you@example.com"
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
                <button className="lp-forgot" onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              )}
            </div>
            <input
              className="lp-input"
              type="password"
              placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
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

          {/* Info */}
          {info && (
            <div className="lp-info">
              {info}
            </div>
          )}

          {/* Submit */}
          <button
            className="lp-submit"
            onClick={handleSubmit}
            disabled={loading || gLoading}
          >
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
      </div>
    </div>
  )
}