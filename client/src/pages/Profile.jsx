import './Pages.css'

/**
 * Profile Page
 * 
 * User profile and settings
 */
function Profile({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-row">
              <label>Member since:</label>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="coming-soon">
          <h3>Settings coming soon:</h3>
          <ul>
            <li>Change username</li>
            <li>Update email</li>
            <li>Change password</li>
            <li>Privacy settings</li>
            <li>Notification preferences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Profile