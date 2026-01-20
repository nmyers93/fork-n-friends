const API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY

export const searchRestaurants = async (query, location = 'Chicago') => {
  const url = `/places/search?query=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}&categories=13000`
  console.log('Fetching URL:', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Accept': 'application/json',
        'X-Places-Api-Version': '2025-06-17'
      }
    })
    
    const data = await response.json()
    console.log('Foursquare results:', data)
    return data.results || []
  } catch (error) {
    console.error('Error fetching from Foursquare:', error)
    return []
  }
}