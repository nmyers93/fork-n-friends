import { useState, useEffect } from 'react'
import './App.css'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantList from './components/RestaurantList'
import Auth from './components/Auth'
import Friends from './components/Friends'
import { supabase } from './utils/supabaseClient'

function App() {
  // State management
  const [restaurants, setRestaurants] = useState([]) // Array of restaurant objects
  const [loading, setLoading] = useState(true) // Initial loading state
  const [user, setUser] = useState(null) // Currently logged-in user
  const [username, setUsername] = useState('') // User's display name
  const [viewMode, setViewMode] = useState('my') // Toggle between 'my' and 'friends' restaurants

  /**
   * Check authentication state on mount and listen for auth changes
   * This runs once when the component mounts
   */
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  /**
   * Fetch user data when user logs in or view mode changes
   * Dependencies: user and viewMode
   */
  useEffect(() => {
    if (user) {
      fetchUsername()
      fetchRestaurants()
    }
  }, [user, viewMode])

  /**
   * Fetch the current user's username from the profiles table
   */
  const fetchUsername = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      
      setUsername(data.username)
    } catch (error) {
      console.error('Error fetching username:', error)
    }
  }

  /**
   * Fetch restaurants based on current view mode
   * - 'my': Fetches user's own restaurants
   * - 'friends': Fetches non-hidden restaurants from accepted friends
   */
  const fetchRestaurants = async () => {
    try {
      if (viewMode === 'my') {
        // Fetch user's own restaurants
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setRestaurants(data || [])
      } else {
        // First, get list of friends
        const { data: friendsData, error: friendsError } = await supabase
          .from('friendships')
          .select('friend_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
        
        if (friendsError) throw friendsError
        
        const friendIds = friendsData.map(f => f.friend_id)
        
        // If no friends, show empty list
        if (friendIds.length === 0) {
          setRestaurants([])
          return
        }

        // Fetch friends' non-hidden restaurants with owner info
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            *,
            profiles:owner_id (username)
          `)
          .in('owner_id', friendIds)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setRestaurants(data || [])
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  /**
   * Add a new restaurant to the database
   * Only adds to local state if currently viewing "my" restaurants
   * @param {Object} restaurant - Restaurant object with name, cuisine, location, rating, is_wishlist
   */
  const addRestaurant = async (restaurant) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([{
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.location,
          rating: restaurant.rating,
          is_wishlist: restaurant.is_wishlist,
          is_hidden: false,
          owner_id: user.id
        }])
        .select()
      
      if (error) throw error
      
      // Only update local state if viewing own restaurants
      if (data && viewMode === 'my') {
        setRestaurants([data[0], ...restaurants])
      }
    } catch (error) {
      console.error('Error adding restaurant:', error)
    }
  }

  /**
   * Update the rating of a restaurant
   * Users can only rate their own restaurants
   * @param {number} index - Index of restaurant in the restaurants array
   * @param {number} newRating - New rating value (0-5)
   */
  const updateRating = async (index, newRating) => {
    const restaurant = restaurants[index]
    
    // Prevent rating friends' restaurants
    if (restaurant.owner_id !== user.id) {
      alert("You can only rate your own restaurants!")
      return
    }
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ rating: newRating })
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      // Update local state
      const updatedRestaurants = [...restaurants]
      updatedRestaurants[index].rating = newRating
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  /**
   * Delete a restaurant from the database
   * Users can only delete their own restaurants
   * @param {number} index - Index of restaurant in the restaurants array
   */
  const deleteRestaurant = async (index) => {
    const restaurant = restaurants[index]
    
    // Prevent deleting friends' restaurants
    if (restaurant.owner_id !== user.id) {
      alert("You can only delete your own restaurants!")
      return
    }
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      // Update local state
      const updatedRestaurants = restaurants.filter((_, i) => i !== index)
      setRestaurants(updatedRestaurants)
    } catch (error) {
      console.error('Error deleting restaurant:', error)
    }
  }

  /**
   * Sign out the current user and clear all state
   */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setRestaurants([])
    setUsername('')
  }

  // Show loading indicator while checking auth state
  if (loading) {
    return <div className="app"><p>Loading...</p></div>
  }

  // Show authentication form if user is not logged in
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

  // Main app interface for logged-in users
  return (
    <div className="app">
      <header>
        {/* User info and sign out button */}
        <div className="user-menu">
          <div className="user-info">
            Logged in as <strong>{username || user.email}</strong>
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
        <h1>🍴 Fork n' Friends</h1>
        <p>Decide where to eat with your friends</p>
      </header>
      
      {/* Friends management section */}
      <Friends userId={user.id} />

      {/* Toggle between viewing own vs friends' restaurants */}
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

      {/* Only show add form when viewing own restaurants */}
      {viewMode === 'my' && <AddRestaurantForm onAddRestaurant={addRestaurant} />}
      
      {/* Restaurant list with ratings and delete functionality */}
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