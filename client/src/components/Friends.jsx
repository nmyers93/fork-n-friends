import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import './Friends.css'

/**
 * Friends Component
 * 
 * Manages the entire friend system including:
 * - Searching for users by username
 * - Sending friend requests
 * - Accepting/declining friend requests
 * - Viewing friends list
 * - Unfriending users (removes both sides of friendship)
 * 
 * Creates bidirectional friendships (both users have friendship records)
 * 
 * @param {string} userId - Current user's UUID
 */
function Friends({ userId }) {
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  
  // Friend data states
  const [friends, setFriends] = useState([]) // Accepted friends
  const [pendingRequests, setPendingRequests] = useState([]) // Incoming requests
  const [loading, setLoading] = useState(true)

  /**
   * Fetch friends and pending requests on component mount
   * Re-runs when userId changes
   */
  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [userId])

  /**
   * Fetch all accepted friends for the current user
   * Includes friend profile information (username, email)
   */
  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          profiles:friend_id (username, email)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
      
      if (error) throw error
      setFriends(data || [])
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch pending friend requests sent TO the current user
   * These are requests where current user is the friend_id
   */
  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          profiles:user_id (username, email)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
      
      if (error) throw error
      setPendingRequests(data || [])
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  /**
   * Search for users by username
   * Excludes current user from results
   * Case-insensitive search using ilike
   */
  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email')
        .ilike('username', `%${searchQuery}%`) // Case-insensitive LIKE
        .neq('id', userId) // Exclude current user
        .limit(5)
      
      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  /**
   * Send a friend request to another user
   * Creates a pending friendship record
   * 
   * @param {string} friendId - UUID of user to send request to
   */
  const sendFriendRequest = async (friendId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert([{
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        }])
      
      if (error) throw error
      
      alert('Friend request sent!')
      setSearchResults([])
      setSearchQuery('')
    } catch (error) {
      console.error('Error sending friend request:', error)
      alert('Failed to send friend request')
    }
  }

  /**
   * Accept a friend request
   * 1. Updates the request status to 'accepted'
   * 2. Creates a reciprocal friendship (bidirectional)
   * 
   * This ensures both users can see each other as friends
   * 
   * @param {string} requestId - UUID of the friendship request
   * @param {string} friendId - UUID of the user who sent the request
   */
  const acceptFriendRequest = async (requestId, friendId) => {
    try {
      // Update the existing request to accepted
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
      
      if (updateError) throw updateError

      // Create reciprocal friendship so both users are friends
      const { error: insertError } = await supabase
        .from('friendships')
        .insert([{
          user_id: userId,
          friend_id: friendId,
          status: 'accepted'
        }])
      
      if (insertError) throw insertError

      // Refresh both lists
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error('Error accepting friend request:', error)
    }
  }

  /**
   * Decline a friend request
   * Simply deletes the pending friendship record
   * 
   * @param {string} requestId - UUID of the friendship request
   */
  const declineFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
      
      if (error) throw error
      
      fetchPendingRequests()
    } catch (error) {
      console.error('Error declining friend request:', error)
    }
  }

  /**
   * Unfriend a user
   * Deletes BOTH friendship records (bidirectional unfriend)
   * Shows confirmation dialog before deletion
   * 
   * @param {string} friendshipId - UUID of your friendship record
   * @param {string} friendId - UUID of the friend to unfriend
   */
  const unfriendUser = async (friendshipId, friendId) => {
    if (!confirm('Are you sure you want to unfriend this user?')) return

    try {
      // Delete your friendship record
      const { error: deleteError1 } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
      
      if (deleteError1) throw deleteError1

      // Delete their friendship record (reciprocal)
      const { error: deleteError2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId)
      
      if (deleteError2) throw deleteError2
      
      fetchFriends()
    } catch (error) {
      console.error('Error unfriending user:', error)
    }
  }

  // Show loading state while fetching initial data
  if (loading) {
    return <div className="friends-container"><p>Loading...</p></div>
  }

  return (
    <div className="friends-container">
      <h2>👥 Friends</h2>

      {/* Search for users section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            // Allow Enter key to trigger search
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

      {/* Display pending friend requests */}
      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h3>Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="user-item">
              <span><strong>{request.profiles.username}</strong></span>
              <div className="button-group">
                <button 
                  className="accept-btn"
                  onClick={() => acceptFriendRequest(request.id, request.user_id)}
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
              <span><strong>{friendship.profiles.username}</strong></span>
              <button 
                className="remove-btn"
                onClick={() => unfriendUser(friendship.id, friendship.friend_id)}
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