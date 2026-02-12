// import React, { useState, useEffect } from 'react';
// import './styles.css';

// // useState → stores dynamic data (movies, loading, favorites, etc.)
// // useEffect → runs side effects (like loading favorites from storage)

// function MovieSearchApp() {
//   const [searchTerm, setSearchTerm] = useState(''); //Stores what user types in search box.
//   const [movies, setMovies] = useState([]); //search results list
//   const [loading, setLoading] = useState(false); //shows “Loading…
//   const [error, setError] = useState(''); //error messages
//   const [selectedMovie, setSelectedMovie] = useState(null); //movie opened in modal
//   const [currentPage, setCurrentPage] = useState(1); //pagination tracking
//   const [totalResults, setTotalResults] = useState(0); //total count from API
//   const [favorites, setFavorites] = useState([]); //Array storing favorite movies.
//   const [showFavorites, setShowFavorites] = useState(false); //toggles between favorites & results

//   const API_KEY = '894809ee'; 

//   // Load favorites from localStorage 
//   useEffect(() => {
//     const savedFavorites = localStorage.getItem('movieFavorites'); //This makes favorites stay even after refresh
//     if (savedFavorites) {
//       setFavorites(JSON.parse(savedFavorites));
//     }
//   }, []);

//   // Function to search movies
//   const searchMovies = async (page = 1) => {
//     if (!searchTerm.trim()) {
//       setError('Please enter a movie name');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(
//         `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}&page=${page}`
//       );
//       const data = await response.json();

//       if (data.Response === 'True') {
//         setMovies(data.Search);
//         setTotalResults(parseInt(data.totalResults));
//         setCurrentPage(page);
//       } else {
//         setError(data.Error || 'No movies found');
//         setMovies([]);
//       }
//     } catch (err) {
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get detailed info about a specific movie
//   const getMovieDetails = async (imdbID) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
//       );
//       const data = await response.json();
//       setSelectedMovie(data);
//     } catch (err) {
//       setError('Could not load movie details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // adding/removing favorites
//   const toggleFavorite = (movie) => {
//     let updatedFavorites;
//     const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);

//     if (isFavorite) {
//       updatedFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
//     } else {
//       updatedFavorites = [...favorites, movie];
//     }

//     setFavorites(updatedFavorites);
//     localStorage.setItem('movieFavorites', JSON.stringify(updatedFavorites));
//   };

//   // Check if a movie is in favorites
//   const isFavorite = (imdbID) => {
//     return favorites.some(fav => fav.imdbID === imdbID);
//   };

//   // Handle image error 
//   const handleImageError = (e) => {
//     e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23666" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E';
//   };

//   // Handle search form submission
//   const handleSearch = (e) => {
//     e.preventDefault();
//     setShowFavorites(false);
//     searchMovies(1);
//   };

//   // Pagination handlers
//   const totalPages = Math.ceil(totalResults / 10); 
//   const goToNextPage = () => {
//     if (currentPage < totalPages) {
//       searchMovies(currentPage + 1);
//     }
//   };

//   const goToPrevPage = () => {
//     if (currentPage > 1) {
//       searchMovies(currentPage - 1);
//     }
//   };

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1 className="app-title">🎬 Movie Search</h1>
//         <p className="app-subtitle">Find your favorite movies</p>
//       </header>

//       {/* Search Bar */}
//       <form onSubmit={handleSearch} className="search-form">
//         <input
//           type="text"
//           placeholder="Search for a movie..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="search-input"
//         />
//         <button type="submit" className="search-button">
//           Search
//         </button>
//       </form>

//       {/* Favorites Toggle Button */}
//       <div className="favorites-toggle">
//         <button
//           onClick={() => setShowFavorites(!showFavorites)}
//           className="toggle-button"
//         >
//           {showFavorites ? 'Show Search Results' : `Show Favorites (${favorites.length})`}
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && <div className="error-message">{error}</div>}

//       {/* Loading Indicator */}
//       {loading && <div className="loading-message">Loading...</div>}

