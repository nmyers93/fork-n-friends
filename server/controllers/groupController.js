const pool = require('../config/db')

/**
 * Create a new group
 * POST /api/groups
 */
const createGroup = async (req, res) => {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' })
    }

    // Create the group
    const groupResult = await pool.query(
      `INSERT INTO groups (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), req.user.id]
    )

    const group = groupResult.rows[0]

    // Automatically add creator as accepted member
    await pool.query(
      `INSERT INTO group_members (group_id, user_id, can_edit, status)
       VALUES ($1, $2, $3, $4)`,
      [group.id, req.user.id, true, 'accepted']
    )

    res.status(201).json({
      message: 'Group created successfully',
      group
    })
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({ error: 'Server error creating group' })
  }
}

/**
 * Get all groups the user is a member of (accepted only)
 * GET /api/groups
 */
const getGroups = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, 
              gm.can_edit,
              u.username as creator_username,
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'accepted') as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       JOIN users u ON g.created_by = u.id
       WHERE gm.user_id = $1 AND gm.status = 'accepted'
       ORDER BY g.created_at DESC`,
      [req.user.id]
    )

    res.json({ groups: result.rows })
  } catch (error) {
    console.error('Get groups error:', error)
    res.status(500).json({ error: 'Server error fetching groups' })
  }
}

/**
 * Get a single group by ID, including members and restaurants
 * GET /api/groups/:id
 */
const getGroup = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user is an accepted member of the group
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
      [id, req.user.id]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    // Get group info
    const groupResult = await pool.query(
      `SELECT g.*, u.username as creator_username
       FROM groups g
       JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      [id]
    )

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    // Get accepted group members only
    const membersResult = await pool.query(
      `SELECT gm.*, u.username, u.email
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1 AND gm.status = 'accepted'
       ORDER BY gm.joined_at ASC`,
      [id]
    )

    // Get group restaurants
    const restaurantsResult = await pool.query(
      `SELECT r.*, u.username as owner_username
       FROM restaurants r
       JOIN users u ON r.owner_id = u.id
       WHERE r.group_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    )

    res.json({
      group: groupResult.rows[0],
      members: membersResult.rows,
      restaurants: restaurantsResult.rows
    })
  } catch (error) {
    console.error('Get group error:', error)
    res.status(500).json({ error: 'Server error fetching group' })
  }
}

/**
 * Update a group's name
 * PUT /api/groups/:id
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    // Only group creator can update
    const groupCheck = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can update the group' })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' })
    }

    const result = await pool.query(
      `UPDATE groups SET name = $1 WHERE id = $2 RETURNING *`,
      [name.trim(), id]
    )

    res.json({
      message: 'Group updated successfully',
      group: result.rows[0]
    })
  } catch (error) {
    console.error('Update group error:', error)
    res.status(500).json({ error: 'Server error updating group' })
  }
}

/**
 * Delete a group
 * DELETE /api/groups/:id
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params

    // Only group creator can delete
    const groupCheck = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can delete the group' })
    }

    // CASCADE will handle deleting group_members and restaurants
    await pool.query(`DELETE FROM groups WHERE id = $1`, [id])

    res.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Delete group error:', error)
    res.status(500).json({ error: 'Server error deleting group' })
  }
}

/**
 * Send an invite to a user (add as pending member)
 * POST /api/groups/:id/members
 */
const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { user_id } = req.body

    // Only group creator can send invites
    const groupCheck = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can invite members' })
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if user exists
    const userExists = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    )

    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user already has a pending or accepted invite
    const alreadyMember = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status IN ('pending', 'accepted')`,
      [id, user_id]
    )

    if (alreadyMember.rows.length > 0) {
      const status = alreadyMember.rows[0].status
      return res.status(400).json({ 
        error: status === 'pending' 
          ? 'Invite already sent to this user' 
          : 'User is already a member of this group' 
      })
    }

    // Create pending invite
    const result = await pool.query(
      `INSERT INTO group_members (group_id, user_id, can_edit, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, user_id, false, 'pending']
    )

    res.status(201).json({
      message: 'Invite sent successfully',
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Add member error:', error)
    res.status(500).json({ error: 'Server error sending invite' })
  }
}

/**
 * Accept a group invite
 * PUT /api/groups/:id/members/accept
 */
const acceptInvite = async (req, res) => {
  try {
    const { id } = req.params

    // Find the pending invite for this user
    const inviteCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,
      [id, req.user.id]
    )

    if (inviteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    await pool.query(
      `UPDATE group_members SET status = 'accepted' WHERE group_id = $1 AND user_id = $2`,
      [id, req.user.id]
    )

    res.json({ message: 'Group invite accepted!' })
  } catch (error) {
    console.error('Accept invite error:', error)
    res.status(500).json({ error: 'Server error accepting invite' })
  }
}

/**
 * Decline a group invite
 * PUT /api/groups/:id/members/decline
 */
const declineInvite = async (req, res) => {
  try {
    const { id } = req.params

    // Find the pending invite for this user
    const inviteCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,
      [id, req.user.id]
    )

    if (inviteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    await pool.query(
      `UPDATE group_members SET status = 'declined' WHERE group_id = $1 AND user_id = $2`,
      [id, req.user.id]
    )

    res.json({ message: 'Group invite declined' })
  } catch (error) {
    console.error('Decline invite error:', error)
    res.status(500).json({ error: 'Server error declining invite' })
  }
}

