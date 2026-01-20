import './RestaurantList.css'
import StarRating from './StarRating'

function RestaurantList({ restaurants, onUpdateRating, onDeleteRestaurant }) {
  return (
    <div className="restaurant-list">
      <h2>My Restaurants</h2>
      {restaurants.length === 0 ? (
        <p>No restaurants yet. Add one above!</p>
      ) : (
        <ul>
          {restaurants.map((restaurant, index) => (
            <li key={index}>
              <div className="restaurant-info">
                <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
                <StarRating 
                  rating={restaurant.rating} 
                  onRatingChange={(newRating) => onUpdateRating(index, newRating)}
                />
              </div>
              <button 
                className="delete-btn"
                onClick={() => onDeleteRestaurant(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RestaurantList