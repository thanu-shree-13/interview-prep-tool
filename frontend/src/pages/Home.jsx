import { useState } from 'react'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const navigate = useNavigate()

  const handleStart = () => {
    if (!role) { alert('Please enter a job role'); return }
    navigate('/practice', { state: { role, difficulty } })
  }

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/')
  }

  const roles = ['React Developer', 'Node.js Developer', 'Full Stack Developer', 'Python Developer', 'Data Scientist', 'DevOps Engineer']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      
      {/* Navbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>Interview Prep AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{auth.currentUser?.email}</span>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px'
          }}>Dashboard</button>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: 'rgba(255,80,80,0.2)', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px'
          }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '800', margin: '0 0 16px' }}>
            Ace Your Next Interview
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', margin: 0 }}>
            AI-powered practice with instant feedback and voice support
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '40px'
        }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '24px' }}>Start a Practice Session</h2>

          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Job Role
          </label>
          <input
            type="text"
            placeholder="e.g. React Developer, Data Scientist..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)',
              color: 'white', fontSize: '15px', outline: 'none',
              boxSizing: 'border-box', marginBottom: '16px'
            }}
          />

          {/* Quick select roles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {roles.map(r => (
              <span key={r} onClick={() => setRole(r)} style={{
                padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', background: role === r ? 'rgba(102,126,234,0.3)' : 'transparent'
              }}>{r}</span>
            ))}
          </div>

          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Difficulty
          </label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {['easy', 'medium', 'hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: difficulty === d ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
                color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                textTransform: 'capitalize'
              }}>{d}</button>
            ))}
          </div>

          <button onClick={handleStart} style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', fontSize: '18px', fontWeight: '700', cursor: 'pointer'
          }}>
            🚀 Start Practice
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          {[
            { icon: '🤖', label: 'AI Generated', desc: 'Fresh questions every session' },
            { icon: '🎤', label: 'Voice Input', desc: 'Speak your answers naturally' },
            { icon: '📊', label: 'Track Progress', desc: 'See improvement over time' }
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home