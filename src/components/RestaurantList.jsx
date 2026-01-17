function RestaurantList({ restaurants }) {
    return (
        <div>
            <h2>My Restaurants</h2>
            {restaurants.length === 0 ? (
                <p>No restaurants yet. Add one above!</p>
            ) : (
                <ul>
                    {restaurants.map((restaurant, index) => (
                        <li key={index}>
                            <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default RestaurantList