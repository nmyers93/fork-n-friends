import { useState } from 'react'
import { auth } from '../services/api'
import './Auth.css'

/**
 * Auth Component
 * 
 * Handles user authentication (signup and login)
 * Now uses custom Node.js backend instead of Supabase
 */
function Auth({ onAuthSuccess }) {
  // Form states
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  
  // UI states
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  /**
   * Handle authentication (signup or login)
   */
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up new user
        const data = await auth.signup(username, email, password)
        setMessage('Account created successfully!')
        // Notify parent component of successful auth
        if (onAuthSuccess) {
          onAuthSuccess(data.user)
        }
      } else {
        // Log in existing user
        const data = await auth.login(email, password)
        setMessage('Logged in successfully!')
        // Notify parent component of successful auth
        if (onAuthSuccess) {
          onAuthSuccess(data.user)
        }
      }
    } catch (error) {
      // Display error message
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleAuth}>
        {/* Username field - only shown during signup */}
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        
        {/* Email field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {/* Password field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>
      
      {/* Display message */}
      {message && <p className="auth-message">{message}</p>}
      
      {/* Toggle between signup and login */}
      <button 
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp)
          setMessage('')
        }}
        className="toggle-auth"
      >
        {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
      </button>
    </div>
  )
}

export default Auth