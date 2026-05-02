import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/home')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎯</div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Interview Prep AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: 'block', width: '100%', padding: '14px 16px',
            marginBottom: '12px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.07)', color: 'white',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: 'block', width: '100%', padding: '14px 16px',
            marginBottom: '20px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.07)', color: 'white',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}
        />

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            color: '#ff6b6b', fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', marginBottom: '20px'
          }}
        >
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{ color: '#667eea', cursor: 'pointer', marginLeft: '5px', fontWeight: '600' }}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login