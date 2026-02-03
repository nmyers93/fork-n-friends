/**
 * API Service
 * 
 * Handles all HTTP requests to the Node.js backend
 * Automatically includes JWT token in authenticated requests
 */

// Use production URL if available, otherwise localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Set authentication token in localStorage
 */
const setToken = (token) => {
  localStorage.setItem('token', token)
}

/**
 * Remove authentication token from localStorage
 */
const removeToken = () => {
  localStorage.removeItem('token')
}

/**
 * Make an authenticated request
 */
const authRequest = async (url, options = {}) => {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  
  return data
}

// ==================== AUTH API ====================

export const auth = {
  /**
   * Sign up a new user
   */
  signup: async (username, email, password) => {
    const data = await authRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
    
    if (data.token) {
      setToken(data.token)
    }
    
    return data
  },

  /**
   * Log in existing user
   */
  login: async (email, password) => {
    const data = await authRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (data.token) {
      setToken(data.token)
    }
    
    return data
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    return await authRequest('/auth/me')
  },

  /**
   * Log out user
   */
  logout: () => {
    removeToken()
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!getToken()
  }
}

// ==================== RESTAURANTS API ====================

export const restaurants = {
  /**
   * Get all user's restaurants
   */
  getAll: async () => {
    return await authRequest('/restaurants')
  },

  /**
   * Get single restaurant by ID
   */
  getOne: async (id) => {
    return await authRequest(`/restaurants/${id}`)
  },

  /**
   * Create new restaurant
   */
  create: async (restaurantData) => {
    return await authRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    })
  },

  /**
   * Update restaurant
   */
  update: async (id, restaurantData) => {
    return await authRequest(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(restaurantData),
    })
  },

  /**
   * Delete restaurant
   */
  delete: async (id) => {
    return await authRequest(`/restaurants/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get friends' restaurants
   */
  getFriendsRestaurants: async () => {
    return await authRequest('/restaurants/friends')
  }
}

// ==================== FRIENDS API ====================

export const friends = {
  /**
   * Search for users by username
   */
  search: async (query) => {
    return await authRequest(`/friends/search?query=${encodeURIComponent(query)}`)
  },

  /**
   * Get all friends
   */
  getAll: async () => {
    return await authRequest('/friends')
  },

  /**
   * Get pending friend requests
   */
  getPendingRequests: async () => {
    return await authRequest('/friends/requests')
  },

  /**
   * Send friend request
   */
  sendRequest: async (friendId) => {
    return await authRequest('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    })
  },

  /**
   * Accept friend request
   */
  acceptRequest: async (requestId) => {
    return await authRequest(`/friends/accept/${requestId}`, {
      method: 'PUT',
    })
  },

  /**
   * Decline friend request
   */
  declineRequest: async (requestId) => {
    return await authRequest(`/friends/decline/${requestId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Unfriend user
   */
  unfriend: async (friendshipId) => {
    return await authRequest(`/friends/${friendshipId}`, {
      method: 'DELETE',
    })
  }
}

// ==================== FOURSQUARE API ====================

export const foursquare = {
  /**
   * Search for restaurants via backend proxy
   */
  search: async (query, location = 'Chicago') => {
    const data = await authRequest(`/foursquare/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
    return data.results || []
  }
}

// ==================== GROUPS API ====================

export const groups = {
  /**
   * Create a new group
   */
  create: async (name) => {
    return await authRequest('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  /**
   * Get all user's groups
   */
  getAll: async () => {
    return await authRequest('/groups')
  },

  /**
   * Get pending group invites
   */
  getInvites: async () => {
    return await authRequest('/groups/invites')
  },

  /**
   * Get single group with members and restaurants
   */
  getOne: async (id) => {
    return await authRequest(`/groups/${id}`)
  },

  /**
   * Update group name
   */
  update: async (id, name) => {
    return await authRequest(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  /**
   * Delete a group
   */
  delete: async (id) => {
    return await authRequest(`/groups/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Send invite to a user
   */
  sendInvite: async (groupId, userId) => {
    return await authRequest(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  },

  /**
   * Accept a group invite
   */
  acceptInvite: async (groupId) => {
    return await authRequest(`/groups/${groupId}/members/accept`, {
      method: 'PUT',
    })
  },

  /**
   * Decline a group invite
   */
  declineInvite: async (groupId) => {
    return await authRequest(`/groups/${groupId}/members/decline`, {
      method: 'PUT',
    })
  },

  /**
   * Remove a member from a group
   */
  removeMember: async (groupId, memberId) => {
    return await authRequest(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Update member permissions
   */
  updateMemberPermissions: async (groupId, memberId, canEdit) => {
    return await authRequest(`/groups/${groupId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ can_edit: canEdit }),
    })
  },

  /**
   * Add restaurant to group
   */
  addRestaurant: async (groupId, restaurant) => {
    return await authRequest(`/groups/${groupId}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(restaurant),
    })
  },

  /**
   * Remove restaurant from group
   */
  removeRestaurant: async (groupId, restaurantId) => {
    return await authRequest(`/groups/${groupId}/restaurants/${restaurantId}`, {
      method: 'DELETE',
    })
  },
}

export default {
  auth,
  restaurants,
  friends,
  foursquare,
  groups
}