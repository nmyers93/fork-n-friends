import FriendsComponent from '../components/Friends'
import './Pages.css'

/**
 * Friends Page
 * 
 * Manage friend connections, send/accept requests
 */
function Friends({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Friends</h1>
        <p>Connect with friends and share restaurant recommendations</p>
      </div>

      <FriendsComponent userId={user.id} />
    </div>
  )
}

export default Friends