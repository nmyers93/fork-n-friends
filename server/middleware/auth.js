const jwt = require('jsonwebtoken')

/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header
 * Adds user data to req.user if valid
 * Returns 401 if token is missing or invalid
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Add user data to request
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' })
  }
}

module.exports = auth