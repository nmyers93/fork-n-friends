require('dotenv').config()

/**
 * Search for restaurants using Foursquare Places API
 * GET /api/foursquare/search?query=pizza&location=New York
 */
const searchRestaurants = async (req, res) => {
  try {
    const { query, location = 'Chicago' } = req.query

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    // Debug logging
    console.log('Foursquare API Key exists:', !!process.env.FOURSQUARE_API_KEY)
    console.log('Search query:', query, 'Location:', location)

    const url = `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}&categories=13000`

    console.log('Calling Foursquare URL:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        'Accept': 'application/json',
      }
    })

    console.log('Foursquare response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Foursquare error:', errorData)
      throw new Error('Foursquare API request failed')
    }

    const data = await response.json()
    console.log('Foursquare results count:', data.results?.length || 0)
    res.json({ results: data.results || [] })
  } catch (error) {
    console.error('Foursquare search error:', error)
    res.status(500).json({ error: 'Failed to search restaurants' })
  }
}

module.exports = {
  searchRestaurants
}