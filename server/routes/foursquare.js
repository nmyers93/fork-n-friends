const express = require('express')
const router = express.Router()
const { searchRestaurants } = require('../controllers/foursquareController')
const auth = require('../middleware/auth')

/**
 * Foursquare Routes
 * 
 * GET /api/foursquare/search - Search for restaurants (protected)
 */

router.get('/search', auth, searchRestaurants)

module.exports = router