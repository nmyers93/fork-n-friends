import { useState } from 'react'
import './App.css'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantList from './components/RestaurantList'

function App() {

  const [restaurants, setRestaurants] = useState([])

  const addRestaurant = (restaurant) => {
    setRestaurants([...restaurants, restaurant])
    console.log('All restaurants:', [...restaurants, restaurant])
  }

  return (
    <div className="app">
      <header>
        <h1>🍴 Fork n' Friends</h1>
        <p>Decide where to eat with your friends</p>
      </header>

      <AddRestaurantForm onAddRestaurant={addRestaurant} />
      <RestaurantList restaurants={restaurants} />
    </div>
  )
}

export default App
