import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import axios from 'axios'

function scoreColor(score) {
  if (score >= 8) return '#34D399'
  if (score >= 5) return '#FBBF24'
  return '#F87171'
}

function scoreLabel(score) {
  if (score >= 8) return 'Excellent response'
  if (score >= 5) return 'Good effort'
  return 'Needs improvement'
}

function scoreEmoji(score) {
  if (score >= 8) return '🎉'
  if (score >= 5) return '👍'
  return '💪'
}

export default function Practice() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, difficulty, company } = location.state || {}

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [session, setSession] = useState([])
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [timerActive, setTimerActive] = useState(false)
  const [speechCoach, setSpeechCoach] = useState(null)

  // Spoken answer state
  const [spokenAnswer, setSpokenAnswer] = useState(null)
  const [loadingSpoken, setLoadingSpoken] = useState(false)
  const [showSpoken, setShowSpoken] = useState(false)

  // 🆕 Follow-up state
  const [isFollowUp, setIsFollowUp] = useState(false)
  const [followUpTopic, setFollowUpTopic] = useState(null)

  const speakStartTime = useRef(null)

  // ── Adaptive difficulty ──────────────────────────────────────────────────
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty)
  const [difficultyHistory, setDifficultyHistory] = useState([])
  const [difficultyChanged, setDifficultyChanged] = useState(null)

  useEffect(() => {
    if (!role || !difficulty) { navigate('/'); return }
    generateQuestions()
  }, [])

  useEffect(() => {
    if (questions.length > 0 && !feedback) {
      setTimeLeft(120)
      setTimerActive(true)
    }
  }, [currentIndex, questions])

  useEffect(() => {
    let interval
    if (timerActive && timeLeft > 0 && !feedback) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && !feedback && answer) {
      setTimerActive(false)
      handleSubmit()
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft, feedback])

  const generateQuestions = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/generate`, { role, difficulty, company })
      setQuestions(res.data.questions)
    } catch (err) {
      setError('Failed to load questions. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // 🆕 Generate a single follow-up question on the weak topic
  const generateFollowUpQuestion = async (topic, previousQuestion) => {
    setLoading(true)
    try {
      const prompt = `Generate exactly 1 follow-up interview question for a ${role} role.
