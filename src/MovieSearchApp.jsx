import React, { useState, useEffect } from "react";
import './MovieSearchApp.css';


function MovieSearchApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const handleSearchWithTerm = async (term, page = 1) => {
    const API_KEY = "894809ee";
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${term}&page=${page}`
    );
    const data = await response.json();

    if (data.Response === 'True') {
      setMovies(data.Search);
      setTotalResults(parseInt(data.totalResults));
      setCurrentPage(page);
      setShowFavorites(false);
    }
  };


  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedSearchTerm = localStorage.getItem('lastSearchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
      // Automatically search with the saved term
      handleSearchWithTerm(savedSearchTerm);
    }
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setMovies([]);
      setTotalResults(0);
      setCurrentPage(1);
    }
  }, [searchTerm]);


  const handleSearch = async (page = 1) => {
    const API_KEY = "894809ee";
    localStorage.setItem('lastSearchTerm', searchTerm);
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}&page=${page}`
    );
    const data = await response.json();

    if (data.Response === 'True') {
      setMovies(data.Search);
      setTotalResults(parseInt(data.totalResults));
      setCurrentPage(page)
      setShowFavorites(false);
    }
    else {
      alert("No Movies Found !!")
      setMovies([])
    }
  };


  const getMovieDetails = async (movieID) => {
    const API_KEY = '894809ee'
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieID}&plot=full`
    );
    const data = await response.json()
    setSelectedMovie(data);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handleSearch(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handleSearch(currentPage - 1)
    }
  };

  //calculate total pages
  const totalPages = Math.ceil(totalResults / 10);

  const toggleFavorite = (movie) => {
    let updatedFavorites;
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    if (isFavorite) {
      //Remove from Fav
      updatedFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    }
    else {
      // Add to Fav
      updatedFavorites = [...favorites, movie];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('movieFavorites', JSON.stringify(updatedFavorites));
  };
  //check if movie is in favorites
  const isFavorite = (movieID) => {
    return favorites.some(fav => fav.imdbID === movieID);
  }
  return (
    <div className="app-container">
      <h1>🎬Movie Search App</h1>
      <p className="tagline">Find Your All Favourite Movies in one place</p>

      {/* search-box */}
      <div className="search-box">
        <input type="text"
          placeholder="Search a movie.."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(1);
            }
          }}
          className="search-input" />

        <button onClick={() => handleSearch(1)} className="search-button">Search</button>
      </div>

      <div className="view-toggle">
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className="toggle-button">
          {showFavorites ? 'Show Search Results' : `Show Favorites (${favorites.length})`}
        </button>
      </div>

      {/* Movie Details */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button" onClick={() => setSelectedMovie(null)}> ✕
            </button>
            <div className="movie-details">
              <h2>{selectedMovie.Title}</h2>
              {selectedMovie.Poster !== 'N/A' && (
                <img
                  src={selectedMovie.Poster}
                  alt={selectedMovie.Title}
                  className="detail-poster" />
              )}
              <div className="detail-info">
                <p><strong>Year:</strong> {selectedMovie.Year}</p>
                <p><strong>Rating:</strong>
                  <span className="fa fa-star checked"></span>
                  {selectedMovie.imdbRating}/10</p>
                <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
                <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
                <p><strong>Director:</strong> {selectedMovie.Director}</p>
                <p><strong>Cast:</strong> {selectedMovie.Actors}</p>
              </div>
              <div className="plot-section">
                <h3>Details:</h3>
                <p>{selectedMovie.Plot}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Results */}
      <div className="result-section">
        {(showFavorites ? favorites.length > 0 : movies.length > 0) && (
          <p className="results-count">
            {showFavorites
              ? `${favorites.length} favorite movies`
              : `Found ${totalResults} results - Showing page ${currentPage} of ${totalPages}`
            }
          </p>
        )}
        {showFavorites && favorites.length === 0 && (
          <p className="no-favorites">No favorite ❤️ movies yet!! </p>
        )}

        <div className="movie-list" key={showFavorites ? "favorites" : "movies"}>
          {(showFavorites ? favorites : movies).map((movie) => (
            <div key={movie.imdbID}
              className="movie-item"
              onClick={() => getMovieDetails(movie.imdbID)}>
              {/* <h3>{movie.Title}</h3>
              <p className="movie-year">Year: {movie.Year}</p> */}
              {movie.Poster !== "N/A" && (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="movie-poster" />
              )}

              <button onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie);
              }}
                className="heart-button">
                {isFavorite(movie.imdbID) ? '❤️' : '🤍'}
              </button>

              <div className="movie-overlay">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
              </div>
            </div>

          ))}
        </div>
        {/* pagination */}
        {!showFavorites && movies.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="page-button">
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="page-button">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieSearchApp;

