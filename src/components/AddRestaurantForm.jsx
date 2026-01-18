import { useState } from 'react'
import './addRestaurantForm.css'

function AddRestaurantForm({ onAddRestaurant }) {
    const [restaurantName, setRestaurantName] = useState('')
    const [cuisine, setCuisine] = useState('')
    const [location, setLocation] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        
        const newRestaurant = {
            name: restaurantName,
            cuisine: cuisine,
            location: location
        }

        onAddRestaurant(newRestaurant)

        // Clear the form
        setRestaurantName('')
        setCuisine('')
        setLocation('')
    }

    return (
        <div className="add-restaurant-form">
            <h2>Add a Restaurant</h2>

            <form onSubmit={(handleSubmit)}>
            <input 
                type="text"
                placeholder="Restaurant name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
            />

            <input 
                type="text"
                placeholder="Cuisine type (e.g., Italian, Mexican)"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
            />

            <input 
                type="text"
                placeholder="Location/Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <button type="submit">Add Restaurant</button>
            </form>
        </div>
    )
}

export default AddRestaurantForm