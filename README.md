# 🍴 Fork n' Friends

A social restaurant rating app where you and your friends can save favorites, compare restaurants, and randomly decide where to eat.

## Features

### Current Features ✅

#### User Management
- **User Authentication** - Secure signup/login with email and password
- **Custom Usernames** - Choose your own display name during signup
- **Profile Management** - User profiles stored in database

#### Restaurant Management
- **Search Integration** - Search for restaurants via Foursquare Places API
- **Manual Entry** - Add restaurants manually with name, cuisine, and location
- **Auto-populate** - Click search results to auto-fill restaurant details
- **Star Ratings** - 5-star rating system for each restaurant (0-5 stars)
- **Wishlist vs Tried** - Separate restaurants into "Tried" and "Wishlist" categories
- **Delete Restaurants** - Remove restaurants from your lists
- **Data Persistence** - All data stored in Supabase PostgreSQL database

#### Social Features
- **Friend System** - Search for users and send friend requests
- **Friend Requests** - Accept or decline pending friend requests
- **Friends List** - View all your accepted friends
- **View Friends' Restaurants** - Browse non-hidden restaurants from your friends
- **Grouped Display** - Friends' restaurants displayed grouped by friend
- **Privacy Controls** - Mark restaurants as hidden from friends

#### Form & Validation
- **Form Validation** - Ensures all required fields are filled before submission
- **Error Messages** - Clear feedback for validation errors
- **Search on Enter** - Press Enter key to search without clicking button

### Planned Features 🚧
- Random restaurant picker for decision-making
- Group/collaborative restaurant lists
- Toggle restaurants between wishlist and tried
- Filter and sort restaurants by cuisine or rating
- Hide/unhide individual restaurants from friends
- Restaurant notes and reviews

## Tech Stack

- **Frontend:** React 18 + Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API Integration:** Foursquare Places API
- **Styling:** Custom CSS with responsive design
- **State Management:** React Hooks (useState, useEffect)

## Database Schema

### Tables

**profiles**
- Stores user information (username, email)
- Links to Supabase Auth users

**restaurants**
- Restaurant data with ratings and metadata
- Foreign key to profiles (owner_id)
- Boolean flags for wishlist and hidden status
- Optional foreign key to groups for collaborative lists

**friendships**
- Friend connections between users
- Status field for pending/accepted/declined requests
- Bidirectional relationships (both users have friendship records)

**groups** *(structure in place, feature not yet implemented)*
- Collaborative restaurant lists
- Created by a user, can have multiple members

**group_members** *(structure in place, feature not yet implemented)*
- Tracks group membership
- Permissions for editing group restaurants

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Supabase account
- Foursquare API key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/nmyers93/fork-n-friends.git
cd fork-n-friends
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:
```env
VITE_FOURSQUARE_API_KEY=your_foursquare_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database:**

Run the following SQL in your Supabase SQL Editor:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INT2 DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_wishlist BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create groups table (for future collaborative lists)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. **Configure Vite proxy:**

The `vite.config.js` is already configured to proxy Foursquare API requests to avoid CORS issues.

6. **Run the development server:**
```bash
npm run dev
```

7. **Open your browser:**
Navigate to `http://localhost:5173`

## Project Structure
```
fork-n-friends/
├── src/
│   ├── components/
│   │   ├── AddRestaurantForm.jsx    # Form to add restaurants
│   │   ├── AddRestaurantForm.css
│   │   ├── Auth.jsx                  # Login/signup component
│   │   ├── Auth.css
│   │   ├── Friends.jsx               # Friend management
│   │   ├── Friends.css
│   │   ├── RestaurantList.jsx        # Display restaurant lists
│   │   ├── RestaurantList.css
│   │   ├── StarRating.jsx            # Star rating component
│   │   └── StarRating.css
│   ├── utils/
│   │   ├── foursquare.js             # Foursquare API integration
│   │   └── supabaseClient.js         # Supabase client configuration
│   ├── App.jsx                       # Main app component
│   ├── App.css
│   ├── main.jsx                      # App entry point
│   └── index.css                     # Global styles
├── .env                              # Environment variables (not committed)
├── .gitignore
├── package.json
├── vite.config.js                    # Vite configuration with proxy
└── README.md
```

## Key Features Explained

### Authentication Flow
1. New users sign up with email, password, and username
2. Supabase Auth handles password hashing and user creation
3. Database trigger automatically creates profile record
4. Users can log in and remain authenticated across sessions

### Friend System
1. Search for users by username
2. Send friend request (creates pending friendship)
3. Recipient can accept (creates bidirectional friendship) or decline
4. View friends' non-hidden restaurants grouped by friend
5. Users can only rate/delete their own restaurants

### Restaurant Management
1. Search Foursquare API for restaurants by name
2. Click result to auto-populate form fields
3. Choose between "Tried" (rated restaurants) or "Wishlist" (want to try)
4. Restaurants stored with user ownership
5. Can be marked as hidden from friends

## Development

This project is being built incrementally as a learning exercise in React and full-stack development. Each feature is carefully implemented and committed to demonstrate organic code growth and best practices.

### Development Principles
- Component-based architecture
- Clean separation of concerns
- Comprehensive error handling
- User experience focused (loading states, validation, responsive design)
- Database-first design with proper foreign key relationships
- Security conscious (environment variables, user ownership checks)

## Contributing

This is a personal learning project, but feedback and suggestions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT

## Acknowledgments

- Foursquare Places API for restaurant data
- Supabase for backend infrastructure
- React community for excellent documentation