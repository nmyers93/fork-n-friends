import { useState, useEffect } from 'react'
import './RandomPicker.css'

/**
 * RandomPicker Component
 * 
 * Modal for randomly selecting a restaurant with animation
 * 
 * Features:
 * - Filter by Tried, Wishlist, All, or Custom selection
 * - Slot machine animation
 * - Shows winner with celebration
 * 
 * @param {Array} restaurants - Available restaurants to pick from
 * @param {Function} onClose - Callback to close modal
 */
function RandomPicker({ restaurants, onClose }) {
  const [mode, setMode] = useState('all') // 'all', 'tried', 'wishlist', 'custom'
  const [selected, setSelected] = useState(new Set())
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentDisplay, setCurrentDisplay] = useState('')
  const [winner, setWinner] = useState(null)

  const triedRestaurants = restaurants.filter(r => !r.is_wishlist)
  const wishlistRestaurants = restaurants.filter(r => r.is_wishlist)

  // Get restaurants based on current mode
  const getFilteredRestaurants = () => {
    if (mode === 'all') return restaurants
    if (mode === 'tried') return triedRestaurants
    if (mode === 'wishlist') return wishlistRestaurants
    if (mode === 'custom') return restaurants.filter(r => selected.has(r.id))
    return []
  }

  // Toggle individual restaurant selection
  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Select all restaurants
  const selectAll = () => {
    setSelected(new Set(restaurants.map(r => r.id)))
  }

  // Deselect all restaurants
  const deselectAll = () => {
    setSelected(new Set())
  }

  // Run the random picker animation
  const handlePick = () => {
    const eligible = getFilteredRestaurants()
    
    if (eligible.length === 0) {
      alert('No restaurants available to pick from!')
      return
    }

    if (eligible.length === 1) {
      setWinner(eligible[0])
      return
    }

    setIsAnimating(true)
    setWinner(null)

    let iterations = 0
    const maxIterations = 30 // Total animation cycles
    
    const interval = setInterval(() => {
      // Pick a random restaurant to display
      const randomIndex = Math.floor(Math.random() * eligible.length)
      setCurrentDisplay(eligible[randomIndex].name)
      
      iterations++
      
      // Slow down as we approach the end
      if (iterations >= maxIterations) {
        clearInterval(interval)
        // Pick the final winner
        const finalWinner = eligible[Math.floor(Math.random() * eligible.length)]
        setCurrentDisplay(finalWinner.name)
        setTimeout(() => {
          setIsAnimating(false)
          setWinner(finalWinner)
        }, 500)
      }
    }, iterations < 20 ? 50 : 100 + (iterations - 20) * 20) // Speed decreases near end
    
    // Fallback cleanup
    setTimeout(() => {
      clearInterval(interval)
      if (!winner) {
        const finalWinner = eligible[Math.floor(Math.random() * eligible.length)]
        setIsAnimating(false)
        setWinner(finalWinner)
      }
    }, 5000)
  }

  // Reset to try again
  const handleReset = () => {
    setWinner(null)
    setCurrentDisplay('')
  }

  const eligible = getFilteredRestaurants()

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="picker-header">
          <h2>🎲 Random Restaurant Picker</h2>
          <button className="picker-close-btn" onClick={onClose}>✕</button>
        </div>

        {!winner && !isAnimating && (
          <>
            {/* Mode selection */}
            <div className="picker-modes">
              <button
                className={mode === 'all' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('all')}
              >
                All ({restaurants.length})
              </button>
              <button
                className={mode === 'tried' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('tried')}
              >
                Tried ({triedRestaurants.length})
              </button>
              <button
                className={mode === 'wishlist' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('wishlist')}
              >
                Wishlist ({wishlistRestaurants.length})
              </button>
              <button
                className={mode === 'custom' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('custom')}
              >
                Custom ({selected.size})
              </button>
            </div>

            {/* Custom selection list */}
            {mode === 'custom' && (
              <div className="picker-custom">
                <div className="picker-custom-controls">
                  <button className="picker-select-btn" onClick={selectAll}>
                    Select All
                  </button>
                  <button className="picker-select-btn" onClick={deselectAll}>
                    Deselect All
                  </button>
                </div>
                <div className="picker-list">
                  {restaurants.map(restaurant => (
                    <label key={restaurant.id} className="picker-item">
                      <input
                        type="checkbox"
                        checked={selected.has(restaurant.id)}
                        onChange={() => toggleSelect(restaurant.id)}
                      />
                      <span>{restaurant.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pick button */}
            <div className="picker-footer">
              <button
                className="picker-pick-btn"
                onClick={handlePick}
                disabled={eligible.length === 0}
              >
                {eligible.length === 0 ? 'No restaurants available' : `Pick from ${eligible.length} restaurant${eligible.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}

        {/* Animation display */}
        {isAnimating && (
          <div className="picker-animation">
            <div className="picker-slot-machine">
              <div className="picker-spinning-text">{currentDisplay}</div>
            </div>
            <p className="picker-status">🎰 Picking...</p>
          </div>
        )}

        {/* Winner display */}
        {winner && (
          <div className="picker-winner">
            <div className="picker-confetti">🎉</div>
            <h3>🎊 We're going to...</h3>
            <div className="picker-winner-card">
              <h2>{winner.name}</h2>
              <p>{winner.cuisine}</p>
              <p className="picker-winner-location">{winner.location}</p>
            </div>
            <div className="picker-winner-actions">
              <button className="picker-again-btn" onClick={handleReset}>
                Pick Again
              </button>
              <button className="picker-done-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomPicker