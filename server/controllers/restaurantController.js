const pool = require('../config/db')

/**
 * Get all restaurants for the current user
 * GET /api/restaurants
 */
const getRestaurants = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )

    res.json({ restaurants: result.rows })
  } catch (error) {
    console.error('Get restaurants error:', error)
    res.status(500).json({ error: 'Server error fetching restaurants' })
  }
}

/**
 * Get a single restaurant by ID
 * GET /api/restaurants/:id
 */
const getRestaurant = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    const restaurant = result.rows[0]

    // Check if user owns this restaurant or if it's shared by a friend
    if (restaurant.owner_id !== req.user.id && !restaurant.is_hidden) {
      // Check if owner is a friend
      const friendCheck = await pool.query(
        'SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2 AND status = $3',
        [req.user.id, restaurant.owner_id, 'accepted']
      )

      if (friendCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else if (restaurant.is_hidden && restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ restaurant })
  } catch (error) {
    console.error('Get restaurant error:', error)
    res.status(500).json({ error: 'Server error fetching restaurant' })
  }
}

/**
 * Create a new restaurant
 * POST /api/restaurants
 */
const createRestaurant = async (req, res) => {
  try {
    const { name, cuisine, location, rating = 0, is_wishlist = false, is_hidden = false } = req.body

    // Validate input
    if (!name || !cuisine || !location) {
      return res.status(400).json({ error: 'Please provide name, cuisine, and location' })
    }

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' })
    }

    const result = await pool.query(
      `INSERT INTO restaurants (owner_id, name, cuisine, location, rating, is_wishlist, is_hidden) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [req.user.id, name, cuisine, location, rating, is_wishlist, is_hidden]
    )

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: result.rows[0]
    })
  } catch (error) {
    console.error('Create restaurant error:', error)
    res.status(500).json({ error: 'Server error creating restaurant' })
  }
}

/**
 * Update a restaurant
 * PUT /api/restaurants/:id
 */
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params
    const { name, cuisine, location, rating, is_wishlist, is_hidden } = req.body

    // Check if restaurant exists and belongs to user
    const restaurantCheck = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    )

    if (restaurantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    if (restaurantCheck.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own restaurants' })
    }

    // Build update query dynamically based on provided fields
    const updates = []
    const values = []
    let paramCount = 1

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`)
      values.push(name)
      paramCount++
    }
    if (cuisine !== undefined) {
      updates.push(`cuisine = $${paramCount}`)
      values.push(cuisine)
      paramCount++
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount}`)
      values.push(location)
      paramCount++
    }
    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5' })
      }
      updates.push(`rating = $${paramCount}`)
      values.push(rating)
      paramCount++
    }
    if (is_wishlist !== undefined) {
      updates.push(`is_wishlist = $${paramCount}`)
      values.push(is_wishlist)
      paramCount++
    }
    if (is_hidden !== undefined) {
      updates.push(`is_hidden = $${paramCount}`)
      values.push(is_hidden)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    values.push(id)
    const query = `UPDATE restaurants SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(query, values)

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: result.rows[0]
    })
  } catch (error) {
    console.error('Update restaurant error:', error)
    res.status(500).json({ error: 'Server error updating restaurant' })
  }
}

/**
 * Delete a restaurant
 * DELETE /api/restaurants/:id
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params

    // Check if restaurant exists and belongs to user
    const restaurantCheck = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    )

    if (restaurantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    if (restaurantCheck.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own restaurants' })
    }

    await pool.query('DELETE FROM restaurants WHERE id = $1', [id])

    res.json({ message: 'Restaurant deleted successfully' })
  } catch (error) {
    console.error('Delete restaurant error:', error)
    res.status(500).json({ error: 'Server error deleting restaurant' })
  }
}

/**
 * Get friends' restaurants (non-hidden)
 * GET /api/restaurants/friends
 */
const getFriendsRestaurants = async (req, res) => {
  try {
    // Get all accepted friends
    const friends = await pool.query(
      'SELECT friend_id FROM friendships WHERE user_id = $1 AND status = $2',
      [req.user.id, 'accepted']
    )

    if (friends.rows.length === 0) {
      return res.json({ restaurants: [] })
    }

    const friendIds = friends.rows.map(f => f.friend_id)

    // Get friends' non-hidden restaurants with owner info
    const result = await pool.query(
      `SELECT r.*, u.username as owner_username 
       FROM restaurants r
       JOIN users u ON r.owner_id = u.id
       WHERE r.owner_id = ANY($1) AND r.is_hidden = false
       ORDER BY r.created_at DESC`,
      [friendIds]
    )

    res.json({ restaurants: result.rows })
  } catch (error) {
    console.error('Get friends restaurants error:', error)
    res.status(500).json({ error: 'Server error fetching friends restaurants' })
  }
}

module.exports = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getFriendsRestaurants
}