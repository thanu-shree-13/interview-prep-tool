const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Generate questions
router.post('/generate', async (req, res) => {
  const { role, difficulty } = req.body
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `Generate exactly 5 interview questions for a ${role} role at ${difficulty} difficulty level. Return ONLY a JSON array of 5 strings. No explanation, no extra text. Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(clean)
    res.json({ questions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Score answer
router.post('/score', async (req, res) => {
  const { question, answer } = req.body
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `You are an interview evaluator. Score this answer out of 10 and give brief feedback.
Question: ${question}
Answer: ${answer}
Return ONLY a JSON object like this: {"score": 7, "feedback": "Good answer but missing X"}
No extra text.`
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router