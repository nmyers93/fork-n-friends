const express = require('express')
const router = express.Router()
const {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  acceptInvite,
  declineInvite,
  getInvites,
  addRestaurantToGroup,
  removeRestaurantFromGroup,
  updateMemberPermissions
} = require('../controllers/groupController')
const auth = require('../middleware/auth')

/**
 * Group Routes (all protected)
 * 
 * POST /api/groups - Create a new group
 * GET /api/groups - Get all user's groups
 * GET /api/groups/invites - Get pending group invites
 * GET /api/groups/:id - Get single group with members/restaurants
 * PUT /api/groups/:id - Update group name
 * DELETE /api/groups/:id - Delete group
 * 
 * POST /api/groups/:id/members - Send invite to user
 * PUT /api/groups/:id/members/accept - Accept group invite
 * PUT /api/groups/:id/members/decline - Decline group invite
 * PUT /api/groups/:id/members/:memberId - Update member permissions
 * DELETE /api/groups/:id/members/:memberId - Remove member
 * 
 * POST /api/groups/:id/restaurants - Add restaurant to group
 * DELETE /api/groups/:id/restaurants/:restaurantId - Remove restaurant
 */

router.post('/', auth, createGroup)
router.get('/', auth, getGroups)
router.get('/invites', auth, getInvites) // Must be before /:id
router.get('/:id', auth, getGroup)
router.put('/:id', auth, updateGroup)
router.delete('/:id', auth, deleteGroup)

router.post('/:id/members', auth, addMember)
router.put('/:id/members/accept', auth, acceptInvite) // Must be before /:memberId
router.put('/:id/members/decline', auth, declineInvite) // Must be before /:memberId
router.put('/:id/members/:memberId', auth, updateMemberPermissions)
router.delete('/:id/members/:memberId', auth, removeMember)

router.post('/:id/restaurants', auth, addRestaurantToGroup)
router.delete('/:id/restaurants/:restaurantId', auth, removeRestaurantFromGroup)

module.exports = router