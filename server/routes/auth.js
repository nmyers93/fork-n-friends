const express = require('express')
const router = express.Router()
const { signup, login, getMe } = require('../controllers/authController')
const auth = require('../middleware/auth')

/**
 * Authentication Routes
 * 
 * POST /api/auth/signup - Create new user account
 * POST /api/auth/login - Log in existing user
 * GET /api/auth/me - Get current user profile (protected)
 */

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', auth, getMe) // Protected route

module.exports = router