import { useState } from 'react'
import './AddRestaurantForm.css'
import { searchRestaurants } from '../utils/foursquare'

function AddRestaurantForm({ onAddRestaurant }) {
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchRestaurants(searchQuery)
      setSearchResults(results)
      console.log('Search results:', results)
    }
  }

  const selectRestaurant = (restaurant) => {
    setRestaurantName(restaurant.name)
    setCuisine(restaurant.categories?.[0]?.name || '')
    setLocation(restaurant.location?.formatted_address || '')
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newRestaurant = {
      name: restaurantName,
      cuisine: cuisine,
      location: location,
      rating: 0
    }
    
    onAddRestaurant(newRestaurant)
    
    // Clear the form
    setRestaurantName('')
    setCuisine('')
    setLocation('')
  }

  return (
    <div className="add-restaurant-form">
      <h2>Add a Restaurant</h2>
      
      <div className="search-section">
        <input 
          type="text"
          placeholder="Search for a restaurant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((restaurant, index) => (
            <div 
              key={index} 
              className="search-result-item"
              onClick={() => selectRestaurant(restaurant)}
            >
              <strong>{restaurant.name}</strong>
              <p>{restaurant.location?.formatted_address}</p>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Restaurant name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
        />
        
        <input 
          type="text"
          placeholder="Cuisine type (e.g., Italian, Mexican)"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
        
        <input 
          type="text"
          placeholder="Location/Address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        
        <button type="submit">Add Restaurant</button>
      </form>
    </div>
  )
}

export default AddRestaurantForm