/**
 * Get all pending group invites for the current user
 * GET /api/groups/invites
 */
const getInvites = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gm.*, g.name as group_name, u.username as creator_username
       FROM group_members gm
       JOIN groups g ON gm.group_id = g.id
       JOIN users u ON g.created_by = u.id
       WHERE gm.user_id = $1 AND gm.status = 'pending'
       ORDER BY gm.joined_at DESC`,
      [req.user.id]
    )

    res.json({ invites: result.rows })
  } catch (error) {
    console.error('Get invites error:', error)
    res.status(500).json({ error: 'Server error fetching invites' })
  }
}

/**
 * Remove a member from the group
 * DELETE /api/groups/:id/members/:memberId
 */
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params

    // Only group creator can remove members
    const groupCheck = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can remove members' })
    }

    // Can't remove the creator
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE id = $1 AND user_id = $2`,
      [memberId, groupCheck.rows[0].created_by]
    )

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: "Can't remove the group creator" })
    }

    await pool.query(
      `DELETE FROM group_members WHERE id = $1 AND group_id = $2`,
      [memberId, id]
    )

    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({ error: 'Server error removing member' })
  }
}

/**
 * Add a restaurant to a group
 * POST /api/groups/:id/restaurants
 */
const addRestaurantToGroup = async (req, res) => {
  try {
    const { id } = req.params
    const { name, cuisine, location, rating = 0, is_wishlist = false } = req.body

    // Check if user is an accepted member with edit permissions
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
      [id, req.user.id]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    if (!memberCheck.rows[0].can_edit) {
      return res.status(403).json({ error: 'You do not have permission to add restaurants to this group' })
    }

    // Validate input
    if (!name || !cuisine || !location) {
      return res.status(400).json({ error: 'Name, cuisine, and location are required' })
    }

    const result = await pool.query(
      `INSERT INTO restaurants (owner_id, group_id, name, cuisine, location, rating, is_wishlist, is_hidden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, id, name, cuisine, location, rating, is_wishlist, false]
    )

    res.status(201).json({
      message: 'Restaurant added to group',
      restaurant: result.rows[0]
    })
  } catch (error) {
    console.error('Add restaurant to group error:', error)
    res.status(500).json({ error: 'Server error adding restaurant to group' })
  }
}

/**
 * Remove a restaurant from a group
 * DELETE /api/groups/:id/restaurants/:restaurantId
 */
const removeRestaurantFromGroup = async (req, res) => {
  try {
    const { id, restaurantId } = req.params

    // Check if user is an accepted member with edit permissions
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
      [id, req.user.id]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    if (!memberCheck.rows[0].can_edit) {
      return res.status(403).json({ error: 'You do not have permission to remove restaurants from this group' })
    }

    // Check restaurant exists and belongs to this group
    const restaurantCheck = await pool.query(
      `SELECT * FROM restaurants WHERE id = $1 AND group_id = $2`,
      [restaurantId, id]
    )

    if (restaurantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found in this group' })
    }

    await pool.query(`DELETE FROM restaurants WHERE id = $1`, [restaurantId])

    res.json({ message: 'Restaurant removed from group' })
  } catch (error) {
    console.error('Remove restaurant from group error:', error)
    res.status(500).json({ error: 'Server error removing restaurant from group' })
  }
}

/**
 * Toggle edit permissions for a group member
 * PUT /api/groups/:id/members/:memberId
 */
const updateMemberPermissions = async (req, res) => {
  try {
    const { id, memberId } = req.params
    const { can_edit } = req.body

    // Only group creator can update permissions
    const groupCheck = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    )

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can update permissions' })
    }

    if (can_edit === undefined) {
      return res.status(400).json({ error: 'can_edit field is required' })
    }

    const result = await pool.query(
      `UPDATE group_members SET can_edit = $1 WHERE id = $2 AND group_id = $3 RETURNING *`,
      [can_edit, memberId, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.json({
      message: 'Permissions updated successfully',
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Update member permissions error:', error)
    res.status(500).json({ error: 'Server error updating permissions' })
  }
}

/**
 * Update rating of a restaurant in a group
 * PUT /api/groups/:id/restaurants/:restaurantId
 */
const updateGroupRestaurantRating = async (req, res) => {
  try {
    const { id, restaurantId } = req.params
    const { rating } = req.body

    // Check if user is an accepted member
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
      [id, req.user.id]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    // Validate rating
    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' })
    }

    // Check restaurant exists and belongs to this group
    const restaurantCheck = await pool.query(
      `SELECT * FROM restaurants WHERE id = $1 AND group_id = $2`,
      [restaurantId, id]
    )

    if (restaurantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found in this group' })
    }

    const result = await pool.query(
      `UPDATE restaurants SET rating = $1 WHERE id = $2 RETURNING *`,
      [rating, restaurantId]
    )

    res.json({
      message: 'Rating updated successfully',
      restaurant: result.rows[0]
    })
  } catch (error) {
    console.error('Update group restaurant rating error:', error)
    res.status(500).json({ error: 'Server error updating rating' })
  }
}

module.exports = {
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
  updateGroupRestaurantRating,
  updateMemberPermissions
}