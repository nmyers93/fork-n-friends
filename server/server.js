const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Fork n Friends API is running!' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/restaurants', require('./routes/restaurants'))
app.use('/api/friends', require('./routes/friends'))
app.use('/api/foursquare', require('./routes/foursquare'))
app.use('/api/groups', require('./routes/groups'))

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})