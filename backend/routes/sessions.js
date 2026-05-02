const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  role: String,
  difficulty: String,
  questions: Array,
  averageScore: Number,
  createdAt: { type: Date, default: Date.now }
})

const Session = mongoose.model('Session', sessionSchema)

// Save session
router.post('/save', async (req, res) => {
  try {
    const { userId, userEmail, role, difficulty, questions } = req.body
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0)
    const averageScore = Math.round((totalScore / questions.length) * 10) / 10

    const session = new Session({
      userId,
      userEmail,
      role,
      difficulty,
      questions,
      averageScore
    })

    await session.save()
    res.json({ message: 'Session saved' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get sessions by userId
router.get('/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 })
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router