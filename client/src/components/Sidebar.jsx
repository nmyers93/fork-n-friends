import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import './Sidebar.css'

/**
 * Sidebar Component
 * 
 * Navigation sidebar with links to different pages
 * Always visible on desktop, collapsible on mobile
 * 
 * @param {Object} user - Current logged-in user
 * @param {Function} onSignOut - Sign out callback
 */
function Sidebar({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button - hide when sidebar is open */}
      <button 
        className={`mobile-menu-btn ${isOpen ? 'hidden' : ''}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🍴 Fork n' Friends</h2>
        </div>

        {/* User info at top */}
        <div className="sidebar-user">
          <div className="user-info">
            <strong>{user.username}</strong>
            <span className="user-email">{user.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            <span className="icon">🏠</span>
            <span>Home</span>
          </NavLink>

          <NavLink 
            to="/friends" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            <span className="icon">👥</span>
            <span>Friends</span>
          </NavLink>

          <NavLink 
            to="/explore" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            <span className="icon">🍽️</span>
            <span>Explore</span>
          </NavLink>

          <NavLink 
            to="/groups" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            <span className="icon">👨‍👩‍👧‍👦</span>
            <span>Groups</span>
          </NavLink>

          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            <span className="icon">👤</span>
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* Sign out at bottom */}
        <div className="sidebar-footer">
          <button onClick={onSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar