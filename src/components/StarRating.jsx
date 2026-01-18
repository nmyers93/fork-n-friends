import './StarRating.css'

function StarRating({ rating, onRatingChange }) {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => onRatingChange(star)}
                >
                    {star <= rating ? '⭐' : '☆'}    
                </span>
            ))}
        </div>
    )
}

export default StarRating