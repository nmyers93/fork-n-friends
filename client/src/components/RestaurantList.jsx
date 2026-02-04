import { useState } from 'react'
import './RestaurantList.css'
import StarRating from './StarRating'

/**
 * RestaurantList Component
 * 
 * Displays restaurants in two collapsible categories:
 * - Tried: Restaurants the user has visited
 * - Wishlist: Restaurants the user wants to try
 */
function RestaurantList({ restaurants, onUpdateRating, onDeleteRestaurant, viewMode }) {
  const [triedExpanded, setTriedExpanded] = useState(true)
  const [wishlistExpanded, setWishlistExpanded] = useState(true)

  const triedRestaurants = restaurants.filter(r => !r.is_wishlist)
  const wishlistRestaurants = restaurants.filter(r => r.is_wishlist)

  /**
   * Render a list of restaurants
   */
  const renderRestaurants = (restaurantList) => {
    if (restaurantList.length === 0) {
      return <p className="empty-message">No restaurants yet.</p>
    }

    // Group by friend when viewing friends' restaurants
    if (viewMode === 'friends') {
      const groupedByFriend = {}
      
      restaurantList.forEach(restaurant => {
        const friendUsername = restaurant.profiles?.username || 'Unknown'
        if (!groupedByFriend[friendUsername]) {
          groupedByFriend[friendUsername] = []
        }
        groupedByFriend[friendUsername].push(restaurant)
      })

      return (
        <div className="friends-groups">
          {Object.entries(groupedByFriend).map(([friendUsername, friendRestaurants]) => (
            <div key={friendUsername} className="friend-group">
              <h4>@{friendUsername} ({friendRestaurants.length})</h4>
              <ul>
                {friendRestaurants.map((restaurant) => {
                  const actualIndex = restaurants.indexOf(restaurant)
                  return (
                    <li key={restaurant.id}>
                      <div className="restaurant-info">
                        <div>
                          <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
                        </div>
                        <StarRating 
                          rating={restaurant.rating} 
                          onRatingChange={(newRating) => onUpdateRating(actualIndex, newRating)}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )
    }

    // Regular view for own restaurants
    return (
      <ul>
        {restaurantList.map((restaurant, index) => {
          const actualIndex = restaurants.indexOf(restaurant)
          return (
            <li key={restaurant.id}>
              <div className="restaurant-info">
                <div>
                  <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
                </div>
                <StarRating 
                  rating={restaurant.rating} 
                  onRatingChange={(newRating) => onUpdateRating(actualIndex, newRating)}
                />
              </div>
              <button 
                className="delete-btn"
                onClick={() => onDeleteRestaurant(actualIndex)}
              >
                Delete
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="restaurant-list">
      {/* Tried restaurants section */}
      <div className="list-section">
        <button 
          className="list-section-header"
          onClick={() => setTriedExpanded(!triedExpanded)}
        >
          <h2>
            <span className="section-arrow">{triedExpanded ? '▼' : '▶'}</span>
            🍽️ Tried ({triedRestaurants.length})
          </h2>
        </button>
        {triedExpanded && (
          <div className="list-section-content">
            {renderRestaurants(triedRestaurants)}
          </div>
        )}
      </div>

      {/* Wishlist restaurants section */}
      <div className="list-section">
        <button 
          className="list-section-header"
          onClick={() => setWishlistExpanded(!wishlistExpanded)}
        >
          <h2>
            <span className="section-arrow">{wishlistExpanded ? '▼' : '▶'}</span>
            ⭐ Wishlist ({wishlistRestaurants.length})
          </h2>
        </button>
        {wishlistExpanded && (
          <div className="list-section-content">
            {renderRestaurants(wishlistRestaurants)}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantList