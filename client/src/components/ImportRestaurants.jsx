import { useState, useEffect } from 'react'
import { restaurants as restaurantsApi } from '../services/api'
import './ImportRestaurants.css'

/**
 * ImportRestaurants Component
 * 
 * Modal popup for selecting restaurants from user's personal list
 * to import into a group
 * 
 * Features:
 * - Displays all user's personal restaurants (tried and wishlist)
 * - Select/deselect individual restaurants
 * - Select All / Deselect All toggle
 * - Grouped by Tried and Wishlist categories
 * 
 * @param {Function} onImport - Callback with array of selected restaurant IDs
 * @param {Function} onClose - Callback to close the modal
 * @param {Array} existingGroupRestaurants - Restaurants already in the group (to exclude)
 */
function ImportRestaurants({ onImport, onClose, existingGroupRestaurants }) {
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Get existing restaurant names in the group to filter duplicates
  const existingNames = new Set(
    existingGroupRestaurants.map(r => r.name.toLowerCase())
  )

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantsApi.getAll()
      // Filter out restaurants already in the group (by name match)
      // and restaurants that already belong to a group
      const available = data.restaurants.filter(
        r => !existingNames.has(r.name.toLowerCase()) && !r.group_id
      )
      setRestaurants(available)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle individual restaurant selection
  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Select all available restaurants
  const selectAll = () => {
    setSelected(new Set(restaurants.map(r => r.id)))
  }

  // Deselect all restaurants
  const deselectAll = () => {
    setSelected(new Set())
  }

  // Handle import button
  const handleImport = () => {
    if (selected.size === 0) {
      alert('Please select at least one restaurant to import')
      return
    }
    onImport([...selected])
  }

  const triedRestaurants = restaurants.filter(r => !r.is_wishlist)
  const wishlistRestaurants = restaurants.filter(r => r.is_wishlist)

  // Render a list of restaurants with checkboxes
  const renderRestaurantList = (list) => {
    if (list.length === 0) {
      return <p className="import-empty">None available</p>
    }

    return list.map(restaurant => (
      <label key={restaurant.id} className="import-restaurant-item">
        <input
          type="checkbox"
          checked={selected.has(restaurant.id)}
          onChange={() => toggleSelect(restaurant.id)}
        />
        <div className="import-restaurant-info">
          <strong>{restaurant.name}</strong>
          <span>{restaurant.cuisine} · {restaurant.location}</span>
        </div>
      </label>
    ))
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="import-modal-header">
          <h2>Import Restaurants</h2>
          <button className="import-close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p className="import-loading">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="import-empty">No restaurants available to import. All your restaurants are already in this group!</p>
        ) : (
          <>
            {/* Select all / Deselect all controls */}
            <div className="import-controls">
              <button
                className={`import-select-btn ${selected.size === restaurants.length ? 'active' : ''}`}
                onClick={selected.size === restaurants.length ? deselectAll : selectAll}
              >
                {selected.size === restaurants.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="import-count">
                {selected.size} of {restaurants.length} selected
              </span>
            </div>

            {/* Restaurant lists */}
            <div className="import-list">
              {triedRestaurants.length > 0 && (
                <div className="import-section">
                  <h3>🍽️ Tried</h3>
                  {renderRestaurantList(triedRestaurants)}
                </div>
              )}

              {wishlistRestaurants.length > 0 && (
                <div className="import-section">
                  <h3>⭐ Wishlist</h3>
                  {renderRestaurantList(wishlistRestaurants)}
                </div>
              )}
            </div>

            {/* Import button */}
            <div className="import-modal-footer">
              <button className="import-cancel-btn" onClick={onClose}>Cancel</button>
              <button
                className="import-submit-btn"
                onClick={handleImport}
                disabled={selected.size === 0}
              >
                Import {selected.size > 0 ? `(${selected.size})` : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImportRestaurants