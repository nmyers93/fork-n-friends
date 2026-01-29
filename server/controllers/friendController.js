const pool = require('../config/db')

/**
 * Search for users by username
 * GET /api/friends/search?query=username
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    // Search for users excluding current user
    const result = await pool.query(
      `SELECT id, username, email 
       FROM users 
       WHERE username ILIKE $1 AND id != $2 
       LIMIT 10`,
      [`%${query}%`, req.user.id]
    )

    res.json({ users: result.rows })
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ error: 'Server error searching users' })
  }
}

/**
 * Get all friends (accepted friendships)
 * GET /api/friends
 */
const getFriends = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.friend_id, f.created_at, u.username, u.email
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1 AND f.status = $2
       ORDER BY f.created_at DESC`,
      [req.user.id, 'accepted']
    )

    res.json({ friends: result.rows })
  } catch (error) {
    console.error('Get friends error:', error)
    res.status(500).json({ error: 'Server error fetching friends' })
  }
}

/**
 * Get pending friend requests (received)
 * GET /api/friends/requests
 */
const getPendingRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.user_id, f.created_at, u.username, u.email
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = $2
       ORDER BY f.created_at DESC`,
      [req.user.id, 'pending']
    )

    res.json({ requests: result.rows })
  } catch (error) {
    console.error('Get pending requests error:', error)
    res.status(500).json({ error: 'Server error fetching pending requests' })
  }
}

/**
 * Send a friend request
 * POST /api/friends/request
 */
const sendFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.body

    if (!friend_id) {
      return res.status(400).json({ error: 'Friend ID is required' })
    }

    // Can't send request to yourself
    if (friend_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' })
    }

    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [friend_id]
    )

    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if friendship already exists
    const existingFriendship = await pool.query(
      'SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [req.user.id, friend_id]
    )

    if (existingFriendship.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already sent' })
    }

    // Create friend request
    const result = await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.user.id, friend_id, 'pending']
    )

    res.status(201).json({
      message: 'Friend request sent',
      friendship: result.rows[0]
    })
  } catch (error) {
    console.error('Send friend request error:', error)
    res.status(500).json({ error: 'Server error sending friend request' })
  }
}

/**
 * Accept a friend request
 * PUT /api/friends/accept/:id
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params

    // Check if request exists and is for current user
    const requestCheck = await pool.query(
      'SELECT * FROM friendships WHERE id = $1 AND friend_id = $2 AND status = $3',
      [id, req.user.id, 'pending']
    )

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' })
    }

    const request = requestCheck.rows[0]

    // Update request to accepted
    await pool.query(
      'UPDATE friendships SET status = $1 WHERE id = $2',
      ['accepted', id]
    )

    // Create reciprocal friendship
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status) 
       VALUES ($1, $2, $3)`,
      [req.user.id, request.user_id, 'accepted']
    )

    res.json({ message: 'Friend request accepted' })
  } catch (error) {
    console.error('Accept friend request error:', error)
    res.status(500).json({ error: 'Server error accepting friend request' })
  }
}

/**
 * Decline a friend request
 * DELETE /api/friends/decline/:id
 */
const declineFriendRequest = async (req, res) => {
  try {
    const { id } = req.params

    // Check if request exists and is for current user
    const requestCheck = await pool.query(
      'SELECT * FROM friendships WHERE id = $1 AND friend_id = $2 AND status = $3',
      [id, req.user.id, 'pending']
    )

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' })
    }

    // Delete the request
    await pool.query('DELETE FROM friendships WHERE id = $1', [id])

    res.json({ message: 'Friend request declined' })
  } catch (error) {
    console.error('Decline friend request error:', error)
    res.status(500).json({ error: 'Server error declining friend request' })
  }
}

/**
 * Unfriend a user (remove both friendships)
 * DELETE /api/friends/:id
 */
const unfriendUser = async (req, res) => {
  try {
    const { id } = req.params

    // Check if friendship exists
    const friendshipCheck = await pool.query(
      'SELECT * FROM friendships WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )

    if (friendshipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' })
    }

    const friendship = friendshipCheck.rows[0]

    // Delete both sides of the friendship
    await pool.query('DELETE FROM friendships WHERE id = $1', [id])
    await pool.query(
      'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [friendship.friend_id, req.user.id]
    )

    res.json({ message: 'Friend removed successfully' })
  } catch (error) {
    console.error('Unfriend user error:', error)
    res.status(500).json({ error: 'Server error removing friend' })
  }
}

module.exports = {
  searchUsers,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriendUser
}