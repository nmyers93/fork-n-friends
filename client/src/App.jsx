import { useState, useEffect } from 'react'
import './App.css'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantList from './components/RestaurantList'
import Auth from './components/Auth'
import Friends from './components/Friends'
import { auth, restaurants as restaurantsApi } from './services/api'

function App() {
  // State management
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [viewMode, setViewMode] = useState('my')

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const data = await auth.getMe()
          setUser(data.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          auth.logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Fetch restaurants when user logs in or view mode changes
   */
  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user, viewMode])

  /**
   * Fetch restaurants based on view mode
   */
  const fetchRestaurants = async () => {
    try {
      if (viewMode === 'my') {
        const data = await restaurantsApi.getAll()
        setRestaurants(data.restaurants)
      } else {
        const data = await restaurantsApi.getFriendsRestaurants()
        // Format friends' restaurants to include owner info in profiles object
        const formattedRestaurants = data.restaurants.map(r => ({
          ...r,
          profiles: { username: r.owner_username }
        }))
        setRestaurants(formattedRestaurants)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  /**
   * Add a new restaurant
   */
  const addRestaurant = async (restaurant) => {
    try {
      const data = await restaurantsApi.create(restaurant)
      
      if (viewMode === 'my') {
        setRestaurants([data.restaurant, ...restaurants])
      }
    } catch (error) {
      console.error('Error adding restaurant:', error)
      alert('Failed to add restaurant')
    }
  }

  /**
   * Update restaurant rating
   */
  const updateRating = async (index, newRating) => {
    const restaurant = restaurants[index]
    
    // Only allow updating own restaurants
    if (restaurant.owner_id !== user.id) {
      alert("You can only rate your own restaurants!")
      return
    }
    
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

  /**
   * Delete restaurant
   */
  const deleteRestaurant = async (index) => {
    const restaurant = restaurants[index]
    
    // Only allow deleting own restaurants
    if (restaurant.owner_id !== user.id) {
      alert("You can only delete your own restaurants!")
      return
    }
    
    try {
      await restaurantsApi.delete(restaurant.id)
      
      const updatedRestaurants = restaurants.filter((_, i) => i !== index)
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert('Failed to delete restaurant')
    }
  }

  /**
   * Sign out user
   */
  const handleSignOut = () => {
    auth.logout()
    setUser(null)
    setRestaurants([])
  }

  // Show loading state
  if (loading) {
    return <div className="app"><p>Loading...</p></div>
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="app">
        <header>
          <h1>🍴 Fork n' Friends</h1>
          <p>Decide where to eat with your friends</p>
        </header>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    )
  }

  // Main app for logged-in users
  return (
    <div className="app">
      <header>
        <div className="user-menu">
          <div className="user-info">
            Logged in as <strong>{user.username}</strong>
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
        <h1>🍴 Fork n' Friends</h1>
        <p>Decide where to eat with your friends</p>
      </header>
      
      <Friends userId={user.id} />

      <div className="view-toggle">
        <button 
          className={viewMode === 'my' ? 'active' : ''}
          onClick={() => setViewMode('my')}
        >
          My Restaurants
        </button>
        <button 
          className={viewMode === 'friends' ? 'active' : ''}
          onClick={() => setViewMode('friends')}
        >
          Friends' Restaurants
        </button>
      </div>

      {viewMode === 'my' && <AddRestaurantForm onAddRestaurant={addRestaurant} />}
      
      <RestaurantList 
        restaurants={restaurants} 
        onUpdateRating={updateRating}
        onDeleteRestaurant={deleteRestaurant}
        viewMode={viewMode}
      />
    </div>
  )
}

export default App