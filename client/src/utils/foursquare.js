/**
 * Foursquare Places API Integration
 * 
 * Now proxies through our backend to avoid CORS issues in production
 */

/**
 * Search for restaurants using backend proxy
 */
export const searchRestaurants = async (query, location = 'New York') => {
  // Get token from localStorage
  const token = localStorage.getItem('token')
  
  // Call our backend which will proxy to Foursquare
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const url = `${API_URL}/foursquare/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Search failed')
    }
    
    const data = await response.json()
    console.log('Foursquare results:', data)
    
    return data.results || []
  } catch (error) {
    console.error('Error fetching from Foursquare:', error)
    return []
  }
}