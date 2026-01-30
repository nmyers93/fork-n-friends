import { useState, useEffect } from 'react'
import { friends as friendsApi } from '../services/api'
import './Friends.css'

/**
 * Friends Component
 * 
 * Now uses custom Node.js backend instead of Supabase
 */
function Friends({ userId }) {
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  
  // Friend data states
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  /**
   * Fetch friends and pending requests on mount
   */
  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [userId])

  /**
   * Fetch all accepted friends
   */
  const fetchFriends = async () => {
    try {
      const data = await friendsApi.getAll()
      setFriends(data.friends)
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch pending friend requests
   */
  const fetchPendingRequests = async () => {
    try {
      const data = await friendsApi.getPendingRequests()
      setPendingRequests(data.requests)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  /**
   * Search for users by username
   */
  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    try {
      const data = await friendsApi.search(searchQuery)
      setSearchResults(data.users)
    } catch (error) {
      console.error('Error searching users:', error)
      alert('Failed to search users')
    }
  }

  /**
   * Send friend request
   */
  const sendFriendRequest = async (friendId) => {
    try {
      await friendsApi.sendRequest(friendId)
      alert('Friend request sent!')
      setSearchResults([])
      setSearchQuery('')
    } catch (error) {
      console.error('Error sending friend request:', error)
      alert(error.message || 'Failed to send friend request')
    }
  }

  /**
   * Accept friend request
   */
  const acceptFriendRequest = async (requestId) => {
    try {
      await friendsApi.acceptRequest(requestId)
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error('Error accepting friend request:', error)
      alert('Failed to accept friend request')
    }
  }

  /**
   * Decline friend request
   */
  const declineFriendRequest = async (requestId) => {
    try {
      await friendsApi.declineRequest(requestId)
      fetchPendingRequests()
    } catch (error) {
      console.error('Error declining friend request:', error)
      alert('Failed to decline friend request')
    }
  }

  /**
   * Unfriend user
   */
  const unfriendUser = async (friendshipId) => {
    if (!confirm('Are you sure you want to unfriend this user?')) return

    try {
      await friendsApi.unfriend(friendshipId)
      fetchFriends()
    } catch (error) {
      console.error('Error unfriending user:', error)
      alert('Failed to unfriend user')
    }
  }

  // Show loading state
  if (loading) {
    return <div className="friends-container"><p>Loading...</p></div>
  }

  return (
    <div className="friends-container">
      <h2>👥 Friends</h2>

      {/* Search for users */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              searchUsers()
            }
          }}
        />
        <button type="button" onClick={searchUsers}>Search</button>
      </div>

      {/* Display search results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="user-item">
              <span><strong>{user.username}</strong></span>
              <button onClick={() => sendFriendRequest(user.id)}>
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display pending requests */}
      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h3>Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="user-item">
              <span><strong>{request.username}</strong></span>
              <div className="button-group">
                <button 
                  className="accept-btn"
                  onClick={() => acceptFriendRequest(request.id)}
                >
                  Accept
                </button>
                <button 
                  className="decline-btn"
                  onClick={() => declineFriendRequest(request.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display friends list */}
      <div className="friends-list">
        <h3>Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="empty-message">No friends yet. Search for users above!</p>
        ) : (
          friends.map((friendship) => (
            <div key={friendship.id} className="user-item">
              <span><strong>{friendship.username}</strong></span>
              <button 
                className="remove-btn"
                onClick={() => unfriendUser(friendship.id)}
              >
                Unfriend
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Friends