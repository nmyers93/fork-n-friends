import { useState, useEffect } from 'react'
import RestaurantList from '../components/RestaurantList'
import { restaurants as restaurantsApi } from '../services/api'
import './Pages.css'

/**
 * Explore Page
 * 
 * View restaurants from friends
 */
function Explore({ user }) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriendsRestaurants()
  }, [])

  const fetchFriendsRestaurants = async () => {
    try {
      const data = await restaurantsApi.getFriendsRestaurants()
      // Format friends' restaurants to include owner info
      const formattedRestaurants = data.restaurants.map(r => ({
        ...r,
        profiles: { username: r.owner_username }
      }))
      setRestaurants(formattedRestaurants)
    } catch (error) {
      console.error('Error fetching friends restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRating = async () => {
    alert("You can only rate your own restaurants!")
  }

  const deleteRestaurant = async () => {
    alert("You can only delete your own restaurants!")
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Explore Friends' Restaurants</h1>
        <p>Discover where your friends love to eat</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No friends' restaurants yet. Add some friends to see their recommendations!</p>
        </div>
      ) : (
        <RestaurantList 
          restaurants={restaurants} 
          onUpdateRating={updateRating}
          onDeleteRestaurant={deleteRestaurant}
          viewMode="friends"
        />
      )}
    </div>
  )
}

export default Explore