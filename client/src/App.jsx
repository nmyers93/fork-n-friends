import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Explore from './pages/Explore'
import Groups from './pages/Groups'
import Profile from './pages/Profile'
import { auth } from './services/api'

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const data = await auth.getMe()
          setUser(data.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          auth.logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  /**
   * Sign out user
   */
  const handleSignOut = () => {
    auth.logout()
    setUser(null)
  }

  // Show loading state
  if (loading) {
    return <div className="app-loading"><p>Loading...</p></div>
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="app">
        <header className="auth-header">
          <h1>🍴 Fork n' Friends</h1>
          <p>Decide where to eat with your friends</p>
        </header>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    )
  }

  // Main app with sidebar and routing
  return (
    <Router>
      <div className="app-container">
        <Sidebar user={user} onSignOut={handleSignOut} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/friends" element={<Friends user={user} />} />
            <Route path="/explore" element={<Explore user={user} />} />
            <Route path="/groups" element={<Groups user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App