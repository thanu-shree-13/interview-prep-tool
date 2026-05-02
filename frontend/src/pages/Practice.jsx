import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import axios from 'axios'

function Practice() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, difficulty } = location.state || {}

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [session, setSession] = useState([])
  const [listening, setListening] = useState(false)

  useEffect(() => { generateQuestions() }, [])

  const generateQuestions = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/questions/generate', { role, difficulty })
      setQuestions(res.data.questions)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.start()
    setListening(true)
    recognition.onresult = (event) => { setAnswer(event.results[0][0].transcript); setListening(false) }
    recognition.onerror = () => setListening(false)
  }

  const handleSubmit = async () => {
    if (!answer) return
    setScoring(true)
    try {
      const res = await axios.post('http://localhost:5000/api/questions/score', {
        question: questions[currentIndex], answer
      })
      setFeedback(res.data)
      setSession([...session, { question: questions[currentIndex], answer, score: res.data.score, feedback: res.data.feedback }])
    } catch (err) { console.error(err) }
    setScoring(false)
  }

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) { saveSession() }
    else { setCurrentIndex(currentIndex + 1); setAnswer(''); setFeedback(null) }
  }

  const saveSession = async () => {
    try {
      const user = auth.currentUser
      await axios.post('http://localhost:5000/api/sessions/save', {
        userId: user.uid, userEmail: user.email, role, difficulty, questions: session
      })
    } catch (err) { console.error(err) }
    navigate('/dashboard')
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#4ade80'
    if (score >= 5) return '#fbbf24'
    return '#f87171'
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>🤖</div>
      <p style={{ color: 'white', fontSize: '20px' }}>Generating your questions...</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>AI is preparing {difficulty} level questions for {role}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>🎯 {role}</span>
          <span style={{
            marginLeft: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
            background: 'rgba(102,126,234,0.3)', color: '#667eea', textTransform: 'capitalize'
          }}>{difficulty}</span>
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.6)', fontSize: '14px',
          background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px'
        }}>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{
          height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s'
        }} />
      </div>

      <div style={{ padding: '40px', maxWidth: '750px', margin: '0 auto' }}>

        {/* Question */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '30px', marginBottom: '24px'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Question {currentIndex + 1}
          </p>
          <p style={{ color: 'white', fontSize: '20px', lineHeight: '1.6', margin: 0 }}>
            {questions[currentIndex]}
          </p>
        </div>

        {/* Answer */}
        {!feedback && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here or use the mic button to speak..."
              style={{
                width: '100%', height: '150px', padding: '16px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: 'white', fontSize: '15px', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', marginBottom: '16px', lineHeight: '1.6'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={startListening} style={{
                padding: '14px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: listening ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)',
                color: listening ? '#ff6b6b' : 'white', fontSize: '15px', fontWeight: '600'
              }}>
                {listening ? '🔴 Listening...' : '🎤 Speak Answer'}
              </button>
              <button onClick={handleSubmit} disabled={scoring || !answer} style={{
                flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
                background: answer ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: '15px', fontWeight: '700', cursor: answer ? 'pointer' : 'not-allowed'
              }}>
                {scoring ? '⏳ Scoring your answer...' : '✅ Submit Answer'}
              </button>
            </div>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: `rgba(${feedback.score >= 8 ? '74,222,128' : feedback.score >= 5 ? '251,191,36' : '248,113,113'},0.2)`,
                border: `2px solid ${getScoreColor(feedback.score)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '800', color: getScoreColor(feedback.score)
              }}>
                {feedback.score}/10
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '18px', margin: '0 0 4px' }}>
                  {feedback.score >= 8 ? '🎉 Excellent!' : feedback.score >= 5 ? '👍 Good effort!' : '💪 Keep practicing!'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>AI Feedback</p>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '24px' }}>
              {feedback.feedback}
            </p>

            <button onClick={handleNext} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
            }}>
              {currentIndex + 1 >= questions.length ? '🏁 Finish & See Results' : '➡️ Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Practice