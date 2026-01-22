import { useState, useEffect } from 'react'
import './App.css'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantList from './components/RestaurantList'
import { supabase } from './utils/supabaseClient'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  // Load restaurants when app starts
  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRestaurant = async (restaurant) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([{
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.location,
          rating: restaurant.rating,
          is_wishlist: false,
          is_hidden: false,
          owner_id: '00000000-0000-0000-0000-000000000000' // Temporary - we'll fix with auth
        }])
        .select()
      
      if (error) throw error
      
      if (data) {
        setRestaurants([data[0], ...restaurants])
      }
    } catch (error) {
      console.error('Error adding restaurant:', error)
    }
  }

  const updateRating = async (index, newRating) => {
    const restaurant = restaurants[index]
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ rating: newRating })
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      const updatedRestaurants = [...restaurants]
      updatedRestaurants[index].rating = newRating
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  const deleteRestaurant = async (index) => {
    const restaurant = restaurants[index]
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      const updatedRestaurants = restaurants.filter((_, i) => i !== index)
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error deleting restaurant:', error)
    }
  }

  if (loading) {
    return <div className="app"><p>Loading...</p></div>
  }

  return (
    <div className="app">
      <header>
        <h1>🍴 Fork n' Friends</h1>
        <p>Decide where to eat with your friends</p>
      </header>
      
      <AddRestaurantForm onAddRestaurant={addRestaurant} />
      <RestaurantList 
        restaurants={restaurants} 
        onUpdateRating={updateRating}
        onDeleteRestaurant={deleteRestaurant}
      />
    </div>
  )
}

export default App