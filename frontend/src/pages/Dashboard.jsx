import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const user = auth.currentUser
      const res = await axios.get(`http://localhost:5000/api/sessions/${user.uid}`)
      setSessions(res.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#4ade80'
    if (score >= 5) return '#fbbf24'
    return '#f87171'
  }

  const getScoreBg = (score) => {
    if (score >= 8) return 'rgba(74,222,128,0.1)'
    if (score >= 5) return 'rgba(251,191,36,0.1)'
    return 'rgba(248,113,113,0.1)'
  }

  const avgScore = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length).toFixed(1)
    : 0

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <p style={{ color: 'white', fontSize: '20px' }}>Loading your history...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>Interview Prep AI</span>
        </div>
        <button onClick={() => navigate('/home')} style={{
          padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px'
        }}>← Back to Home</button>
      </div>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>
          📊 Your Progress
        </h2>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Total Sessions', value: sessions.length, icon: '🎯' },
            { label: 'Average Score', value: `${avgScore}/10`, icon: '⭐' },
            { label: 'Questions Done', value: sessions.reduce((sum, s) => sum + s.questions.length, 0), icon: '✅' }
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sessions List */}
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Recent Sessions
        </h3>

        {sessions.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '60px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No sessions yet. Start practicing!</p>
            <button onClick={() => navigate('/home')} style={{
              marginTop: '16px', padding: '12px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>Start First Session</button>
          </div>
        ) : (
          sessions.map((session, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '24px', marginBottom: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: '18px' }}>{session.role}</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                    background: 'rgba(102,126,234,0.2)', color: '#667eea', textTransform: 'capitalize'
                  }}>{session.difficulty}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    {session.questions.length} questions
                  </span>
                </div>
              </div>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: getScoreBg(session.averageScore),
                border: `2px solid ${getScoreColor(session.averageScore)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ color: getScoreColor(session.averageScore), fontWeight: '800', fontSize: '16px' }}>
                  {session.averageScore}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>/10</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard