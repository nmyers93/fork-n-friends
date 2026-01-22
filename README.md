# 🍴 Fork n' Friends

A social restaurant rating app where you and your friends can save favorites, compare restaurants, and randomly decide where to eat.

## Features

### Current Features ✅
- **User Authentication** - Secure signup/login with email
- **Add Restaurants** - Search via Foursquare API or manually add restaurants
- **Rate Restaurants** - 5-star rating system for each restaurant
- **Manage Restaurants** - Edit ratings and delete restaurants
- **Data Persistence** - All data stored in Supabase database
- **Form Validation** - Ensures required fields are filled

### Planned Features 🚧
- Random restaurant picker for decision-making
- Wishlist vs Favorites toggle
- Friend system to share restaurants
- Group/collaborative restaurant lists
- Filter and sort restaurants by cuisine or rating

## Tech Stack

- **Frontend:** React + Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API Integration:** Foursquare Places API
- **Styling:** Custom CSS

## Getting Started

### Prerequisites
- Node.js installed
- Supabase account
- Foursquare API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nmyers93/fork-n-friends.git
cd fork-n-friends
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
VITE_FOURSQUARE_API_KEY=your_foursquare_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Database Schema

The app uses the following Supabase tables:
- `profiles` - User information
- `restaurants` - Restaurant data with ratings and metadata
- `friendships` - Friend connections between users
- `groups` - Collaborative restaurant lists
- `group_members` - Group membership and permissions

## Development

This project is being built incrementally as a learning exercise in React and full-stack development. Each feature is carefully implemented and committed to demonstrate organic code growth.

## Contributing

This is a personal learning project, but feedback and suggestions are welcome!

## License

MIT