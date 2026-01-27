import './StarRating.css'

/**
 * StarRating Component
 * 
 * Interactive 5-star rating system
 * Displays filled stars (⭐) for rated values and empty stars (☆) for unrated
 * 
 * Features:
 * - Click any star to set rating (1-5)
 * - Visual hover effect (stars grow on hover)
 * - Controlled component (rating managed by parent)
 * 
 * @param {number} rating - Current rating value (0-5)
 * @param {Function} onRatingChange - Callback when user clicks a star
 */
function StarRating({ rating, onRatingChange }) {
  return (
    <div className="star-rating">
      {/* Generate 5 star elements */}
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star}
          onClick={() => onRatingChange(star)}
        >
          {/* Show filled star if this position is rated, empty otherwise */}
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

export default StarRating