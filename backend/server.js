const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.use('/api/questions', require('./routes/questions'))
app.use('/api/sessions', require('./routes/sessions'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})