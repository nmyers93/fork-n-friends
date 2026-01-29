const express = require('express')
const router = express.Router()
const {
  searchUsers,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriendUser
} = require('../controllers/friendController')
const auth = require('../middleware/auth')

/**
 * Friends Routes (all protected)
 * 
 * GET /api/friends/search - Search for users by username
 * GET /api/friends - Get all friends
 * GET /api/friends/requests - Get pending friend requests
 * POST /api/friends/request - Send friend request
 * PUT /api/friends/accept/:id - Accept friend request
 * DELETE /api/friends/decline/:id - Decline friend request
 * DELETE /api/friends/:id - Unfriend user
 */

router.get('/search', auth, searchUsers)
router.get('/requests', auth, getPendingRequests)
router.get('/', auth, getFriends)
router.post('/request', auth, sendFriendRequest)
router.put('/accept/:id', auth, acceptFriendRequest)
router.delete('/decline/:id', auth, declineFriendRequest)
router.delete('/:id', auth, unfriendUser)

module.exports = router