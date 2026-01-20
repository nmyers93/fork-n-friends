import { useState } from 'react'
import './AddRestaurantForm.css'
import { searchRestaurants } from '../utils/foursquare'

function AddRestaurantForm({ onAddRestaurant }) {
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [errors, setErrors] = useState({})

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
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!restaurantName.trim()) {
      newErrors.name = 'Restaurant name is required'
    }

    if (!cuisine.trim()) {
      newErrors.cuisine = 'Cuisine type is required'
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
    
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
        <div>
          <input 
            type="text"
            placeholder="Restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div>
          <input 
            type="text"
            placeholder="Cuisine type (e.g., Italian, Mexican)"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          />
          {errors.cuisine && <span className="error-message">{errors.cuisine}</span>}
        </div>
        <div>
          <input 
            type="text"
            placeholder="Location/Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>
        
        
        <button type="submit">Add Restaurant</button>
      </form>
    </div>
  )
}

export default AddRestaurantForm