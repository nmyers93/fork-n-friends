require('dotenv').config()

/**
 * Search for restaurants using Foursquare Places API
 * GET /api/foursquare/search?query=pizza&location=New York
 */
const searchRestaurants = async (req, res) => {
  try {
    const { query, location = '' } = req.query

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    // Use provided location or default to general search
    const searchLocation = location && location.trim() ? location : 'United States'

    const url = `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(query)}&near=${encodeURIComponent(searchLocation)}&categories=13000`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        'Accept': 'application/json',
        'X-Places-Api-Version': '2025-06-17'
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Foursquare error:', errorData)
      throw new Error('Foursquare API request failed')
    }

    const data = await response.json()
    res.json({ results: data.results || [] })
  } catch (error) {
    console.error('Foursquare search error:', error)
    res.status(500).json({ error: 'Failed to search restaurants' })
  }
}

module.exports = {
  searchRestaurants
}