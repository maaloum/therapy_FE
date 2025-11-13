import React from "react";

const StarRating = ({
  rating,
  size = "md",
  showNumber = false,
  interactive = false,
  onRatingChange,
}) => {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating || 0;
  const starSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(displayRating);
          const isHalfFilled =
            !isFilled &&
            starValue - 0.5 <= displayRating &&
            displayRating < starValue;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`${starSize} ${
                interactive
                  ? "cursor-pointer hover:scale-110 transition-transform"
                  : "cursor-default"
              } relative`}
            >
              <svg
                viewBox="0 0 20 20"
                fill={isFilled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isFilled ? 0 : 1}
                className={`absolute inset-0 ${
                  isFilled
                    ? "text-yellow-400"
                    : isHalfFilled
                    ? "text-yellow-400 opacity-50"
                    : "text-gray-300"
                }`}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      {showNumber && rating && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
