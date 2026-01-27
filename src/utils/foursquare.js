/**
 * Foursquare Places API Integration
 * 
 * Provides functionality to search for restaurants using the Foursquare Places API.
 * Uses Vite's proxy to avoid CORS issues during development.
 * 
 * API Documentation: https://location.foursquare.com/developer/reference/places-api-overview
 */

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY

/**
 * Search for restaurants using Foursquare Places API
 * 
 * @param {string} query - Search term (restaurant name or type)
 * @param {string} location - Location to search near (default: 'New York')
 * @returns {Promise<Array>} - Array of restaurant objects with name, location, categories
 * 
 * Restaurant object structure:
 * {
 *   name: string,
 *   location: {
 *     formatted_address: string,
 *     ...
 *   },
 *   categories: [
 *     {
 *       name: string (e.g., "Italian Restaurant")
 *     }
 *   ]
 * }
 */
export const searchRestaurants = async (query, location = 'New York') => {
  // Use /api proxy configured in vite.config.js to avoid CORS
  // categories=13000 filters to Food & Dining category
  const url = `/api/v3/places/search?query=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}&categories=13000`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY, // API key for authentication
        'Accept': 'application/json',
        'X-Places-Api-Version': '2025-06-17' // Required API version header
      }
    })
    
    const data = await response.json()
    console.log('Foursquare results:', data)
    
    // Return results array, or empty array if no results
    return data.results || []
  } catch (error) {
    console.error('Error fetching from Foursquare:', error)
    return []
  }
}