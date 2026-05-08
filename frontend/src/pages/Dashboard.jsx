import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const user = auth.currentUser
      const res  = await axios.get(`${process.env.REACT_APP_API_URL}/api/sessions/${user.uid}`)
      setSessions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0)
  const overallAvg = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length).toFixed(1)
    : 0
  const bestSession = sessions.length > 0
    ? sessions.reduce((best, s) => s.averageScore > best.averageScore ? s : best, sessions[0])
    : null

  const topicMap = {}
  sessions.forEach(session => {
    session.questions.forEach(q => {
      if (q.score < 6 && q.nextFocus) {
        const topic = q.nextFocus.toLowerCase().trim()
        if (!topicMap[topic]) topicMap[topic] = { count: 0, scores: [] }
        topicMap[topic].count++
        topicMap[topic].scores.push(q.score)
      }
    })
  })

  const weakTopics = Object.entries(topicMap)
    .map(([topic, data]) => ({
      topic,
      count: data.count,
      avgScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const roleMap = {}
  sessions.forEach(s => {
    if (!roleMap[s.role]) roleMap[s.role] = { scores: [], count: 0 }
    roleMap[s.role].scores.push(s.averageScore)
    roleMap[s.role].count++
  })
  const roleStats = Object.entries(roleMap)
    .map(([role, data]) => ({
      role,
      avg: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1),
      count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg)

  const trend = sessions.slice(0, 7).reverse().map((s, i) => ({
    label: `S${i + 1}`,
    score: s.averageScore,
    role:  s.role,
  }))

  const scoreColor = score => {
    if (score >= 8) return '#22C55E'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }

  const scoreBg = score => {
    if (score >= 8) return 'rgba(34,197,94,0.1)'
    if (score >= 5) return 'rgba(245,158,11,0.1)'
    return 'rgba(239,68,68,0.1)'
  }

  // Navigate to Results page with session data from history
  const handleViewSession = (session) => {
    navigate('/results', {
      state: {
        session: session.questions,
        role: session.role,
        difficulty: session.difficulty,
        company: session.company || '',
      }
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#09090E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3f3f5a', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>Loading your progress…</p>
    </div>
  )

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090E; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .anim-2 { animation: fadeUp 0.4s 0.12s ease both; }
        .anim-3 { animation: fadeUp 0.4s 0.18s ease both; }
        .anim-4 { animation: fadeUp 0.4s 0.24s ease both; }

        .nav-action {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .nav-action:hover {
          background: #1e1e2e !important;
          color: #e2e8f0 !important;
        }

        .session-card {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .session-card:hover {
          border-color: rgba(99,102,241,0.3) !important;
          background: rgba(99,102,241,0.04) !important;
        }
        .session-card:hover .view-label {
          opacity: 1 !important;
        }

        .stat-card:hover {
          border-color: rgba(99,102,241,0.2) !important;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 32px 0;
        }
      `}</style>

      {/* NAV */}
      <nav style={s.nav} className="anim-1">
        <div style={s.navBrand}>
          <div style={s.brandIcon}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600', color: '#fff', letterSpacing: '-0.03em' }}>P/</span>
          </div>
          <span style={s.brandName}>PrepAI</span>
          <span style={s.betaBadge}>BETA</span>
        </div>

        <div style={s.navLinks}>
          {['Practice', 'Dashboard'].map(item => (
            <button key={item} className="nav-action"
              onClick={() => item === 'Practice' ? navigate('/home') : null}
              style={{
                ...s.navLink,
                color: item === 'Dashboard' ? '#e2e8f0' : '#64748b',
                background: item === 'Dashboard' ? '#111118' : 'none',
              }}>
              {item}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={s.userChip}>{auth.currentUser?.email?.split('@')[0]}</span>
          <button onClick={() => auth.signOut().then(() => navigate('/'))} className="nav-action" style={s.signOutBtn}>
            Sign out
          </button>
        </div>
      </nav>

      {/* PAGE */}
      <div style={s.page}>

        {/* Header */}
        <div style={s.pageHead} className="anim-2">
          <div>
            <p style={s.eyebrow}>PERFORMANCE ANALYTICS</p>
            <h1 style={s.pageTitle}>Your Progress</h1>
            <p style={s.pageSub}>Track improvement and identify weak areas across all sessions</p>
          </div>
          <button onClick={() => navigate('/home')} style={s.newSessionBtn}>
            + New Session
          </button>
        </div>

        {/* STATS ROW */}
        <div style={s.statsRow} className="anim-3">
          {[
            { n: sessions.length,                                       label: 'Total Sessions',  sub: 'completed',     color: '#6366F1' },
            { n: `${overallAvg}/10`,                                    label: 'Average Score',   sub: 'across all',    color: '#22C55E' },
            { n: totalQuestions,                                        label: 'Questions',       sub: 'answered',      color: '#F59E0B' },
            { n: bestSession ? `${bestSession.averageScore}/10` : '—', label: 'Best Session',    sub: 'personal best', color: '#818CF8' },
          ].map(stat => (
            <div key={stat.label} className="stat-card" style={s.statCard}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stat.color, marginBottom: '16px', boxShadow: `0 0 8px ${stat.color}` }} />
              <span style={{ ...s.statN, color: stat.color }}>{stat.n}</span>
              <span style={s.statLabel}>{stat.label}</span>
              <span style={s.statSub}>{stat.sub}</span>
            </div>
          ))}
        </div>

        {sessions.length === 0 ? (
          <div style={s.emptyState} className="anim-4">
            <div style={s.emptyIcon}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', color: '#3f3f5a' }}>∅</span>
            </div>
            <h3 style={s.emptyTitle}>No sessions yet</h3>
            <p style={s.emptySub}>Start your first practice session to see your progress here.</p>
            <button onClick={() => navigate('/home')} style={s.startBtn}>Start Practicing →</button>
          </div>
        ) : (
          <>
            <div className="section-divider" />

            {/* TWO COL: Weak Topics + Role Performance */}
            <div style={s.twoCol} className="anim-3">

              {/* Weak Topics */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ ...s.cardDot, background: '#EF4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
                    <div>
                      <h2 style={s.cardTitle}>Weak Topics</h2>
                      <p style={s.cardSub}>Areas you consistently struggle with</p>
                    </div>
                  </div>
                </div>

                {weakTopics.length === 0 ? (
                  <div style={s.emptyInCard}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#22C55E' }}>✓</span>
                    <span style={{ fontSize: '13px', color: '#4b5563' }}>No weak topics detected — keep it up!</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {weakTopics.map((topic, i) => (
                      <div key={i} style={s.topicRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
                              {topic.topic}
                            </span>
                            <span style={{ color: scoreColor(parseFloat(topic.avgScore)), fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                              {topic.avgScore}/10
                            </span>
                          </div>
                          <div style={s.barTrack}>
                            <div style={{ ...s.barFill, width: `${(topic.avgScore / 10) * 100}%`, background: scoreColor(parseFloat(topic.avgScore)) }} />
                          </div>
                        </div>
                        <span style={s.topicCount}>{topic.count}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Role Performance */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ ...s.cardDot, background: '#6366F1', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
                    <div>
                      <h2 style={s.cardTitle}>Role Performance</h2>
                      <p style={s.cardSub}>Average score by interview type</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {roleStats.map((r, i) => (
                    <div key={i} style={s.topicRow}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                          <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>{r.role}</span>
                          <span style={{ color: scoreColor(parseFloat(r.avg)), fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                            {r.avg}/10
                          </span>
                        </div>
                        <div style={s.barTrack}>
                          <div style={{ ...s.barFill, width: `${(r.avg / 10) * 100}%`, background: scoreColor(parseFloat(r.avg)) }} />
                        </div>
                      </div>
                      <span style={s.topicCount}>{r.count} sess{r.count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SCORE TREND */}
            {trend.length > 1 && (
              <div style={{ ...s.card, marginBottom: '16px' }} className="anim-4">
                <div style={s.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ ...s.cardDot, background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                    <div>
                      <h2 style={s.cardTitle}>Score Trend</h2>
                      <p style={s.cardSub}>Your last {trend.length} sessions</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '90px' }}>
                  {trend.map((t, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: scoreColor(t.score), fontFamily: "'JetBrains Mono', monospace", fontWeight: '600' }}>
                        {t.score}
                      </span>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: `${(t.score / 10) * 60}px`,
                        background: scoreColor(t.score),
                        opacity: 0.75, minHeight: '4px',
                        boxShadow: `0 0 8px ${scoreColor(t.score)}40`,
                      }} />
                      <span style={{ fontSize: '10px', color: '#3f3f5a', fontFamily: "'JetBrains Mono', monospace" }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SESSION HISTORY — clickable cards */}
            <div style={s.card} className="anim-4">
              <div style={s.cardHead}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ ...s.cardDot, background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                  <div>
                    <h2 style={s.cardTitle}>Recent Sessions</h2>
                    <p style={s.cardSub}>Click any session to review the full results</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessions.map((session, i) => (
                  <div
                    key={i}
                    className="session-card"
                    onClick={() => handleViewSession(session)}
                    style={s.sessionCard}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>{session.role}</span>
                        {session.company && (
                          <span style={s.tagAmber}>{session.company}</span>
                        )}
                        <span style={s.tagIndigo}>{session.difficulty}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: '#3f3f5a', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ color: '#3f3f5a', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                          {session.questions.length} questions
                        </span>
                        <span
                          className="view-label"
                          style={{ fontSize: '11px', color: '#6366F1', fontFamily: "'JetBrains Mono', monospace", opacity: 0, transition: 'opacity 0.15s' }}
                        >
                          View Results →
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${scoreColor(session.averageScore)}`,
                      background: scoreBg(session.averageScore),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                      boxShadow: `0 0 12px ${scoreColor(session.averageScore)}20`,
                    }}>
                      <span style={{ color: scoreColor(session.averageScore), fontWeight: '700', fontSize: '14px', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                        {session.averageScore}
                      </span>
                      <span style={{ color: '#3f3f5a', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace" }}>/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ height: '60px' }} />
      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: '#09090E',
    color: '#e2e8f0',
    WebkitFontSmoothing: 'antialiased',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: '56px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(9,9,14,0.92)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: {
    width: '30px', height: '30px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
  },
  brandName: { fontSize: '15px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '-0.02em' },
  betaBadge: {
    fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
    background: 'rgba(99,102,241,0.15)', color: '#818CF8',
    border: '1px solid rgba(99,102,241,0.25)',
  },
  navLinks: { display: 'flex', gap: '2px' },
  navLink: {
    background: 'none', border: 'none', padding: '6px 12px', borderRadius: '7px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s ease',
  },
  userChip: {
    fontSize: '12px', fontWeight: '500', color: '#94a3b8',
    padding: '5px 12px', borderRadius: '7px',
    background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  signOutBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.07)',
    color: '#64748b', fontSize: '12px', fontWeight: '500',
    cursor: 'pointer', padding: '5px 12px', borderRadius: '7px',
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s ease',
  },
  page: { maxWidth: '960px', margin: '0 auto', padding: '48px 40px 80px' },
  pageHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '32px',
  },
  eyebrow: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
    color: '#6366F1', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px',
  },
  pageTitle: {
    fontSize: '28px', fontWeight: '800', color: '#e2e8f0',
    letterSpacing: '-0.03em', marginBottom: '6px', lineHeight: 1.2,
  },
  pageSub: { fontSize: '13px', color: '#4b5563', fontWeight: '400' },
  newSessionBtn: {
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
    letterSpacing: '-0.01em', flexShrink: 0, transition: 'all 0.2s ease',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
    marginBottom: '4px',
  },
  statCard: {
    background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '20px 18px',
    display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s ease',
  },
  statN: {
    fontSize: '26px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1,
    fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px',
  },
  statLabel: { fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '2px' },
  statSub: { fontSize: '11px', color: '#3f3f5a', fontFamily: "'JetBrains Mono', monospace" },
  emptyState: {
    background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '80px 40px', textAlign: 'center', marginTop: '32px',
  },
  emptyIcon: {
    width: '56px', height: '56px', borderRadius: '14px',
    background: '#1a1a28', border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
  },
  emptyTitle: { fontSize: '18px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#4b5563', marginBottom: '24px', lineHeight: '1.6' },
  startBtn: {
    padding: '12px 24px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    color: '#fff', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  card: {
    background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '22px 24px', marginBottom: '12px',
  },
  cardHead: { marginBottom: '20px' },
  cardDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '3px' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '-0.01em', marginBottom: '3px' },
  cardSub: { fontSize: '11px', color: '#3f3f5a', fontFamily: "'JetBrains Mono', monospace" },
  emptyInCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 0' },
  topicRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  barTrack: { height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  topicCount: {
    fontSize: '11px', color: '#3f3f5a', flexShrink: 0,
    width: '42px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace",
  },
  sessionCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.02)',
  },
  tagAmber: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '5px',
    background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
    border: '1px solid rgba(245,158,11,0.2)',
    fontFamily: "'JetBrains Mono', monospace", fontWeight: '500',
  },
  tagIndigo: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '5px',
    background: 'rgba(99,102,241,0.12)', color: '#818CF8',
    border: '1px solid rgba(99,102,241,0.2)',
    fontFamily: "'JetBrains Mono', monospace", fontWeight: '500',
    textTransform: 'capitalize',
  },
}