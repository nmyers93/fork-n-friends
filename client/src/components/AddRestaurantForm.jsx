import { useState } from 'react'
import './AddRestaurantForm.css'
import { foursquare } from '../services/api'

/**
 * AddRestaurantForm Component
 * 
 * Allows users to add restaurants to their list either by:
 * 1. Searching Foursquare API and selecting from results
 * 2. Manually entering restaurant details
 * 
 * Features:
 * - Real-time form validation
 * - Auto-populate from API search results
 * - Wishlist toggle (tried vs want-to-try)
 * - Enter key support for search
 * 
 * @param {Function} onAddRestaurant - Callback to add restaurant to database
 */
function AddRestaurantForm({ onAddRestaurant }) {
  // Form field states
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState('')
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  
  // Validation and wishlist states
  const [errors, setErrors] = useState({})
  const [isWishlist, setIsWishlist] = useState(false)

  /**
   * Search for restaurants using Foursquare API
   * Triggered by search button or Enter key
   */
  const handleSearch = async () => {
  if (searchQuery.trim()) {
    try {
      const data = await foursquare.search(searchQuery)
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }
}

  /**
   * Auto-populate form fields when user selects a search result
   * Also clears search results and any existing errors
   * 
   * @param {Object} restaurant - Restaurant object from Foursquare API
   */
  const selectRestaurant = (restaurant) => {
    setRestaurantName(restaurant.name)
    setCuisine(restaurant.categories?.[0]?.name || '')
    setLocation(restaurant.location?.formatted_address || '')
    setSearchResults([])
    setSearchQuery('')
    setErrors({})
  }

  /**
   * Validate form fields before submission
   * Checks that name, cuisine, and location are not empty
   * 
   * @returns {boolean} - True if form is valid, false otherwise
   */
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
    // Return true if no errors (empty object)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   * Validates form, calls parent callback, and resets form
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Don't submit if validation fails
    if (!validateForm()) {
      return
    }
    
    // Create restaurant object with all form data
    const newRestaurant = {
      name: restaurantName,
      cuisine: cuisine,
      location: location,
      rating: 0, // New restaurants start unrated
      is_wishlist: isWishlist
    }
    
    // Call parent component's add function
    onAddRestaurant(newRestaurant)
    
    // Reset form to initial state
    setRestaurantName('')
    setCuisine('')
    setLocation('')
    setErrors({})
    setIsWishlist(false)
  }

  return (
    <div className="add-restaurant-form">
      <h2>Add a Restaurant</h2>
      
      {/* Search section for Foursquare API */}
      <div className="search-section">
        <input 
          type="text"
          placeholder="Search for a restaurant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            // Allow Enter key to trigger search
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>

      {/* Display search results if any */}
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
      
      {/* Main form for restaurant details */}
      <form onSubmit={handleSubmit}>
        {/* Restaurant name field with validation */}
        <div>
          <input 
            type="text"
            placeholder="Restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        {/* Cuisine type field with validation */}
        <div>
          <input 
            type="text"
            placeholder="Cuisine type (e.g., Italian, Mexican)"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className={errors.cuisine ? 'error' : ''}
          />
          {errors.cuisine && <span className="error-message">{errors.cuisine}</span>}
        </div>
        
        {/* Location field with validation */}
        <div>
          <input 
            type="text"
            placeholder="Location/Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        {/* Wishlist toggle checkbox */}
        <div className="wishlist-toggle">
          <label>
            <input 
              type="checkbox"
              checked={isWishlist}
              onChange={(e) => setIsWishlist(e.target.checked)}
            />
            <span>Add to wishlist (want to try)</span>
          </label>
        </div>
        
        <button type="submit">Add Restaurant</button>
      </form>
    </div>
  )
}

export default AddRestaurantForm