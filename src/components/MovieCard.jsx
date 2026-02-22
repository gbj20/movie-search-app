// ============================================================
// MovieCard.jsx  (UPDATED)
// Changes from original:
//  1. Wrapped in React.memo() — prevents unnecessary re-renders
//     (only re-renders when its own props actually change)
//  2. Added ⚖️ Compare button — lets user pick 2 movies to compare
// ============================================================

import { memo } from "react";

// memo() is the "React.memo" wrapper.
// It means: "only re-render this card if its props changed"
// Without this, EVERY card re-renders when you click one heart. Very wasteful!
function MovieCard({ movie, onSelect, onFavorite, isFavorite, onCompare, isInCompare, compareCount }) {
  return (
    <div
      className="movie-item"
      onClick={() => onSelect(movie)}
    >
      {/* Poster or placeholder */}
      {movie.Poster !== "N/A" ? (
        <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
      ) : (
        <div className="no-poster">
          <span>🎬</span>
          <p>No poster</p>
        </div>
      )}

      {/* ❤️ Favorite button (top-right) */}
      <button
        className={`heart-button ${isFavorite ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // stop click from opening the movie modal
          onFavorite(movie);
        }}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      {/* ⚖️ Compare button (top-left) - NEW */}
      <button
        className={`compare-button ${isInCompare ? "in-compare" : ""} ${compareCount >= 2 && !isInCompare ? "compare-full" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // stop click from opening modal
          onCompare(movie);
        }}
        title={
          isInCompare
            ? "Remove from compare"
            : compareCount >= 2
              ? "Already comparing 2 movies. Remove one first."
              : "Add to compare"
        }
      >
        {isInCompare ? "✓" : "⚖️"}
      </button>

      {/* Title + Year overlay (shows on hover) */}
      <div className="movie-overlay">
        <h3>{movie.Title}</h3>
        <p>{movie.Year}</p>
      </div>
    </div>
  );
}

// Export with memo wrapping — this is the performance optimization
export default memo(MovieCard);
