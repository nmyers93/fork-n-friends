import './RestaurantList.css'
import StarRating from './StarRating'

function RestaurantList({ restaurants, onUpdateRating, onDeleteRestaurant }) {
  const triedRestaurants = restaurants.filter(r => !r.is_wishlist)
  const wishlistRestaurants = restaurants.filter(r => r.is_wishlist)

  const renderRestaurants = (restaurantList, startIndex = 0) => {
    if (restaurantList.length === 0) {
      return <p className="empty-message">No restaurants yet.</p>
    }

    return (
      <ul>
        {restaurantList.map((restaurant, index) => {
          const actualIndex = restaurants.indexOf(restaurant)
          return (
            <li key={restaurant.id}>
              <div className="restaurant-info">
                <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
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
      <div className="list-section">
        <h2>🍽️ Tried ({triedRestaurants.length})</h2>
        {renderRestaurants(triedRestaurants)}
      </div>

      <div className="list-section">
        <h2>⭐ Wishlist ({wishlistRestaurants.length})</h2>
        {renderRestaurants(wishlistRestaurants)}
      </div>
    </div>
  )
}

export default RestaurantList