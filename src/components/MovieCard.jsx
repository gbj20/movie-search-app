function MovieCard({ movie, onSelect, onFavorite, isFavorite }) {

  return (
    <div
      className="movie-item"     
      onClick={() => onSelect(movie)}
    >

      {movie.Poster !== "N/A" ? (
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="movie-poster"   
        />
      ) : (
        <div className="no-poster">
          <span>🎬</span>
          <p>No poster</p>
        </div>
      )}

      <button
        className={`heart-button ${isFavorite ? "active" : ""}`} 
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(movie);
        }}
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      <div className="movie-overlay">
        <h3>{movie.Title}</h3>
        <p>{movie.Year}</p>
      </div>

    </div>
  );
}

export default MovieCard;