//       {/* Movie Details Modal */}
//       {selectedMovie && (
//         <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <button 
//               className="close-button"
//               onClick={() => setSelectedMovie(null)}
//             >
//               ✕
//             </button>

//             <div className="details-container">
//               <img 
//                 src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23666" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E'}
//                 alt={selectedMovie.Title}
//                 className="details-poster"
//                 onError={handleImageError}
//               />
//               <div className="details-info">
//                 <h2 className="details-title">{selectedMovie.Title}</h2>
//                 <p className="details-year">{selectedMovie.Year}</p>

//                 <div className="details-row">
//                   <span className="info-label">Rating:</span>
//                   <span className="rating-value">⭐ {selectedMovie.imdbRating}/10</span>
//                 </div>

//                 <div className="details-row">
//                   <span className="info-label">Genre:</span>
//                   <span>{selectedMovie.Genre}</span>
//                 </div>

//                 <div className="details-row">
//                   <span className="info-label">Runtime:</span>
//                   <span>{selectedMovie.Runtime}</span>
//                 </div>

//                 <div className="details-row">
//                   <span className="info-label">Director:</span>
//                   <span>{selectedMovie.Director}</span>
//                 </div>

//                 <div className="details-row">
//                   <span className="info-label">Cast:</span>
//                   <span>{selectedMovie.Actors}</span>
//                 </div>

//                 <p className="plot-text">{selectedMovie.Plot}</p>

//                 <button
//                   onClick={() => toggleFavorite(selectedMovie)}
//                   className={`favorite-button ${isFavorite(selectedMovie.imdbID) ? 'is-favorite' : 'not-favorite'}`}
//                 >
//                   {isFavorite(selectedMovie.imdbID) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Movies Grid */}
//       {!loading && (showFavorites ? favorites : movies).length > 0 && (
//         <>
//           <div className="results-info">
//             {showFavorites 
//               ? `${favorites.length} favorite movies` 
//               : `Found ${totalResults} results`}
//           </div>

//           <div className="movies-grid">
//             {(showFavorites ? favorites : movies).map((movie) => (
//               <div 
//                 key={movie.imdbID} 
//                 className="movie-card"
//                 onClick={() => getMovieDetails(movie.imdbID)}
//               >
//                 <img 
//                   src={movie.Poster !== 'N/A' ? movie.Poster : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23666" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E'}
//                   alt={movie.Title}
//                   className="movie-poster"
//                   onError={handleImageError}
//                 />
//                 <div className="movie-info">
//                   <h3 className="movie-title">{movie.Title}</h3>
//                   <p className="movie-year">{movie.Year}</p>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleFavorite(movie);
//                     }}
//                     className="heart-button"
//                   >
//                     {isFavorite(movie.imdbID) ? '❤️' : '🤍'}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination - only show for search results*/}
//           {!showFavorites && totalPages > 1 && (
//             <div className="pagination">
//               <button 
//                 onClick={goToPrevPage}
//                 disabled={currentPage === 1}
//                 className="page-button"
//               >
//                 Previous
//               </button>

//               <span className="page-info">
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button 
//                 onClick={goToNextPage}
//                 disabled={currentPage === totalPages}
//                 className="page-button"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default MovieSearchApp;

import React, { useState } from "react";
import './app.css';


function MovieSearchApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSearch = async () => {
    const API_KEY = "894809ee";
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}`
    );
    const data = await response.json();

    if (data.Response === 'True') {
      setMovies(data.Search);
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

  return (
    <div className="app-container">
      <h1>🎬Movie Search App</h1>
      <p className="tagline">Find Your All Favourite Movies in one place</p>

      {/* search-box */}
      <div className="search-box">
        <input type="text"
          placeholder="Search a movie.."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input" />

        <button onClick={handleSearch} className="search-button">Search</button>
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
                <p><strong>Rating:</strong> ⭐ {selectedMovie.imdbRating}/10</p>
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
        <p className="results-count">Found {movies.length} movies</p>

        <div className="movie-list">
          {movies.map((movie) => (
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
              <div className="movie-overlay">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
              </div>
            </div>

          ))}
        </div>
      </div >
    </div >
  );
}

export default MovieSearchApp;