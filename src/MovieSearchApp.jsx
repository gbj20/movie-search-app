import React, { useState, useEffect } from "react";
import "./MovieSearchApp.css";

import useMovies from "./hooks/useMovies";
import { useTheme } from "./context/ThemeContext";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";

function MovieSearchApp() {

  const {
    movies,
    suggestions,
    selectedMovie,
    setSelectedMovie,
    searchMovies,
    fetchSuggestions,
    getMovieDetails,
    currentPage,
    totalResults
  } = useMovies();


  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("movieFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("movieFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (movie) => {
    const exists = favorites.some(f => f.imdbID === movie.imdbID);

    setFavorites(
      exists
        ? favorites.filter(f => f.imdbID !== movie.imdbID)
        : [...favorites, movie]
    );
  };

  const getDisplayMovies = () => {

    const list = showFavorites ? favorites : movies;

    if (sortBy === "year-desc") {
      return [...list].sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    }

    if (sortBy === "year-asc") {
      return [...list].sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    }

    if (sortBy === "title") {
      return [...list].sort((a, b) => a.Title.localeCompare(b.Title));
    }

    return list;
  };
  return (
    <div className="app-container">
      <div className="header-section">
        <div className="header-content">
          <h1>🎬 CineSearch</h1>
          <p className="header-subtitle">
            Discover Your Next Favorite Film
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={(term) => searchMovies(term, 1)}
        onSuggest={fetchSuggestions}
        suggestions={suggestions}
        onSelectSuggestion={(movie) => {
          setSearchTerm(movie.Title);
          searchMovies(movie.Title, 1);
        }}
      />
      <div className="controls-bar">

        <button
          className={`control-button ${showFavorites ? "active" : ""}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          ❤️ Favorites {favorites.length > 0 && `(${favorites.length})`}
        </button>

        {!showFavorites && movies.length > 0 && (
          <>
            <div className="sort-control">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="year-desc">Year (Newest)</option>
                <option value="year-asc">Year (Oldest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                ▦
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                ☰
              </button>
            </div>
          </>
        )}

      </div>

      <div className={`movie-list ${viewMode}`}>
        {getDisplayMovies().map(movie => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onSelect={(m) => getMovieDetails(m.imdbID)}
            onFavorite={toggleFavorite}
            isFavorite={favorites.some(f => f.imdbID === movie.imdbID)}
          />
        ))}
      </div>
      {totalResults > 10 && (
        <div className="pagination">

          <button
            className="page-button"
            disabled={currentPage === 1}
            onClick={() => searchMovies(searchTerm, currentPage - 1)}
          >
            ← Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {Math.ceil(totalResults / 10)}
          </span>

          <button
            className="page-button"
            disabled={currentPage >= Math.ceil(totalResults / 10)}
            onClick={() => searchMovies(searchTerm, currentPage + 1)}
          >
            Next →
          </button>

        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

    </div>
  );
}

export default MovieSearchApp;
