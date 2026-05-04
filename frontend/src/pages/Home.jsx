import { useState } from 'react'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

const COMPANIES = [
  { name: 'Google',     logo: 'G', color: '#4285F4' },
  { name: 'Amazon',     logo: 'A', color: '#FF9900' },
  { name: 'Microsoft',  logo: 'M', color: '#00A4EF' },
  { name: 'TCS',        logo: 'T', color: '#0052CC' },
  { name: 'Infosys',    logo: 'I', color: '#007CC3' },
  { name: 'Wipro',      logo: 'W', color: '#9B59B6' },
  { name: 'Zoho',       logo: 'Z', color: '#E42527' },
  { name: 'Flipkart',   logo: 'F', color: '#2874F0' },
  { name: 'Swiggy',     logo: 'S', color: '#FC8019' },
  { name: 'Zomato',     logo: 'Z', color: '#CB202D' },
  { name: 'Adobe',      logo: 'A', color: '#FF0000' },
  { name: 'Spotify',    logo: 'S', color: '#1DB954' },
]

const ROLES = [
  { title: 'Frontend Developer',   icon: '⟨/⟩', desc: 'HTML, CSS, JS, React',        type: 'Technical'  },
  { title: 'Backend Developer',    icon: '⚙',   desc: 'APIs, DBs, System Design',     type: 'Technical'  },
  { title: 'Full Stack Developer', icon: '◈',   desc: 'End-to-end development',       type: 'Technical'  },
  { title: 'Data Scientist',       icon: '∑',   desc: 'ML, Stats, Python',            type: 'Technical'  },
  { title: 'DevOps Engineer',      icon: '⬡',   desc: 'CI/CD, Cloud, Infrastructure', type: 'Technical'  },
  { title: 'Product Manager',      icon: '◻',   desc: 'Strategy, Roadmaps',           type: 'Behavioral' },
  { title: 'UI/UX Designer',       icon: '◑',   desc: 'Design thinking, Figma',       type: 'Behavioral' },
  { title: 'HR Round',             icon: '◎',   desc: 'Soft skills, Culture fit',     type: 'Behavioral' },
]