The candidate just answered this question poorly: "${previousQuestion}"
They need more practice on this topic: "${topic}"
Generate a slightly simpler question that helps them understand "${topic}" better.
Return ONLY a JSON array with exactly 1 string. Example: ["Your follow-up question here"]`

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/generate`, {
        role,
        difficulty: currentDifficulty,
        company,
        customPrompt: prompt
      })

      const followUpQ = res.data.questions[0]

      // inject follow-up question right after current index
      setQuestions(prev => {
        const updated = [...prev]
        updated.splice(currentIndex + 1, 0, followUpQ)
        return updated
      })

      setIsFollowUp(true)
      setFollowUpTopic(topic)

    } catch (err) {
      console.error('Failed to generate follow-up:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpokenAnswer = async (feedbackData) => {
    setLoadingSpoken(true)
    setSpokenAnswer(null)
    setShowSpoken(false)
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/spoken-answer`, {
        question: questions[currentIndex],
        idealAnswer: feedbackData.idealAnswer,
        missedPoints: feedbackData.missedPoints,
        score: feedbackData.score
      })
      setSpokenAnswer(res.data.spokenAnswer)
    } catch (err) {
      console.error('Failed to get spoken answer:', err)
    } finally {
      setLoadingSpoken(false)
    }
  }

  const analyzeSpeech = (finalTranscript, duration, detectedStutters = []) => {
    const fillerWords = [
      'um', 'uh', 'ah', 'er', 'like', 'you know', 'basically',
      'literally', 'right', 'so', 'actually', 'honestly', 'kind of', 'sort of'
    ]
    const words = finalTranscript.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const wordCount = words.length

    const fillerFound = []
    words.forEach(w => {
      if (fillerWords.includes(w)) fillerFound.push(w)
    })
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + ' ' + words[i + 1]
      if (fillerWords.includes(bigram)) fillerFound.push(bigram)
    }
    const fillerCount = fillerFound.length

    const stutters = detectedStutters
    const stutterCount = stutters.length
    const stutterDetails = stutters.map(w => `repeated "${w}"`)

    const safeDuration = duration > 0 ? duration : 1
    const wordsPerMinute = Math.round((wordCount / safeDuration) * 60)

    const expectedWordsMin = Math.round((safeDuration / 60) * 80)
    const hasTooMuchSilence = wordCount < expectedWordsMin && safeDuration > 10

    const issues = []
    const positives = []

    if (fillerCount === 0) {
      positives.push('✅ No filler words — great composure!')
    } else if (fillerCount <= 2) {
      issues.push(`⚠️ ${fillerCount} filler word(s) detected — minor, but try to pause instead`)
    } else {
      issues.push(`⚠️ ${fillerCount} filler words — practice pausing instead of filling`)
    }

    if (stutterCount === 0) {
      positives.push('✅ Smooth delivery, no stutters!')
    } else if (stutterCount <= 2) {
      issues.push(`🔁 ${stutterCount} stutter(s) detected — take a breath, slow down slightly`)
    } else {
      issues.push(`🔁 ${stutterCount} stutter(s) detected — consider pausing to collect thoughts`)
    }

    if (wordsPerMinute >= 80 && wordsPerMinute <= 160) {
      positives.push('✅ Great speaking pace!')
    } else if (wordsPerMinute > 160) {
      issues.push('⚡ Speaking too fast — slow down for clarity')
    } else if (wordsPerMinute < 80 && wordCount >= 5) {
      issues.push('🐢 Speaking too slow — pick up the pace slightly')
    }

    if (wordCount < 5) {
      issues.push('📢 Answer too brief — elaborate with examples and detail')
    } else if (wordCount >= 20) {
      positives.push('✅ Good answer length!')
    } else {
      issues.push('📢 Try to expand your answer — aim for at least 30–50 words')
    }

    if (hasTooMuchSilence) {
      issues.push('🔇 Long pauses detected — structure your thoughts before speaking')
    }

    return {
      wordsPerMinute,
      fillerCount,
      fillerFound: [...new Set(fillerFound)],
      wordCount,
      stutterCount,
      stutterDetails,
      issues,
      positives
    }
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    setListening(true)
    speakStartTime.current = Date.now()

    let finalTranscript = ''
    let interimHistory = []

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
          interimHistory.push(interim)
        }
      }
      setAnswer(finalTranscript.trim() || interim)
    }

    recognition.onspeechend = () => {
      try { recognition.stop() } catch (_) {}
    }

    recognition.onend = () => {
      const duration = (Date.now() - speakStartTime.current) / 1000
      const transcript = finalTranscript.trim()

      const stutterWords = []
      interimHistory.forEach((interim, i) => {
        if (i > 0) {
          const prev = interimHistory[i - 1].toLowerCase().split(/\s+/).filter(Boolean)
          const curr = interim.toLowerCase().split(/\s+/).filter(Boolean)
          prev.forEach(w => {
            if (w.length > 1 && curr.filter(c => c === w).length > 1) {
              stutterWords.push(w)
            }
          })
        }
      })

      const detectedStutters = [...new Set(stutterWords)]
      const coach = analyzeSpeech(transcript, duration, detectedStutters)
      setSpeechCoach(coach)
      setAnswer(transcript)
      setListening(false)
    }

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error)
      setListening(false)
    }

    recognition.start()

    setTimeout(() => {
      try { recognition.stop() } catch (_) {}
    }, 60000)

    window.__activeRecognition = recognition
  }

  const stopListening = () => {
    try { window.__activeRecognition?.stop() } catch (_) {}
  }

  const handleSubmit = async () => {
    if (!answer) return
    setTimerActive(false)
    setScoring(true)
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/score`, {
        question: questions[currentIndex], answer
      })
      const data = res.data
      setFeedback(data)
      setSession(prev => [...prev, {
        question: questions[currentIndex],
        answer,
        score: data.score || 0,
        verdict: data.verdict || '',
        feedback: data.feedback || '',
        idealAnswer: data.idealAnswer || '',
        missedPoints: data.missedPoints || [],
        strongPoints: data.strongPoints || [],
        nextFocus: data.nextFocus || ''
      }])
      fetchSpokenAnswer(data)
    } catch (err) {
      console.error('Failed to score answer:', err)
    }
    setScoring(false)
  }

  // ─── handleNext: adaptive difficulty + follow-up logic ───────────────────
  const handleNext = () => {
    setSpeechCoach(null)
    setSpokenAnswer(null)
    setShowSpoken(false)
    setIsFollowUp(false)
    setFollowUpTopic(null)

    if (feedback) {
      let nextDifficulty = currentDifficulty

      if (feedback.score >= 8) {
        if (currentDifficulty === 'easy') nextDifficulty = 'medium'
        else if (currentDifficulty === 'medium') nextDifficulty = 'hard'
      } else if (feedback.score < 5) {
        if (currentDifficulty === 'hard') nextDifficulty = 'medium'
        else if (currentDifficulty === 'medium') nextDifficulty = 'easy'
      }

      if (feedback.score >= 8 && nextDifficulty !== currentDifficulty) {
        setDifficultyChanged({ direction: 'up', from: currentDifficulty, to: nextDifficulty })
      } else if (feedback.score < 5 && nextDifficulty !== currentDifficulty) {
        setDifficultyChanged({ direction: 'down', from: currentDifficulty, to: nextDifficulty })
      } else {
        setDifficultyChanged(null)
      }

      setCurrentDifficulty(nextDifficulty)
      setDifficultyHistory(prev => [...prev, {
        question: currentIndex + 1,
        score: feedback.score,
        difficulty: nextDifficulty
      }])

      // 🆕 if score < 6 and not already a follow-up, inject follow-up question
      if (feedback.score < 6 && feedback.nextFocus && !isFollowUp) {
        generateFollowUpQuestion(feedback.nextFocus, questions[currentIndex])
        setCurrentIndex(i => i + 1)
        setAnswer('')
        setFeedback(null)
        return
      }
    }

    if (currentIndex + 1 >= questions.length) {
      saveSession()
    } else {
      setCurrentIndex(i => i + 1)
      setAnswer('')
      setFeedback(null)
    }
  }

  const saveSession = async () => {
    try {
      const user = auth.currentUser
      await axios.post(`${process.env.REACT_APP_API_URL}/api/sessions/save`, {
        userId: user.uid, userEmail: user.email,
        role, difficulty, company,
        questions: session,
        difficultyHistory
      })
    } catch (err) {
      console.error('Failed to save session:', err)
    }
    navigate('/results', { state: { session, role, difficulty, company } })
  }

  const pct = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0
  const color = feedback ? scoreColor(feedback.score) : '#8B5CF6'

  if (loading) return (
    <div style={s.loadingWrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={s.loadingOrb} />
      <p style={s.loadingTitle}>Preparing your session</p>
      <p style={s.loadingSubtitle}>Generating {difficulty} questions for {role}</p>
    </div>
  )

  if (error) return (
    <div style={s.errorWrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <p style={s.errorTitle}>Something went wrong</p>
      <p style={s.errorSubtitle}>{error}</p>
      <button style={s.errorBtn} onClick={() => navigate('/')}>Go Back</button>
    </div>
  )

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus { border-color: rgba(139,92,246,0.5) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.08); }
        button:active { transform: scale(0.98); }
        .spoken-reveal { animation: fadeSlideIn 0.35s ease both; }
      `}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={s.roleLabel}>{role}</span>
          {company && <span style={{ ...s.badge, background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>{company}</span>}
          <span style={s.badge}>{currentDifficulty}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
            background: timeLeft <= 30 ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${timeLeft <= 30 ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: timeLeft <= 30 ? '#F87171' : '#4A4A5A'
          }}>
            ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <span style={s.counter}>{currentIndex + 1} / {questions.length}</span>
        </div>
      </header>

      {/* Progress */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #6366F1)', width: `${pct}%`, transition: 'width 0.4s' }} />
      </div>

      <main style={s.main}>

        {/* Step dots */}
        {questions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            {questions.map((_, i) => (
              <React.Fragment key={i}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: i < currentIndex ? '#8B5CF6' : i === currentIndex ? '#A78BFA' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s'
                }} />
                {i < questions.length - 1 && <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 🆕 Follow-up notification banner */}
        {isFollowUp && followUpTopic && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>
            <span style={{ fontSize: '18px' }}>🔁</span>
            <div>
              <p style={{ color: '#FBBF24', fontWeight: '600', fontSize: '13px', margin: '0 0 2px' }}>
                Follow-up Question
              </p>
              <p style={{ color: '#4A4A5A', fontSize: '12px', margin: 0 }}>
                Practice more on: <span style={{ color: '#FBBF24', textTransform: 'capitalize' }}>{followUpTopic}</span>
              </p>
            </div>
          </div>
        )}

        {/* Adaptive difficulty notification */}
        {difficultyChanged && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            background: difficultyChanged.direction === 'up' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
            border: `1px solid ${difficultyChanged.direction === 'up' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
          }}>
            <span style={{ fontSize: '18px' }}>
              {difficultyChanged.direction === 'up' ? '🔥' : '💡'}
            </span>
            <div>
              <p style={{ color: difficultyChanged.direction === 'up' ? '#F87171' : '#34D399', fontWeight: '600', fontSize: '13px', margin: '0 0 2px' }}>
                {difficultyChanged.direction === 'up' ? 'Great answer! Difficulty increased' : 'Difficulty reduced to help you improve'}
              </p>
              <p style={{ color: '#4A4A5A', fontSize: '12px', margin: 0, textTransform: 'capitalize' }}>
                {difficultyChanged.from} → {difficultyChanged.to}
              </p>
            </div>
          </div>
        )}

        {/* Question */}
        <div style={s.questionCard}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #8B5CF6, #6366F1 60%, transparent)' }} />
          <p style={s.questionLabel}>Question {currentIndex + 1}</p>
          <p style={s.questionText}>{questions[currentIndex]}</p>
        </div>

        {/* Answer */}
        {!feedback && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here, or click the mic to speak..."
              style={s.textarea}
            />

            {/* Speech Coach */}
            {speechCoach && (
              <div style={s.speechCard}>
                <p style={{ color: '#8B5CF6', fontWeight: '700', margin: '0 0 10px', fontSize: '13px' }}>
                  🎙️ Speech Coach Analysis
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {[
                    { icon: '📊', label: `${speechCoach.wordsPerMinute} wpm`, neutral: true },
                    { icon: '📝', label: `${speechCoach.wordCount} words`, neutral: true },
                    {
                      icon: '💬',
                      label: `${speechCoach.fillerCount} filler${speechCoach.fillerCount !== 1 ? 's' : ''}`,
                      good: speechCoach.fillerCount === 0
                    },
                    {
                      icon: '🔁',
                      label: `${speechCoach.stutterCount} stutter${speechCoach.stutterCount !== 1 ? 's' : ''}`,
                      good: speechCoach.stutterCount === 0
                    },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 10px', borderRadius: '6px',
                      background: stat.neutral
                        ? 'rgba(255,255,255,0.04)'
                        : stat.good
                          ? 'rgba(52,211,153,0.08)'
                          : 'rgba(248,113,113,0.08)',
                      border: `1px solid ${stat.neutral
                        ? 'rgba(255,255,255,0.07)'
                        : stat.good
                          ? 'rgba(52,211,153,0.2)'
                          : 'rgba(248,113,113,0.2)'}`,
                      fontSize: '12px',
                      color: stat.neutral ? '#6B7280' : stat.good ? '#34D399' : '#F87171',
                      fontWeight: '500'
                    }}>
                      <span>{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>

                {speechCoach.positives.map((p, i) => (
                  <p key={i} style={{ color: '#34D399', fontSize: '13px', margin: '3px 0', lineHeight: 1.5 }}>{p}</p>
                ))}

                {speechCoach.issues.map((issue, i) => (
                  <p key={i} style={{ color: '#B0B0C0', fontSize: '13px', margin: '3px 0', lineHeight: 1.5 }}>{issue}</p>
                ))}

                {speechCoach.fillerFound.length > 0 && (
                  <p style={{ color: '#FBBF24', fontSize: '12px', margin: '8px 0 0', fontStyle: 'italic' }}>
                    Fillers detected: "{speechCoach.fillerFound.join('", "')}"
                  </p>
                )}

                {speechCoach.stutterDetails.length > 0 && (
                  <p style={{ color: '#F87171', fontSize: '12px', margin: '4px 0 0', fontStyle: 'italic' }}>
                    Stutters: {speechCoach.stutterDetails.join(' · ')}
                  </p>
                )}

                <p style={{ color: '#3A3A4A', fontSize: '11px', margin: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  ℹ️ Stutter analysis based on interim speech snapshots before browser cleanup
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={listening ? stopListening : startListening}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '0 20px', height: '48px', borderRadius: '10px',
                  border: listening ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  background: listening ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                  color: listening ? '#F87171' : '#9CA3AF',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap'
                }}>
                {listening
                  ? <>
                      <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
                        <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.4)', animation: 'ripple 1.5s infinite' }} />
                      </div>
                      Stop Recording
                    </>
                  : <>🎤 Speak</>
                }
              </button>
              <button onClick={handleSubmit} disabled={scoring || !answer} style={{
                flex: 1, height: '48px', borderRadius: '10px', border: 'none',
                background: answer && !scoring ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'rgba(255,255,255,0.05)',
                color: answer && !scoring ? '#fff' : '#3A3A4A',
                fontSize: '15px', fontWeight: '600', cursor: answer && !scoring ? 'pointer' : 'not-allowed'
              }}>
                {scoring ? 'Evaluating…' : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={s.feedbackCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                border: `2px solid ${color}`, background: `${color}14`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0
              }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: color, lineHeight: 1 }}>{feedback.score}</span>
                <span style={{ fontSize: '11px', color: color, opacity: 0.6 }}>/10</span>
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#E8E8F0', margin: '0 0 4px' }}>
                  {scoreEmoji(feedback.score)} {scoreLabel(feedback.score)}
                </p>
                {feedback.verdict && <p style={{ fontSize: '13px', color: '#4A4A5A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{feedback.verdict}</p>}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {feedback.feedback && (
              <div>
                <p style={s.feedbackLabel}>Feedback</p>
                <p style={s.feedbackText}>{feedback.feedback}</p>
              </div>
            )}

            {feedback.idealAnswer && (
              <div>
                <p style={{ ...s.feedbackLabel, color: '#34D399' }}>💡 Ideal Answer</p>
                <p style={s.feedbackText}>{feedback.idealAnswer}</p>
              </div>
            )}

            {feedback.missedPoints && feedback.missedPoints.length > 0 && (
              <div>
                <p style={{ ...s.feedbackLabel, color: '#F87171' }}>❌ Missed Points</p>
                {feedback.missedPoints.map((point, i) => (
                  <p key={i} style={{ ...s.feedbackText, marginBottom: '4px' }}>• {point}</p>
                ))}
              </div>
            )}

            {/* Spoken Answer Section */}
            <div style={s.spokenSection}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showSpoken ? '14px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🗣️</span>
                  <p style={{ ...s.feedbackLabel, color: '#A78BFA', margin: 0 }}>How to Say It Out Loud</p>
                </div>

                {loadingSpoken ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(167,139,250,0.2)', borderTop: '2px solid #A78BFA', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '12px', color: '#4A4A5A' }}>Crafting response…</span>
                  </div>
                ) : spokenAnswer ? (
                  <button
                    onClick={() => setShowSpoken(v => !v)}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      border: '1px solid rgba(167,139,250,0.3)',
                      background: showSpoken ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.07)',
                      color: '#A78BFA', cursor: 'pointer'
                    }}
                  >
                    {showSpoken ? 'Hide' : 'Show Answer'}
                  </button>
                ) : null}
              </div>

              {showSpoken && spokenAnswer && (
                <div className="spoken-reveal" style={s.spokenBubble}>
                  <span style={{
                    position: 'absolute', top: '-4px', left: '16px',
                    fontSize: '48px', color: 'rgba(167,139,250,0.15)', lineHeight: 1,
                    fontFamily: 'Georgia, serif', userSelect: 'none'
                  }}>"</span>
                  <p style={s.spokenText}>{spokenAnswer}</p>
                  <p style={s.spokenHint}>
                    💬 Practice saying this out loud — aim for a natural, confident tone.
                  </p>
                </div>
              )}

              {!loadingSpoken && !spokenAnswer && (
                <p style={{ fontSize: '12px', color: '#3A3A4A', margin: '6px 0 0' }}>
                  Couldn't generate a spoken example. Try the next question.
                </p>
              )}
            </div>

            {feedback.nextFocus && (
              <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '14px' }}>
                <p style={{ ...s.feedbackLabel, color: '#8B5CF6', marginBottom: '6px' }}>📚 Study Next</p>
                <p style={{ ...s.feedbackText, margin: 0 }}>{feedback.nextFocus}</p>
              </div>
            )}

            {/* 🆕 Follow-up hint when score is low */}
            {feedback.score < 6 && !isFollowUp && (
              <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ color: '#FBBF24', fontSize: '13px', margin: 0 }}>
                  🔁 A follow-up question on <strong>{feedback.nextFocus}</strong> will be added to help you improve
                </p>
              </div>
            )}

            <button onClick={handleNext} style={s.nextBtn}>
              {currentIndex + 1 >= questions.length ? 'Finish & View Results →' : 'Next Question →'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif", background: '#0A0A0F', color: '#E8E8F0' },
  loadingWrap: { minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' },
  loadingOrb: { width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #8B5CF6', animation: 'spin 1s linear infinite' },
  loadingTitle: { fontSize: '22px', fontWeight: '600', color: '#E8E8F0', margin: 0 },
  loadingSubtitle: { fontSize: '14px', color: '#4A4A5A', margin: 0 },
  errorWrap: { minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  errorTitle: { fontSize: '20px', fontWeight: '600', color: '#F87171', margin: 0 },
  errorSubtitle: { fontSize: '14px', color: '#4A4A5A', margin: 0 },
  errorBtn: { marginTop: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 },
  roleLabel: { fontSize: '15px', fontWeight: '600', color: '#E8E8F0', letterSpacing: '-0.01em' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' },
  counter: { fontSize: '13px', color: '#4A4A5A', background: 'rgba(255,255,255,0.04)', padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' },
  main: { maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' },
  questionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 36px', marginBottom: '24px', position: 'relative', overflow: 'hidden' },
  questionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: '16px' },
  questionText: { fontSize: '19px', lineHeight: '1.65', color: '#E8E8F0', fontWeight: '400', margin: 0, letterSpacing: '-0.01em' },
  textarea: { width: '100%', minHeight: '148px', padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#E8E8F0', fontSize: '15px', lineHeight: '1.65', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' },
  speechCard: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '16px 18px' },
  feedbackCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '20px' },
  feedbackLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4A5A', marginBottom: '8px', margin: 0 },
  feedbackText: { fontSize: '15px', lineHeight: '1.75', color: '#B0B0C0', margin: 0 },
  nextBtn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  spokenSection: {
    background: 'rgba(167,139,250,0.06)',
    border: '1px solid rgba(167,139,250,0.18)',
    borderRadius: '12px',
    padding: '16px 18px',
  },
  spokenBubble: {
    position: 'relative',
    background: 'rgba(167,139,250,0.08)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '10px',
    padding: '20px 20px 14px',
    overflow: 'hidden',
  },
  spokenText: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#D4C8FF',
    margin: '0 0 12px',
    fontStyle: 'italic',
    position: 'relative',
    zIndex: 1,
  },
  spokenHint: {
    fontSize: '12px',
    color: '#4A4A5A',
    margin: 0,
    paddingTop: '10px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  }
}