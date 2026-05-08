import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, role, difficulty, company } = location.state || {}
  const [spokenAnswers, setSpokenAnswers] = useState({})
  const [loadingSpoken, setLoadingSpoken] = useState({})

  useEffect(() => {
    if (!session || session.length === 0) navigate('/home')
  }, [])

  if (!session || session.length === 0) return null

  const avgScore = (session.reduce((sum, q) => sum + q.score, 0) / session.length).toFixed(1)
  const strongCount = session.filter(q => q.score >= 8).length
  const avgCount = session.filter(q => q.score >= 5 && q.score < 8).length
  const missedCount = session.filter(q => q.score < 5).length

  const scoreColor = score => {
    if (score >= 8) return '#22C55E'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }

  const scoreBg = score => {
    if (score >= 8) return 'rgba(34,197,94,0.12)'
    if (score >= 5) return 'rgba(245,158,11,0.12)'
    return 'rgba(239,68,68,0.12)'
  }

  const verdict = avg => {
    if (avg >= 8) return { label: 'Interview Ready', sub: 'Outstanding performance across the board.', grade: 'A' }
    if (avg >= 6) return { label: 'Almost There', sub: 'Solid effort — a few areas to sharpen.', grade: 'B' }
    return { label: 'Keep Practicing', sub: 'Focus on the missed points to level up.', grade: 'C' }
  }

  const generateSpokenAnswer = async (idx, item) => {
    setLoadingSpoken(prev => ({ ...prev, [idx]: true }))
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/spoken-answer`, {
        question: item.question,
        idealAnswer: item.idealAnswer,
        missedPoints: item.missedPoints,
        score: item.score,
      })
      setSpokenAnswers(prev => ({ ...prev, [idx]: res.data.spokenAnswer }))
    } catch {
      setSpokenAnswers(prev => ({ ...prev, [idx]: 'Could not generate spoken answer. Please try again.' }))
    }
    setLoadingSpoken(prev => ({ ...prev, [idx]: false }))
  }

  const v = verdict(avgScore)
  const mainColor = scoreColor(avgScore)

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090E; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .anim-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .anim-2 { animation: fadeUp 0.4s 0.12s ease both; }
        .anim-3 { animation: fadeUp 0.4s 0.18s ease both; }
        .anim-4 { animation: fadeUp 0.4s 0.24s ease both; }
        .nav-action { transition: all 0.15s ease; cursor: pointer; }
        .nav-action:hover { background: #1e1e2e !important; color: #e2e8f0 !important; }
        .q-card:hover { border-color: rgba(255,255,255,0.15) !important; }
        .action-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .action-secondary:hover { background: #1e1e2e !important; color: #e2e8f0 !important; }
        .spoken-btn:hover { background: rgba(99,102,241,0.18) !important; }
        .section-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 32px 0; }
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
              onClick={() => item === 'Practice' ? navigate('/home') : navigate('/dashboard')}
              style={{ ...s.navLink, color: '#94a3b8', background: 'none' }}>
              {item}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="nav-action" onClick={() => navigate('/home')} style={s.signOutBtn}>+ New Session</button>
        </div>
      </nav>

      <div style={s.page}>

        {/* HEADER */}
        <div style={s.pageHead} className="anim-2">
          <div>
            <p style={s.eyebrow}>SESSION RESULTS</p>
            <h1 style={s.pageTitle}>Your Performance</h1>
            <p style={s.pageSub}>Detailed breakdown and actionable feedback from this session</p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Back to Dashboard</button>
        </div>

        {/* HERO SCORE CARD */}
        <div style={s.heroCard} className="anim-2">
          <div style={{ ...s.heroGlow, background: `radial-gradient(ellipse at 20% 50%, ${mainColor}12 0%, transparent 60%)` }} />
          <div style={s.heroInner}>
            <div style={s.ringWrap}>
              <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle cx="55" cy="55" r="46" fill="none" stroke={mainColor} strokeWidth="5"
                  strokeLinecap="round" strokeDasharray="289"
                  strokeDashoffset={289 - (avgScore / 10) * 289}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
              </svg>
              <div style={s.ringCenter}>
                <span style={{ ...s.ringScore, color: mainColor }}>{avgScore}</span>
                <span style={s.ringDenom}>/10</span>
              </div>
            </div>

            <div style={s.verdictBlock}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  border: `1px solid ${mainColor}50`, background: `${mainColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: '700', color: mainColor,
                }}>
                  {v.grade}
                </div>
                <h2 style={s.verdictTitle}>{v.label}</h2>
              </div>
              <p style={s.verdictSub}>{v.sub}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  role + (company ? ` · ${company}` : ''),
                  difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                  `${session.length} Questions`,
                ].map(m => (
                  <span key={m} style={s.tagMuted}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={s.stripRow}>
            {[
              { n: avgScore,    label: 'Average Score',   color: mainColor  },
              { n: strongCount, label: 'Strong Answers',  color: '#22C55E'  },
              { n: avgCount,    label: 'Average Answers', color: '#F59E0B'  },
              { n: missedCount, label: 'Needs Work',      color: '#EF4444'  },
            ].map((st, i) => (
              <div key={st.label} style={{ ...s.strip, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color, boxShadow: `0 0 8px ${st.color}`, marginBottom: '10px' }} />
                <span style={{ ...s.stripN, color: st.color }}>{st.n}</span>
                <span style={s.stripL}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider" />

        {/* REVIEW HEADER */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }} className="anim-3">
          <div>
            <p style={s.eyebrow}>DETAILED REVIEW</p>
            <h2 style={{ ...s.pageTitle, fontSize: '22px' }}>Question Breakdown</h2>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>{session.length} questions</span>
        </div>

        {/* QUESTION CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="anim-4">
          {session.map((item, idx) => {
            const qc = scoreColor(item.score)
            const pct = (item.score / 10) * 100

            return (
              <div key={idx} className="q-card" style={s.qCard}>
                <div style={{ height: '2px', background: qc, borderRadius: '2px 2px 0 0', opacity: 0.8 }} />

                <div style={s.qCardInner}>
                  <div style={s.qHeader}>
                    <span style={s.qNum}>Q{idx + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={s.qBarTrack}>
                        <div style={{ ...s.qBarFill, width: `${pct}%`, background: qc }} />
                      </div>
                      <div style={{
                        minWidth: '52px', height: '28px', borderRadius: '6px',
                        border: `1px solid ${qc}50`, background: scoreBg(item.score),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: qc, fontWeight: '700', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.score}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={s.qText}>{item.question}</p>

                  <div style={s.panels}>

                    <div style={{ ...s.panel, background: `${qc}08`, border: `1px solid ${qc}25` }}>
                      <span style={{ ...s.panelLabel, color: qc }}>
                        Your Answer&nbsp;&nbsp;{item.score >= 8 ? '✅' : item.score >= 5 ? '⚠️' : '❌'}
                      </span>
                      <p style={{ ...s.panelText, color: '#cbd5e1' }}>{item.answer}</p>
                    </div>

                    <div style={{ ...s.panel, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
                      <span style={{ ...s.panelLabel, color: '#a5b4fc' }}>AI Feedback</span>
                      <p style={{ ...s.panelText, color: '#cbd5e1' }}>{item.feedback}</p>
                    </div>

                    {item.idealAnswer && (
                      <div style={{ ...s.panel, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }}>
                        <span style={{ ...s.panelLabel, color: '#4ade80' }}>💡 What a Strong Answer Covers</span>
                        <p style={{ ...s.panelText, color: '#cbd5e1' }}>{item.idealAnswer}</p>
                      </div>
                    )}

                    {item.idealAnswer && (
                      <div style={s.sayBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px' }}>🗣️</span>
                          <span style={s.sayTitle}>How you should say this</span>
                        </div>

                        {!spokenAnswers[idx] && !loadingSpoken[idx] && (
                          <button className="spoken-btn" onClick={() => generateSpokenAnswer(idx, item)} style={s.spokenBtn}>
                            Generate model answer for this question →
                          </button>
                        )}

                        {loadingSpoken[idx] && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                            <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.25)', borderTop: '2px solid #6366F1', animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>AI is writing your model answer…</span>
                          </div>
                        )}

                        {spokenAnswers[idx] && (
                          <>
                            <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 10px', fontFamily: "'JetBrains Mono', monospace" }}>
                              Model answer for: <em style={{ color: '#a5b4fc' }}>"{item.question}"</em>
                            </p>
                            <div style={s.sayQuote}>
                              <p style={s.sayQuoteText}>"{spokenAnswers[idx]}"</p>
                            </div>

                            {item.score < 8 && item.missedPoints?.length > 0 && (
                              <div style={s.diffBox}>
                                <p style={{ fontSize: '10px', fontWeight: '700', color: '#f87171', margin: '0 0 8px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                                  {item.score >= 5 ? '⚠️ What your answer was missing' : '❌ Key gaps in your answer'}
                                </p>
                                {item.missedPoints.map((pt, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                    <span style={{ color: item.score >= 5 ? '#fbbf24' : '#f87171', fontSize: '11px' }}>▸</span>
                                    <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{pt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                              {[
                                { icon: '💬', text: 'Speak in first person — use "I" and "my" to make it personal' },
                                { icon: '⏱️', text: 'Aim for 60–90 seconds — concise and complete' },
                                { icon: '🧱', text: 'Use STAR: Situation → Task → Action → Result' },
                                { icon: '🚫', text: 'Avoid filler words like "um", "uh", "basically"' },
                              ].map((tip, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '12px', flexShrink: 0 }}>{tip.icon}</span>
                                  <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{tip.text}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {((item.missedPoints?.length > 0) || (item.strongPoints?.length > 0)) && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {item.strongPoints?.length > 0 && (
                          <div style={{ flex: 1, padding: '14px 16px', borderRadius: '10px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }}>
                            <span style={{ ...s.panelLabel, color: '#4ade80' }}>Strong Points</span>
                            {item.strongPoints.map((p, i) => (
                              <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                <span style={{ color: '#4ade80', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>✓</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.missedPoints?.length > 0 && (
                          <div style={{ flex: 1, padding: '14px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                            <span style={{ ...s.panelLabel, color: '#f87171' }}>Missed Points</span>
                            {item.missedPoints.map((p, i) => (
                              <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                <span style={{ color: '#f87171', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>✕</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {item.nextFocus && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '10px', background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '15px', flexShrink: 0 }}>📚</span>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>Study Next</span>
                          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', margin: 0 }}>{item.nextFocus}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ACTIONS */}
        <div style={s.actions} className="anim-4">
          <button className="action-secondary" onClick={() => navigate('/home')} style={s.actionSecondary}>+ New Session</button>
          <button className="action-primary" onClick={() => navigate('/dashboard')} style={s.actionPrimary}>View Dashboard →</button>
        </div>

        <div style={{ height: '60px' }} />
      </div>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#09090E', color: '#e2e8f0', WebkitFontSmoothing: 'antialiased' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9,9,14,0.92)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(99,102,241,0.35)' },
  brandName: { fontSize: '15px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '-0.02em' },
  betaBadge: { fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
  navLinks: { display: 'flex', gap: '2px' },
  navLink: { background: 'none', border: 'none', padding: '6px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s ease' },
  signOutBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12px', fontWeight: '500', cursor: 'pointer', padding: '5px 12px', borderRadius: '7px', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s ease' },
  page: { maxWidth: '860px', margin: '0 auto', padding: '48px 40px 80px' },
  pageHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  eyebrow: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', color: '#818CF8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: '6px', lineHeight: 1.2 },
  pageSub: { fontSize: '13px', color: '#94a3b8', fontWeight: '400' },
  backBtn: { padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#111118', color: '#94a3b8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0, transition: 'all 0.2s ease' },
  heroCard: { background: '#111118', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', overflow: 'hidden', marginBottom: '4px', position: 'relative' },
  heroGlow: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  heroInner: { display: 'flex', alignItems: 'center', gap: '36px', padding: '32px 36px', position: 'relative', zIndex: 1 },
  ringWrap: { position: 'relative', flexShrink: 0, width: '110px', height: '110px' },
  ringCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  ringScore: { fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.04em' },
  ringDenom: { fontSize: '10px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' },
  verdictBlock: { flex: 1 },
  verdictTitle: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1.2 },
  verdictSub: { fontSize: '13px', color: '#94a3b8', margin: '6px 0 16px', lineHeight: 1.6 },
  tagMuted: { fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontWeight: '500' },
  stripRow: { display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)' },
  strip: { flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '4px' },
  stripN: { fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.04em' },
  stripL: { fontSize: '12px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" },
  qCard: { background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.15s ease' },
  qCardInner: { padding: '18px 24px 24px' },
  qHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  qNum: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" },
  qBarTrack: { width: '80px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' },
  qBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  qText: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', lineHeight: '1.6', marginBottom: '16px', letterSpacing: '-0.01em' },
  panels: { display: 'flex', flexDirection: 'column', gap: '10px' },
  panel: { padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' },
  panelLabel: { display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px' },
  panelText: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.75', margin: 0 },
  sayBox: { padding: '18px 20px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)' },
  sayTitle: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5b4fc', fontFamily: "'JetBrains Mono', monospace" },
  spokenBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s' },
  sayQuote: { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' },
  sayQuoteText: { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.85', margin: 0, fontStyle: 'italic' },
  diffBox: { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' },
  actions: { display: 'flex', gap: '12px', marginTop: '40px' },
  actionSecondary: { flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#111118', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s' },
  actionPrimary: { flex: 1, padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' },
}