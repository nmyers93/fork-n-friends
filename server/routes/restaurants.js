const express = require('express')
const router = express.Router()
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getFriendsRestaurants
} = require('../controllers/restaurantController')
const auth = require('../middleware/auth')

/**
 * Restaurant Routes (all protected)
 * 
 * GET /api/restaurants - Get all user's restaurants
 * GET /api/restaurants/friends - Get friends' restaurants
 * GET /api/restaurants/:id - Get single restaurant
 * POST /api/restaurants - Create new restaurant
 * PUT /api/restaurants/:id - Update restaurant
 * DELETE /api/restaurants/:id - Delete restaurant
 */

// Friends restaurants must come before :id route to avoid conflicts
router.get('/friends', auth, getFriendsRestaurants)

router.get('/', auth, getRestaurants)
router.get('/:id', auth, getRestaurant)
router.post('/', auth, createRestaurant)
router.put('/:id', auth, updateRestaurant)
router.delete('/:id', auth, deleteRestaurant)

module.exports = router