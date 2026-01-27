import './RestaurantList.css'
import StarRating from './StarRating'

/**
 * RestaurantList Component
 * 
 * Displays restaurants in two categories:
 * - Tried: Restaurants the user has visited
 * - Wishlist: Restaurants the user wants to try
 * 
 * In "my" view mode: Shows user's own restaurants with delete buttons
 * In "friends" view mode: Shows friends' non-hidden restaurants grouped by friend
 * 
 * Features:
 * - Separate sections for tried vs wishlist
 * - Star ratings (editable for own restaurants only)
 * - Delete functionality (own restaurants only)
 * - Grouped display for friends' restaurants
 * 
 * @param {Array} restaurants - Array of restaurant objects
 * @param {Function} onUpdateRating - Callback to update restaurant rating
 * @param {Function} onDeleteRestaurant - Callback to delete restaurant
 * @param {string} viewMode - Either 'my' or 'friends'
 */
function RestaurantList({ restaurants, onUpdateRating, onDeleteRestaurant, viewMode }) {
  // Separate restaurants into tried and wishlist categories
  const triedRestaurants = restaurants.filter(r => !r.is_wishlist)
  const wishlistRestaurants = restaurants.filter(r => r.is_wishlist)

  /**
   * Render a list of restaurants
   * Handles both individual user view and grouped friends view
   * 
   * @param {Array} restaurantList - Filtered list of restaurants to display
   * @returns {JSX.Element} - Rendered restaurant list
   */
  const renderRestaurants = (restaurantList) => {
    // Show empty state if no restaurants
    if (restaurantList.length === 0) {
      return <p className="empty-message">No restaurants yet.</p>
    }

    // Group by friend when viewing friends' restaurants
    if (viewMode === 'friends') {
      // Create an object with usernames as keys and arrays of restaurants as values
      const groupedByFriend = {}
      
      restaurantList.forEach(restaurant => {
        const friendUsername = restaurant.profiles?.username || 'Unknown'
        if (!groupedByFriend[friendUsername]) {
          groupedByFriend[friendUsername] = []
        }
        groupedByFriend[friendUsername].push(restaurant)
      })

      // Render grouped sections
      return (
        <div className="friends-groups">
          {Object.entries(groupedByFriend).map(([friendUsername, friendRestaurants]) => (
            <div key={friendUsername} className="friend-group">
              <h4>@{friendUsername} ({friendRestaurants.length})</h4>
              <ul>
                {friendRestaurants.map((restaurant) => {
                  // Find index in original array for update/delete callbacks
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
          // Find index in original array for update/delete callbacks
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
              {/* Only show delete button for own restaurants */}
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
        <h2>🍽️ Tried ({triedRestaurants.length})</h2>
        {renderRestaurants(triedRestaurants)}
      </div>

      {/* Wishlist restaurants section */}
      <div className="list-section">
        <h2>⭐ Wishlist ({wishlistRestaurants.length})</h2>
        {renderRestaurants(wishlistRestaurants)}
      </div>
    </div>
  )
}

export default RestaurantList