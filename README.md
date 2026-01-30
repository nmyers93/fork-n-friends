# 🍴 Fork n' Friends

A full-stack social restaurant rating app where you and your friends can save favorites, compare restaurants, and randomly decide where to eat.

## Features

### Current Features ✅

#### User Management
- **User Authentication** - JWT-based authentication with secure password hashing
- **Custom Usernames** - Choose your own display name during signup
- **Session Management** - Persistent login with token-based auth

#### Restaurant Management
- **Search Integration** - Search for restaurants via Foursquare Places API
- **Manual Entry** - Add restaurants manually with name, cuisine, and location
- **Auto-populate** - Click search results to auto-fill restaurant details
- **Star Ratings** - 5-star rating system for each restaurant (0-5 stars)
- **Wishlist vs Tried** - Separate restaurants into "Tried" and "Wishlist" categories
- **Delete Restaurants** - Remove restaurants from your lists
- **Data Persistence** - All data stored in PostgreSQL database

#### Social Features
- **Friend System** - Search for users and send friend requests
- **Friend Requests** - Accept or decline pending friend requests
- **Friends List** - View all your accepted friends
- **View Friends' Restaurants** - Browse non-hidden restaurants from your friends
- **Grouped Display** - Friends' restaurants displayed grouped by friend
- **Privacy Controls** - Mark restaurants as hidden from friends
- **Bidirectional Unfriend** - Properly removes friendship from both sides

#### Form & Validation
- **Form Validation** - Ensures all required fields are filled before submission
- **Error Messages** - Clear feedback for validation errors
- **Search on Enter** - Press Enter key to search without clicking button

### Planned Features 🚧
- Random restaurant picker for decision-making
- Group/collaborative restaurant lists
- Toggle restaurants between wishlist and tried
- Filter and sort restaurants by cuisine or rating
- Restaurant notes and reviews
- Email notifications
- Password reset functionality

## Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **Vite** - Fast build tool and dev server
- **Custom CSS** - Responsive design with flexbox/grid

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### External APIs
- **Foursquare Places API** - Restaurant search and data

## Architecture

This is a **monorepo** containing both frontend and backend:
```
fork-n-friends/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── server/              # Node.js backend
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── config/          # Database config
│   └── package.json
│
└── README.md
```

## Database Schema

### Tables

**users**
- Stores user accounts with hashed passwords
- Used for authentication and profile info

**restaurants**
- Restaurant data with ratings and metadata
- Foreign key to users (owner_id)
- Boolean flags for wishlist and hidden status
- Optional foreign key to groups for collaborative lists

**friendships**
- Friend connections between users
- Status field for pending/accepted/declined requests
- Bidirectional relationships (both users have records)

**groups** *(structure in place, feature not yet implemented)*
- Collaborative restaurant lists
- Created by a user, can have multiple members

**group_members** *(structure in place, feature not yet implemented)*
- Tracks group membership
- Permissions for editing group restaurants

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **PostgreSQL** (v14 or higher)
- **Foursquare API key** (free tier available)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/nmyers93/fork-n-friends.git
cd fork-n-friends
```

#### 2. Set up the database

**Install PostgreSQL** (if not already installed):
- **Mac:** `brew install postgresql@14`
- **Windows:** Download from https://www.postgresql.org/download/windows/
- **Linux:** `sudo apt-get install postgresql`

**Create database and user:**
```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fork_n_friends;

# Create user
CREATE USER fork_user WITH PASSWORD 'your_password_here';

# Connect to database
\c fork_n_friends

# Grant permissions
GRANT ALL ON SCHEMA public TO fork_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fork_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fork_user;

# Exit
\q
```

**Run database schema:**
```bash
psql -U fork_user -d fork_n_friends -f server/db-setup.sql
```

#### 3. Set up the backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://fork_user:your_password_here@localhost:5432/fork_n_friends
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Generate a strong random string for `JWT_SECRET`.

**Start the backend:**
```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

#### 4. Set up the frontend
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_FOURSQUARE_API_KEY=your_foursquare_api_key
```

**Get a Foursquare API key:**
1. Go to https://location.foursquare.com/developer/
2. Create an account and new app
3. Copy your API key

**Configure Vite proxy** (already set up in `vite.config.js`):
- Proxies `/places` requests to Foursquare API
- Avoids CORS issues in development

**Start the frontend:**
```bash
npm run dev
```

Frontend should open at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Restaurants
- `GET /api/restaurants` - Get user's restaurants (protected)
- `GET /api/restaurants/friends` - Get friends' restaurants (protected)
- `GET /api/restaurants/:id` - Get single restaurant (protected)
- `POST /api/restaurants` - Create restaurant (protected)
- `PUT /api/restaurants/:id` - Update restaurant (protected)
- `DELETE /api/restaurants/:id` - Delete restaurant (protected)

### Friends
- `GET /api/friends/search` - Search users by username (protected)
- `GET /api/friends` - Get all friends (protected)
- `GET /api/friends/requests` - Get pending requests (protected)
- `POST /api/friends/request` - Send friend request (protected)
- `PUT /api/friends/accept/:id` - Accept friend request (protected)
- `DELETE /api/friends/decline/:id` - Decline friend request (protected)
- `DELETE /api/friends/:id` - Unfriend user (protected)

All protected routes require `Authorization: Bearer <token>` header.

## Development

### Project Structure

**Frontend (`client/`):**
- `components/` - Reusable React components
- `services/api.js` - API service layer with auth token management
- `utils/foursquare.js` - Foursquare API integration

**Backend (`server/`):**
- `controllers/` - Business logic and request handlers
- `routes/` - Express route definitions
- `middleware/auth.js` - JWT authentication middleware
- `config/db.js` - PostgreSQL connection pool

### Development Principles
- **MVC Architecture** - Separation of concerns
- **RESTful API Design** - Standard HTTP methods and status codes
- **JWT Authentication** - Stateless, token-based auth
- **Secure Password Storage** - bcrypt hashing with salt
- **Component-based Frontend** - Reusable, maintainable React components
- **Centralized API Layer** - Single source for all backend calls
- **Error Handling** - Comprehensive try-catch with user feedback
- **Database Relationships** - Proper foreign keys and cascading deletes

### Security Features
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected routes require authentication
- Users can only modify their own data
- SQL injection prevention via parameterized queries

## Contributing

This is a personal learning project, but feedback and suggestions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT

## Acknowledgments

- Foursquare Places API for restaurant data
- Express.js and Node.js communities
- React community for excellent documentation
- PostgreSQL for robust database management