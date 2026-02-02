import { useState, useEffect } from 'react'
import AddRestaurantForm from '../components/AddRestaurantForm'
import RestaurantList from '../components/RestaurantList'
import { restaurants as restaurantsApi } from '../services/api'
import './Pages.css'

/**
 * Home Page
 * 
 * Displays user's own restaurants (tried and wishlist)
 * Allows adding new restaurants
 */
function Home({ user }) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantsApi.getAll()
      setRestaurants(data.restaurants)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRestaurant = async (restaurant) => {
    try {
      const data = await restaurantsApi.create(restaurant)
      setRestaurants([data.restaurant, ...restaurants])
    } catch (error) {
      console.error('Error adding restaurant:', error)
      alert('Failed to add restaurant')
    }
  }

  const updateRating = async (index, newRating) => {
    const restaurant = restaurants[index]
    
    try {
      await restaurantsApi.update(restaurant.id, { rating: newRating })
      
      const updatedRestaurants = [...restaurants]
      updatedRestaurants[index].rating = newRating
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error updating rating:', error)
      alert('Failed to update rating')
    }
  }

  const deleteRestaurant = async (index) => {
    const restaurant = restaurants[index]
    
    try {
      await restaurantsApi.delete(restaurant.id)
      
      const updatedRestaurants = restaurants.filter((_, i) => i !== index)
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert('Failed to delete restaurant')
    }
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
        <h1>My Restaurants</h1>
        <p>Add and manage your favorite restaurants</p>
      </div>

      <AddRestaurantForm onAddRestaurant={addRestaurant} />
      <RestaurantList 
        restaurants={restaurants} 
        onUpdateRating={updateRating}
        onDeleteRestaurant={deleteRestaurant}
        viewMode="my"
      />
    </div>
  )
}

export default Home