# 🍴 Fork n' Friends

A full-stack social restaurant rating app where you and your friends can save favorites, compare restaurants, and randomly decide where to eat together.

## 🌐 Live Demo

**Try it now:** [https://fork-n-friends.vercel.app](https://fork-n-friends.vercel.app)

The application is fully deployed and accessible on the web!
- Frontend hosted on Vercel
- Backend API hosted on Railway
- PostgreSQL database on Railway

---

## Features

### Current Features ✅

#### User Management
- **User Authentication** - JWT-based authentication with secure password hashing
- **Custom Usernames** - Choose your own display name during signup
- **Session Management** - Persistent login with token-based auth
- **User Profiles** - View account information and member since date

#### Restaurant Management
- **Search Integration** - Search for restaurants via Foursquare Places API with custom location
- **Manual Entry** - Add restaurants manually with name, cuisine, and location
- **Auto-populate** - Click search results to auto-fill restaurant details
- **Star Ratings** - Interactive 5-star rating system for each restaurant (0-5 stars)
- **Wishlist vs Tried** - Separate restaurants into "Tried" and "Wishlist" categories
- **Collapsible Lists** - Organized, collapsible sections for better UI
- **Delete Restaurants** - Remove restaurants from your lists
- **Data Persistence** - All data stored in PostgreSQL database

#### Social Features
- **Friend System** - Search for users by username and send friend requests
- **Friend Requests** - Accept or decline pending friend requests with notifications
- **Friends List** - View all your accepted friends
- **View Friends' Restaurants** - Browse non-hidden restaurants from your friends
- **Grouped Display** - Friends' restaurants displayed grouped by friend
- **Privacy Controls** - Mark restaurants as hidden from friends
- **Bidirectional Unfriend** - Properly removes friendship from both sides

#### Collaborative Groups
- **Create Groups** - Make collaborative restaurant lists with friends
- **Invite System** - Send group invites that friends must accept (similar to friend requests)
- **Pending Invites** - View and respond to group invitations
- **Member Management** - Add/remove members from groups (creator only)
- **Permission System** - Toggle edit permissions for group members (view-only vs can-edit)
- **Group Restaurants** - Add, rate, and manage restaurants within groups
- **Import Feature** - Bulk import restaurants from your personal list into groups
  - Select from Tried, Wishlist, or custom selection with checkboxes
  - Select All / Deselect All functionality
  - Prevents duplicate imports
- **Collaborative Ratings** - All group members can rate group restaurants

#### Random Picker 🎲
- **Smart Selection** - Pick a random restaurant to help decide where to eat
- **Multiple Filters** - Choose from All, Tried, Wishlist, or Custom selection
- **Custom Selection** - Use checkboxes to create a custom pool of restaurants
- **Slot Machine Animation** - Fun animated picker with smooth transitions
- **Celebration** - Confetti effect when a restaurant is selected
- **Available Everywhere** - Works on both personal restaurants and group restaurants

#### Form & Validation
- **Form Validation** - Ensures all required fields are filled before submission
- **Error Messages** - Clear feedback for validation errors
- **Search on Enter** - Press Enter key to search without clicking button
- **Location-based Search** - Specify city/location for restaurant searches

#### Navigation & UI
- **Sidebar Navigation** - Clean, professional sidebar with page links
- **Responsive Design** - Mobile-friendly with collapsible sidebar
- **Active Links** - Visual feedback for current page
- **Collapsible Sections** - Cleaner interface with expandable/collapsible content
- **Smooth Animations** - Polished transitions and loading states

### Planned Features 🚧
- Toggle restaurants between wishlist and tried
- Filter and sort restaurants by cuisine or rating
- Restaurant notes and reviews with photos
- Email notifications for friend requests and group invites
- Password reset functionality
- User location detection for automatic search defaults
- Restaurant recommendations based on preferences
- Export restaurant lists
- Share individual restaurants with friends

## Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Custom CSS** - Responsive design with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing with salt

### External APIs
- **Foursquare Places API** - Restaurant search and data

### Deployment
- **Vercel** - Frontend hosting with automatic deployments and SPA rewrites
- **Railway** - Backend API and PostgreSQL database hosting
- **GitHub** - Source control with CI/CD integration

## Architecture

This is a **monorepo** containing both frontend and backend:
```
fork-n-friends/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components (Sidebar, Friends, RandomPicker, etc.)
│   │   ├── pages/       # Page components (Home, Friends, Explore, Groups, Profile)
│   │   ├── services/    # API service layer
│   │   └── utils/       # Utility functions
│   ├── vercel.json      # Vercel SPA routing config
│   └── package.json
│
├── server/              # Node.js backend
│   ├── controllers/     # Request handlers (auth, restaurants, friends, groups)
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── config/          # Database config
│   ├── db-setup.sql     # Database schema
│   └── package.json
│
└── README.md
```

## Database Schema

### Tables

**users**
- Stores user accounts with hashed passwords
- Used for authentication and profile info
- Fields: id, username, email, password_hash, created_at

**restaurants**
- Restaurant data with ratings and metadata
- Foreign key to users (owner_id)
- Optional foreign key to groups (group_id) for collaborative lists
- Boolean flags for wishlist and hidden status
- Fields: id, owner_id, group_id, name, cuisine, location, rating, is_wishlist, is_hidden, created_at

**friendships**
- Friend connections between users
- Status field for pending/accepted/declined requests
- Bidirectional relationships (both users have friendship records)
- Fields: id, user_id, friend_id, status, created_at

**groups**
- Collaborative restaurant lists
- Created by a user, can have multiple members
- Fields: id, name, created_by, created_at

**group_members**
- Tracks group membership with invite system
- Permissions for editing group restaurants
- Status field for pending/accepted/declined invites
- Fields: id, group_id, user_id, can_edit, status, joined_at

### Relationships
- Users can have many restaurants (1:many)
- Users can have many friends through friendships (many:many with status)
- Groups belong to one creator but have many members (1:many)
- Groups can have many restaurants (1:many)
- Group members have permissions and invite status

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- Foursquare API key (free tier available)

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
FOURSQUARE_API_KEY=your_foursquare_api_key
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
- `GET /api/restaurants` - Get user's personal restaurants (protected)
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

### Groups
- `POST /api/groups` - Create new group (protected)
- `GET /api/groups` - Get user's groups (protected)
- `GET /api/groups/invites` - Get pending group invites (protected)
- `GET /api/groups/:id` - Get group details with members and restaurants (protected)
- `PUT /api/groups/:id` - Update group name (protected, creator only)
- `DELETE /api/groups/:id` - Delete group (protected, creator only)
- `POST /api/groups/:id/members` - Send group invite (protected, creator only)
- `PUT /api/groups/:id/members/accept` - Accept group invite (protected)
- `PUT /api/groups/:id/members/decline` - Decline group invite (protected)
- `PUT /api/groups/:id/members/:memberId` - Update member permissions (protected, creator only)
- `DELETE /api/groups/:id/members/:memberId` - Remove member (protected, creator only)
- `POST /api/groups/:id/restaurants` - Add restaurant to group (protected, edit permission required)
- `POST /api/groups/:id/restaurants/import` - Bulk import restaurants (protected, edit permission required)
- `PUT /api/groups/:id/restaurants/:restaurantId` - Update restaurant rating (protected, member only)
- `DELETE /api/groups/:id/restaurants/:restaurantId` - Remove restaurant (protected, edit permission required)

### Foursquare
- `GET /api/foursquare/search` - Search restaurants via backend proxy (protected)

All protected routes require `Authorization: Bearer <token>` header.

## Development

### Project Structure

**Frontend (`client/`):**
- `components/` - Reusable React components (Sidebar, Friends, RandomPicker, ImportRestaurants)
- `pages/` - Page-level components (Home, Friends, Explore, Groups, Profile)
- `services/api.js` - Centralized API service with auth token management
- `utils/` - Utility functions and helpers

**Backend (`server/`):**
- `controllers/` - Business logic and request handlers
- `routes/` - Express route definitions
- `middleware/auth.js` - JWT authentication middleware
- `config/db.js` - PostgreSQL connection pool
- `db-setup.sql` - Complete database schema with relationships

### Development Principles
- **MVC Architecture** - Clear separation of concerns
- **RESTful API Design** - Standard HTTP methods and status codes
- **JWT Authentication** - Stateless, token-based auth with 7-day expiration
- **Secure Password Storage** - bcrypt hashing with salt rounds
- **Component-based Frontend** - Reusable, maintainable React components
- **Centralized API Layer** - Single source for all backend calls
- **Comprehensive Error Handling** - Try-catch blocks with user feedback
- **Database Relationships** - Proper foreign keys and cascading deletes
- **Responsive Design** - Mobile-first approach with collapsible navigation

### Security Features
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected routes require authentication
- Users can only modify their own data
- Group creators have admin permissions
- SQL injection prevention via parameterized queries
- CORS configured for specific origins

## Deployment

The application is deployed and accessible at: **[https://fork-n-friends.vercel.app](https://fork-n-friends.vercel.app)**

### Deployment Architecture
- **Frontend (Vercel):** Automatically deploys from `main` branch with SPA rewrites
- **Backend (Railway):** Automatically deploys from `main` branch
- **Database (Railway):** PostgreSQL instance managed by Railway

### Environment Variables Required

**Backend (Railway):**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_secure_random_string
FOURSQUARE_API_KEY=your_foursquare_api_key
PORT=5000
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-railway-backend-url.railway.app/api
VITE_FOURSQUARE_API_KEY=your_foursquare_api_key
```

### Vercel Configuration
The `client/vercel.json` file contains rewrites to handle client-side routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures page refreshes work correctly with React Router.

## Key Features Explained

### Random Picker
The random picker feature uses a slot machine-style animation:
1. User selects filtering criteria (All, Tried, Wishlist, or Custom)
2. For custom selection, checkboxes allow precise control
3. Clicking "Pick" triggers an animated slot machine effect
4. Names cycle rapidly, then slow down before revealing the winner
5. Confetti celebration appears when selection is made
6. Works on both personal lists and group restaurants

### Group Invite System
Groups use a pending/accepted invite flow similar to friend requests:
1. Group creator sends invite to a friend
2. Friend receives notification in pending invites section
3. Friend can accept or decline the invite
4. Upon acceptance, friend becomes an active group member
5. Creator can toggle edit permissions for each member
6. Members with edit permissions can add/remove restaurants and rate them

### Import Feature
Efficiently add existing restaurants to groups:
1. Click "Import" button in any group
2. Modal shows all personal restaurants not already in the group
3. Use filters or checkboxes to select restaurants
4. Select All / Deselect All buttons for convenience
5. Imports create copies (original restaurants remain in personal list)
6. Imported restaurants inherit your ratings and wishlist status

## Contributing

This is a personal learning project built to demonstrate full-stack development skills, but feedback and suggestions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT

## Acknowledgments

- Foursquare Places API for restaurant data
- Railway for seamless backend and database hosting
- Vercel for effortless frontend deployment
- React and Express communities for excellent documentation
- PostgreSQL for robust relational database management