const DIFFICULTIES = [
  { val: 'easy',   label: 'Fundamentals', tag: 'Easy',   desc: 'Core concepts & basics',  color: '#22C55E', glow: 'rgba(34,197,94,0.15)'   },
  { val: 'medium', label: 'Professional', tag: 'Medium', desc: 'Real interview depth',     color: '#F59E0B', glow: 'rgba(245,158,11,0.15)'  },
  { val: 'hard',   label: 'Senior Level', tag: 'Hard',   desc: 'Advanced challenges',      color: '#EF4444', glow: 'rgba(239,68,68,0.15)'   },
]

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedRole, setSelectedRole]       = useState(null)
  const [difficulty, setDifficulty]           = useState('medium')
  const [customRole, setCustomRole]           = useState('')
  const navigate = useNavigate()

  const handleStart = () => {
    const role = selectedRole?.title || customRole
    if (!role) return
    navigate('/practice', { state: { role, difficulty, company: selectedCompany?.name || '' } })
  }

  const activeRole = selectedRole?.title || customRole
  const canStart   = !!activeRole

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
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .anim-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .anim-2 { animation: fadeUp 0.4s 0.12s ease both; }
        .anim-3 { animation: fadeUp 0.4s 0.18s ease both; }
        .anim-4 { animation: fadeUp 0.4s 0.24s ease both; }
        .anim-5 { animation: fadeUp 0.4s 0.30s ease both; }

        .company-btn {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .company-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.18) !important;
          background: #1e1e2e !important;
        }
        .company-btn.active {
          transform: translateY(-1px);
        }

        .role-btn {
          transition: all 0.15s ease;
          cursor: pointer;
          text-align: left;
        }
        .role-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.18) !important;
        }
        .role-btn.active {
          transform: translateY(-1px);
        }

        .diff-btn {
          transition: all 0.15s ease;
          cursor: pointer;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .diff-btn:hover {
          transform: translateY(-1px);
        }

        .start-btn {
          transition: all 0.2s ease;
        }
        .start-btn:not(:disabled):hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45) !important;
        }
        .start-btn:not(:disabled):active {
          transform: translateY(0);
        }

        .nav-action {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .nav-action:hover {
          background: #1e1e2e !important;
          color: #e2e8f0 !important;
        }

        .custom-input:focus {
          outline: none;
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 36px 0;
        }
      `}</style>

      {/* ── NAV ── */}
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
              onClick={() => {
                if (item === 'Dashboard') navigate('/dashboard')
              }}
              style={{
                ...s.navLink,
                color: item === 'Practice' ? '#e2e8f0' : '#64748b',
                background: item === 'Practice' ? '#111118' : 'none',
              }}>
              {item}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={s.userChip}>
            {auth.currentUser?.email?.split('@')[0]}
          </span>
          <button onClick={() => auth.signOut().then(() => navigate('/'))} className="nav-action" style={s.signOutBtn}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div style={s.layout}>

        {/* ── SIDEBAR ── */}
        <aside style={s.sidebar}>
          <div style={s.sideContent}>

            <div className="anim-2">
              <p style={s.sideEyebrow}>AI INTERVIEW PREP</p>
              <h1 style={s.sideTitle}>Ready to ace<br />your interview?</h1>
              <p style={s.sideSubtitle}>
                Get AI-powered questions tailored to your role and company. Practice with real interview depth and instant feedback.
              </p>
            </div>

            <div className="anim-3" style={s.featureList}>
              {[
                { icon: '→', text: '5 adaptive questions per session',  color: '#818CF8' },
                { icon: '→', text: 'Voice & text answer support',       color: '#34D399' },
                { icon: '→', text: 'Instant AI scoring & feedback',     color: '#FBBF24' },
                { icon: '→', text: 'Company-specific question style',   color: '#F472B6' },
                { icon: '→', text: 'Speech coaching & delivery tips',   color: '#60A5FA' },
              ].map(f => (
                <div key={f.text} style={s.featureRow}>
                  <span style={{ color: f.color, fontSize: '13px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" }}>{f.icon}</span>
                  <span style={s.featureText}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Session preview */}
            {canStart && (
              <div className="anim-1" style={s.previewCard}>
                <div style={s.previewHeader}>
                  <span style={s.previewLabel}>SESSION PREVIEW</span>
                  <span style={s.previewDot} />
                </div>
                <div style={s.previewRows}>
                  {[
                    { k: 'Role',       v: activeRole },
                    ...(selectedCompany ? [{ k: 'Company', v: selectedCompany.name }] : []),
                    { k: 'Difficulty', v: DIFFICULTIES.find(d => d.val === difficulty)?.label },
                    { k: 'Questions',  v: '5 questions' },
                  ].map(row => (
                    <div key={row.k} style={s.previewRow}>
                      <span style={s.previewKey}>{row.k}</span>
                      <span style={s.previewVal}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <button
                className="start-btn"
                onClick={handleStart}
                disabled={!canStart}
                style={{ ...s.startBtn, ...(canStart ? s.startActive : s.startDisabled) }}
              >
                {canStart ? 'Start Session →' : 'Select a role to begin'}
              </button>
              {!canStart && (
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#3f3f5a', marginTop: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                  Complete step 2 to unlock
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={s.main}>

          {/* STEP 1 — Company */}
          <section className="anim-3">
            <div style={s.stepHead}>
              <span style={s.stepNum}>01</span>
              <div>
                <h2 style={s.stepTitle}>Target Company</h2>
                <p style={s.stepSub}>Optional — tailors question style to company culture</p>
              </div>
            </div>

            <div style={s.companyGrid}>
              {COMPANIES.map(c => {
                const sel = selectedCompany?.name === c.name
                return (
                  <button
                    key={c.name}
                    className={`company-btn${sel ? ' active' : ''}`}
                    onClick={() => setSelectedCompany(sel ? null : c)}
                    style={{
                      ...s.companyBtn,
                      borderColor: sel ? c.color + '60' : 'rgba(255,255,255,0.07)',
                      background: sel ? c.color + '12' : '#111118',
                      boxShadow: sel ? `0 4px 20px ${c.color}20` : 'none',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: c.color + '18', border: `1px solid ${c.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', color: c.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{c.logo}</div>
                    <span style={{
                      fontSize: '13px', fontWeight: '600',
                      color: sel ? '#e2e8f0' : '#cbd5e1',
                      transition: 'color 0.15s',
                    }}>{c.name}</span>
                    {sel && (
                      <div style={{
                        marginLeft: 'auto', width: '16px', height: '16px', borderRadius: '50%',
                        background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '8px', color: '#fff', fontWeight: '700', flexShrink: 0,
                      }}>✓</div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="section-divider" />

          {/* STEP 2 — Role */}
          <section className="anim-4">
            <div style={s.stepHead}>
              <span style={s.stepNum}>02</span>
              <div>
                <h2 style={s.stepTitle}>Interview Role</h2>
                <p style={s.stepSub}>Required — select a preset or type a custom role</p>
              </div>
            </div>

            <div style={s.roleGrid}>
              {ROLES.map(r => {
                const sel = selectedRole?.title === r.title
                return (
                  <button
                    key={r.title}
                    className={`role-btn${sel ? ' active' : ''}`}
                    onClick={() => { setSelectedRole(sel ? null : r); setCustomRole('') }}
                    style={{
                      ...s.roleBtn,
                      borderColor: sel ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)',
                      background: sel ? 'rgba(99,102,241,0.1)' : '#111118',
                      boxShadow: sel ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '15px',
                        color: sel ? '#818CF8' : '#6b7280',
                        transition: 'color 0.15s',
                      }}>{r.icon}</span>
                      <span style={{
                        fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
                        background: r.type === 'Technical' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                        color: r.type === 'Technical' ? '#818CF8' : '#FBBF24',
                        border: `1px solid ${r.type === 'Technical' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      }}>{r.type}</span>
                    </div>
                    <p style={{
                      fontSize: '13px', fontWeight: '600',
                      color: sel ? '#e2e8f0' : '#cbd5e1',
                      marginBottom: '5px', lineHeight: '1.3', transition: 'color 0.15s',
                    }}>{r.title}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>{r.desc}</p>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, whiteSpace: 'nowrap' }}>or custom</span>
              <input
                className="custom-input"
                type="text"
                placeholder="Type a custom role — e.g. iOS Developer, ML Engineer…"
                value={customRole}
                onChange={e => { setCustomRole(e.target.value); setSelectedRole(null) }}
                style={s.customInput}
              />
            </div>
          </section>

          <div className="section-divider" />

          {/* STEP 3 — Difficulty */}
          <section className="anim-5">
            <div style={s.stepHead}>
              <span style={s.stepNum}>03</span>
              <div>
                <h2 style={s.stepTitle}>Difficulty Level</h2>
                <p style={s.stepSub}>Auto-adjusts based on your performance during the session</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {DIFFICULTIES.map(d => {
                const sel = difficulty === d.val
                return (
                  <button
                    key={d.val}
                    className="diff-btn"
                    onClick={() => setDifficulty(d.val)}
                    style={{
                      ...s.diffBtn,
                      borderColor: sel ? d.color + '50' : 'rgba(255,255,255,0.07)',
                      background: sel ? d.color + '0E' : '#111118',
                      boxShadow: sel ? `0 4px 24px ${d.glow}` : 'none',
                    }}
                  >
                    {sel && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: d.color, borderRadius: '14px 14px 0 0' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: sel ? d.color : '#cbd5e1', transition: 'color 0.15s' }}>
                        {d.label}
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
                        background: sel ? d.color + '20' : '#1e1e2e',
                        color: sel ? d.color : '#6b7280',
                        border: `1px solid ${sel ? d.color + '30' : 'rgba(255,255,255,0.06)'}`,
                      }}>{d.tag}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: sel ? '#cbd5e1' : '#6b7280', lineHeight: '1.5', transition: 'color 0.15s' }}>
                      {d.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          <div style={{ height: '60px' }} />
        </main>
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

  // NAV
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
  brandName: {
    fontSize: '15px', fontWeight: '700', color: '#e2e8f0',
    letterSpacing: '-0.02em',
  },
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.15s ease',
  },
  userChip: {
    fontSize: '12px', fontWeight: '500', color: '#94a3b8',
    padding: '5px 12px', borderRadius: '7px',
    background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  signOutBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.07)',
    color: '#94a3b8', fontSize: '12px', fontWeight: '500',
    cursor: 'pointer', padding: '5px 12px', borderRadius: '7px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  // LAYOUT
  layout: {
    display: 'grid', gridTemplateColumns: '290px 1fr',
    minHeight: 'calc(100vh - 56px)',
  },

  // SIDEBAR
  sidebar: {
    borderRight: '1px solid rgba(255,255,255,0.06)',
    background: '#0D0D14',
    position: 'sticky', top: '56px',
    height: 'calc(100vh - 56px)', overflowY: 'auto',
  },
  sideContent: {
    padding: '32px 24px',
    display: 'flex', flexDirection: 'column', height: '100%', gap: '0',
  },
  sideEyebrow: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
    color: '#6366F1', fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '12px',
  },
  sideTitle: {
    fontSize: '24px', fontWeight: '800', lineHeight: '1.25',
    letterSpacing: '-0.03em', color: '#e2e8f0', marginBottom: '12px',
  },
  sideSubtitle: {
    fontSize: '13px', lineHeight: '1.7', color: '#94a3b8', marginBottom: '28px',
  },
  featureList: {
    display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '28px',
  },
  featureRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  featureText: { fontSize: '12px', color: '#cbd5e1', fontWeight: '500' },

  previewCard: {
    padding: '16px 18px', borderRadius: '12px',
    background: '#111118', border: '1px solid rgba(99,102,241,0.2)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
    marginBottom: '20px',
  },
  previewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '14px',
  },
  previewLabel: {
    fontSize: '9px', fontWeight: '700', letterSpacing: '0.12em',
    color: '#6366F1', fontFamily: "'JetBrains Mono', monospace",
  },
  previewDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#22C55E', animation: 'glow-pulse 2s ease-in-out infinite',
  },
  previewRows: { display: 'flex', flexDirection: 'column', gap: '8px' },
  previewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewKey: { fontSize: '12px', color: '#6b7280', fontWeight: '400' },
  previewVal: { fontSize: '12px', color: '#e2e8f0', fontWeight: '600' },

  startBtn: {
    width: '100%', padding: '13px',
    borderRadius: '10px', border: 'none',
    fontSize: '14px', fontWeight: '700',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.01em', cursor: 'not-allowed',
  },
  startActive: {
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    color: '#fff', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
  },
  startDisabled: {
    background: '#111118', color: '#3f3f5a',
    border: '1px solid rgba(255,255,255,0.06)',
  },

  // MAIN
  main: {
    padding: '40px 48px', background: '#09090E', overflowY: 'auto',
  },

  stepHead: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600',
    color: '#6b7280', padding: '4px 8px', borderRadius: '6px',
    background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0, marginTop: '2px',
  },
  stepTitle: {
    fontSize: '15px', fontWeight: '700', color: '#e2e8f0',
    marginBottom: '3px', letterSpacing: '-0.01em',
  },
  stepSub: { fontSize: '12px', color: '#6b7280', fontWeight: '400' },

  // COMPANY
  companyGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
  companyBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: '#111118', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  // ROLES
  roleGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
    marginBottom: '12px',
  },
  roleBtn: {
    padding: '16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: '#111118', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  customInput: {
    flex: 1, padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.07)', background: '#111118',
    color: '#e2e8f0', fontSize: '13px', fontWeight: '400',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.15s',
  },

  // DIFFICULTY
  diffBtn: {
    padding: '18px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: '#111118', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
}