const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = 'llama-3.3-70b-versatile'

async function callAI(prompt, temperature = 0.7) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: 1024,
  })
  return completion.choices?.[0]?.message?.content || ''
}

function extractJSON(text) {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim()

  try { return JSON.parse(cleaned) } catch {}
  try {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}
  try {
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return null
}

// Generate Questions
router.post('/generate', async (req, res) => {
  const { role, difficulty, company } = req.body
  if (!role || !difficulty) {
    return res.status(400).json({ error: 'role and difficulty are required' })
  }
  try {
    const prompt = `Generate exactly 5 interview questions for a ${role} role at ${difficulty} difficulty level${company ? ` at ${company}` : ''}.
Return ONLY a valid JSON array of exactly 5 strings. No markdown, no explanation.
Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`

    const raw = await callAI(prompt, 0.7)
    const data = extractJSON(raw)

    if (!Array.isArray(data) || data.length === 0) {
      console.error('❌ RAW:', raw)
      return res.status(502).json({ error: 'AI returned invalid format' })
    }

    console.log(`✅ Generated ${data.length} questions for ${role} (${difficulty})`)
    res.json({ questions: data })

  } catch (err) {
    console.error('❌ Generate error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Score Answer
router.post('/score', async (req, res) => {
  const { question, answer } = req.body
  if (!question || !answer) {
    return res.status(400).json({ error: 'question and answer are required' })
  }
  try {
    const prompt = `You are a strict senior software engineer conducting a technical interview.

Question: ${question}
Candidate Answer: ${answer}

Scoring guide:
- 9-10: Perfect, deep understanding
- 7-8: Good, minor gaps
- 5-6: Average, significant gaps
- 3-4: Poor, major issues
- 1-2: Very poor, no understanding

Return ONLY this exact JSON, no markdown, no extra text:
{
  "score": 7,
  "verdict": "Good",
  "feedback": "2-3 sentences of specific feedback",
  "idealAnswer": "What a perfect answer would cover",
  "missedPoints": ["concept they missed"],
  "strongPoints": ["what they got right"],
  "nextFocus": "one topic to study"
}`

    const raw = await callAI(prompt, 0.3)
    const data = extractJSON(raw)

    if (!data || typeof data.score !== 'number') {
      console.error('❌ RAW:', raw)
      return res.status(502).json({ error: 'AI returned invalid format' })
    }

    console.log(`✅ Scored: ${data.score}/10 — ${data.verdict}`)
    res.json({
      score: data.score,
      verdict: data.verdict || '',
      feedback: data.feedback || '',
      idealAnswer: data.idealAnswer || '',
      missedPoints: data.missedPoints || [],
      strongPoints: data.strongPoints || [],
      nextFocus: data.nextFocus || ''
    })

  } catch (err) {
    console.error('❌ Score error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Generate spoken answer — natural, human, conversational
router.post('/spoken-answer', async (req, res) => {
  const { question, idealAnswer, missedPoints, score } = req.body
  try {
    const prompt = `You are helping someone practice interview answers out loud. Write what they should actually SAY — not type.

Interview question: "${question}"
Key points a great answer covers: ${idealAnswer}
Points the candidate missed: ${missedPoints?.join(', ') || 'none'}
Their score: ${score}/10

Write a spoken answer that sounds like a real person talking in an interview — confident, clear, and natural.

Rules (follow every single one):
- Write exactly as someone would SPEAK it, not how they'd write an essay
- Start with a grounded opener like "So, the way I think about it..." or "Honestly, the first thing I'd do is..." or "From my experience..."
- Use short sentences and natural rhythm — the kind you'd say out loud without stumbling
- NO bullet-point thinking hidden as prose (don't say "firstly", "secondly", "moreover", "furthermore", "in conclusion")
- NO filler phrases like "That's a great question", "Absolutely", "Certainly", "Of course"
- NO robotic transitions like "It is important to note that..."
- Use contractions: "I'd", "I've", "they're", "it's", "wouldn't"
- Weave in ONE short real-sounding example — something you'd actually say like "I had this happen once where..." or "I remember when my team..."
- Aim for 80–100 words. Stop when the point is made. Don't pad.
- End on something concrete — a result, a takeaway, or what you'd do next

Return ONLY the spoken answer. No quotes, no labels, no explanation, no preamble.`

    const raw = await callAI(prompt, 0.85)
    res.json({ spokenAnswer: raw.trim() })
  } catch (err) {
    console.error('❌ Spoken answer error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router