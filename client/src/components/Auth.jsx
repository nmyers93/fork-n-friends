import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import './Auth.css'

/**
 * Auth Component
 * 
 * Handles user authentication (signup and login)
 * 
 * Features:
 * - Toggle between signup and login modes
 * - Custom username during signup
 * - Password and email validation
 * - Error and success messages
 * - Integrates with Supabase Auth
 * 
 * Username is stored in user metadata and automatically
 * added to profiles table via database trigger
 */
function Auth() {
  // Form states
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  
  // UI states
  const [isSignUp, setIsSignUp] = useState(false) // Toggle between signup/login
  const [message, setMessage] = useState('') // Success or error messages

  /**
   * Handle authentication (signup or login)
   * 
   * @param {Event} e - Form submit event
   */
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up new user with username in metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username // Stored in user metadata
            }
          }
        })
        if (error) throw error
        setMessage('Account created successfully!')
      } else {
        // Log in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('Logged in successfully!')
      }
    } catch (error) {
      // Display error message from Supabase
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
        
        {/* Email field - always shown */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {/* Password field - always shown */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Submit button with loading state */}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>
      
      {/* Display success or error message */}
      {message && <p className="auth-message">{message}</p>}
      
      {/* Toggle between signup and login */}
      <button 
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="toggle-auth"
      >
        {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
      </button>
    </div>
  )
}

export default Auth