import { useState, useEffect } from 'react'
import './App.css'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantList from './components/RestaurantList'
import Auth from './components/Auth'
import { supabase } from './utils/supabaseClient'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load restaurants when user logs in
  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
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
          owner_id: user.id
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setRestaurants([])
  }

  if (loading) {
    return <div className="app"><p>Loading...</p></div>
  }

  if (!user) {
    return (
      <div className="app">
        <header>
          <h1>🍴 Fork n' Friends</h1>
          <p>Decide where to eat with your friends</p>
        </header>
        <Auth />
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>🍴 Fork n' Friends</h1>
        <p>Decide where to eat with your friends</p>
        <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
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