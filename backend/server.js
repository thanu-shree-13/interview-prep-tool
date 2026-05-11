const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json())

// API routes
app.use('/api/questions', require('./routes/questions'))
app.use('/api/sessions', require('./routes/sessions'))

// Serve React frontend
app.use(express.static(path.join(__dirname, '../frontend/build')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})