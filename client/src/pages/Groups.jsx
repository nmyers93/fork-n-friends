import { useState, useEffect } from 'react'
import { groups as groupsApi, friends as friendsApi } from '../services/api'
import AddRestaurantForm from '../components/AddRestaurantForm'
import StarRating from '../components/StarRating'
import './Pages.css'

/**
 * Groups Page
 * 
 * Create and manage collaborative restaurant lists
 * Features:
 * - Create/delete groups
 * - Add/remove members (search from friends)
 * - Add/remove restaurants
 * - Toggle member edit permissions
 */
function Groups({ user }) {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupDetail, setGroupDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState('')
  const [friends, setFriends] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchFriends()
  }, [])

  // Fetch group detail when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetail(selectedGroup.id)
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      const data = await groupsApi.getAll()
      setGroups(data.groups)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const data = await friendsApi.getAll()
      setFriends(data.friends)
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchGroupDetail = async (groupId) => {
    try {
      const data = await groupsApi.getOne(groupId)
      setGroupDetail(data)
    } catch (error) {
      console.error('Error fetching group detail:', error)
    }
  }

  // Create a new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    try {
      await groupsApi.create(newGroupName)
      setNewGroupName('')
      fetchGroups()
    } catch (error) {
      console.error('Error creating group:', error)
      alert(error.message || 'Failed to create group')
    }
  }

  // Delete a group
  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This will remove all its restaurants.')) return

    try {
      await groupsApi.delete(groupId)
      setSelectedGroup(null)
      setGroupDetail(null)
      fetchGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      alert(error.message || 'Failed to delete group')
    }
  }

  // Add a member to the group
  const handleAddMember = async (friendId) => {
    try {
      await groupsApi.addMember(selectedGroup.id, friendId)
      setShowAddMember(false)
      fetchGroupDetail(selectedGroup.id)
    } catch (error) {
      console.error('Error adding member:', error)
      alert(error.message || 'Failed to add member')
    }
  }

  // Remove a member from the group
  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await groupsApi.removeMember(selectedGroup.id, memberId)
      fetchGroupDetail(selectedGroup.id)
    } catch (error) {
      console.error('Error removing member:', error)
      alert(error.message || 'Failed to remove member')
    }
  }

  // Toggle edit permissions for a member
  const handleTogglePermissions = async (memberId, currentCanEdit) => {
    try {
      await groupsApi.updateMemberPermissions(selectedGroup.id, memberId, !currentCanEdit)
      fetchGroupDetail(selectedGroup.id)
    } catch (error) {
      console.error('Error updating permissions:', error)
      alert(error.message || 'Failed to update permissions')
    }
  }

  // Add a restaurant to the group
  const handleAddRestaurant = async (restaurant) => {
    try {
      await groupsApi.addRestaurant(selectedGroup.id, restaurant)
      setShowAddRestaurant(false)
      fetchGroupDetail(selectedGroup.id)
    } catch (error) {
      console.error('Error adding restaurant:', error)
      alert(error.message || 'Failed to add restaurant')
    }
  }

  // Remove a restaurant from the group
  const handleRemoveRestaurant = async (restaurantId) => {
    if (!confirm('Are you sure you want to remove this restaurant?')) return

    try {
      await groupsApi.removeRestaurant(selectedGroup.id, restaurantId)
      fetchGroupDetail(selectedGroup.id)
    } catch (error) {
      console.error('Error removing restaurant:', error)
      alert(error.message || 'Failed to remove restaurant')
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    )
  }

  // Group detail view
  if (selectedGroup && groupDetail) {
    const isCreator = selectedGroup.created_by === user.id
    const currentMember = groupDetail.members.find(m => m.user_id === user.id)
    const canEdit = currentMember?.can_edit

    // Filter out friends already in the group for "add member" list
    const availableFriends = friends.filter(
      f => !groupDetail.members.find(m => m.user_id === f.friend_id)
    )

    return (
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => { setSelectedGroup(null); setGroupDetail(null) }}>
            ← Back to Groups
          </button>
          <div className="group-header-row">
            <h1>{groupDetail.group.name}</h1>
            {isCreator && (
              <button className="delete-btn" onClick={() => handleDeleteGroup(selectedGroup.id)}>
                Delete Group
              </button>
            )}
          </div>
          <p>Created by @{groupDetail.group.creator_username}</p>
        </div>

        {/* Members section */}
        <div className="group-section">
          <div className="group-section-header">
            <h2>👥 Members ({groupDetail.members.length})</h2>
            {isCreator && availableFriends.length > 0 && (
              <button className="add-btn" onClick={() => setShowAddMember(!showAddMember)}>
                {showAddMember ? 'Cancel' : '+ Add Member'}
              </button>
            )}
          </div>

          {/* Add member dropdown */}
          {showAddMember && (
            <div className="add-member-list">
              <h3>Select a friend:</h3>
              {availableFriends.length === 0 ? (
                <p className="empty-message">No friends available to add</p>
              ) : (
                availableFriends.map((friend) => (
                  <div key={friend.friend_id} className="member-item">
                    <span><strong>{friend.username}</strong></span>
                    <button className="add-btn" onClick={() => handleAddMember(friend.friend_id)}>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Members list */}
          <div className="members-list">
            {groupDetail.members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <strong>{member.username}</strong>
                  {member.user_id === selectedGroup.created_by && (
                    <span className="creator-badge">Creator</span>
                  )}
                </div>
                {isCreator && member.user_id !== user.id && (
                  <div className="member-actions">
                    <button
                      className={member.can_edit ? 'permission-btn active' : 'permission-btn'}
                      onClick={() => handleTogglePermissions(member.id, member.can_edit)}
                    >
                      {member.can_edit ? 'Can Edit' : 'View Only'}
                    </button>
                    <button className="remove-btn" onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Restaurants section */}
        <div className="group-section">
          <div className="group-section-header">
            <h2>🍽️ Restaurants ({groupDetail.restaurants.length})</h2>
            {canEdit && (
              <button className="add-btn" onClick={() => setShowAddRestaurant(!showAddRestaurant)}>
                {showAddRestaurant ? 'Cancel' : '+ Add Restaurant'}
              </button>
            )}
          </div>

          {/* Add restaurant form */}
          {showAddRestaurant && (
            <AddRestaurantForm onAddRestaurant={handleAddRestaurant} />
          )}

          {/* Restaurants list */}
          {groupDetail.restaurants.length === 0 ? (
            <div className="empty-state">
              <p>{canEdit ? 'No restaurants yet. Add one above!' : 'No restaurants in this group yet.'}</p>
            </div>
          ) : (
            <div className="group-restaurants">
              {groupDetail.restaurants.map((restaurant) => (
                <div key={restaurant.id} className="group-restaurant-item">
                  <div className="restaurant-info">
                    <div>
                      <strong>{restaurant.name}</strong> - {restaurant.cuisine}
                      <p className="restaurant-location">{restaurant.location}</p>
                      <span className="owner-tag">Added by @{restaurant.owner_username}</span>
                    </div>
                    <StarRating rating={restaurant.rating} onRatingChange={() => {}} />
                  </div>
                  {canEdit && (
                    <button className="delete-btn" onClick={() => handleRemoveRestaurant(restaurant.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main groups list view
  return (
    <div className="page">
      <div className="page-header">
        <h1>Groups</h1>
        <p>Collaborative restaurant lists with friends</p>
      </div>

      {/* Create group form */}
      <div className="create-group-form">
        <h2>Create a New Group</h2>
        <div className="create-group-inputs">
          <input
            type="text"
            placeholder="Group name (e.g., Weekend Crew)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateGroup()
              }
            }}
          />
          <button className="add-btn" onClick={handleCreateGroup}>Create</button>
        </div>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="empty-state">
          <p>No groups yet. Create one above to start sharing restaurants with friends!</p>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="group-card" 
              onClick={() => setSelectedGroup(group)}
            >
              <div className="group-card-info">
                <h3>{group.name}</h3>
                <p>Created by @{group.creator_username}</p>
              </div>
              <div className="group-card-stats">
                <span>👥 {group.member_count} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Groups