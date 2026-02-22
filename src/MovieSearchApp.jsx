import { useState, useEffect, useReducer, useMemo, useCallback, lazy, Suspense } from "react";
import "./MovieSearchApp.css";

import useMovies from "./hooks/useMovies";
import { useTheme } from "./context/ThemeContext";
import { movieReducer, initialState } from "./reducer/movieReducer";

import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import SkeletonCard from "./components/SkeletonCard";
import MoodFilter from "./components/MoodFilter";
import WatchHistory from "./components/WatchHistory";

const MovieModal = lazy(() => import("./components/MovieModal"));
const CompareModal = lazy(() => import("./components/CompareModal"));

function MovieSearchApp() {

  const {
    movies,
    suggestions,
    selectedMovie,
    setSelectedMovie,
    searchMovies,
    fetchSuggestions,
    clearSuggestions,   // FIX: destructure the new function
    getMovieDetails,
    currentPage,
    totalResults,
    loading,
    error,
    watchHistory,
    clearHistory,
  } = useMovies();

  const [state, dispatch] = useReducer(movieReducer, initialState);
  const {
    searchTerm,
    sortBy,
    viewMode,
    filterType,
    yearFrom,
    yearTo,
    compareList,
    mood,
  } = state;

  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("search");
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showMoodFilter, setShowMoodFilter] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("movieFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("movieFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const page = parseInt(params.get("page")) || 1;
    const type = params.get("type") || "all";
    const movieId = params.get("movie");

    if (q) {
      dispatch({ type: "SET_SEARCH_TERM", payload: q });
      dispatch({ type: "SET_FILTER_TYPE", payload: type });
      searchMovies(q, page, type);
    } else {
      const saved = localStorage.getItem("lastSearchTerm");
      if (saved) {
        dispatch({ type: "SET_SEARCH_TERM", payload: saved });
        searchMovies(saved, 1);
      }
    }

    if (movieId) {
      getMovieDetails(movieId);
    }
  }, []);

  const updateURL = useCallback((term, page, type) => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (page > 1) params.set("page", String(page));
    if (type && type !== "all") params.set("type", type);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.imdbID === movie.imdbID);
      return exists
        ? prev.filter(f => f.imdbID !== movie.imdbID)
        : [...prev, movie];
    });
  }, []);

  // FIX: call clearSuggestions() so the dropdown closes when search fires
  const handleSearch = useCallback((term, page = 1) => {
    if (!term || !term.trim()) return;
    clearSuggestions();           // ← closes dropdown immediately
    updateURL(term, page, filterType);
    searchMovies(term, page, filterType);
  }, [filterType, updateURL, searchMovies, clearSuggestions]);

  const handleMoodSelect = useCallback((moodObj) => {
    dispatch({ type: "SET_MOOD", payload: moodObj.label });
    dispatch({ type: "SET_SEARCH_TERM", payload: moodObj.query });
    setShowMoodFilter(false);
    clearSuggestions();
    updateURL(moodObj.query, 1, filterType);
    searchMovies(moodObj.query, 1, filterType);
  }, [filterType, updateURL, searchMovies, clearSuggestions]);

  const handleCompare = useCallback((movie) => {
    const isAlreadyIn = compareList.some(m => m.imdbID === movie.imdbID);
    if (isAlreadyIn) {
      dispatch({ type: "REMOVE_FROM_COMPARE", payload: movie.imdbID });
    } else {
      dispatch({ type: "ADD_TO_COMPARE", payload: movie });
    }
  }, [compareList]);

  const handleClearSearch = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
    clearSuggestions();
    // NOTE: We do NOT remove lastSearchTerm from localStorage here.
    // Clearing the input only wipes the screen. On refresh, the last
    // search still restores from localStorage so results come back.
    window.history.pushState({}, "", window.location.pathname);
  }, [clearSuggestions]);

  const displayMovies = useMemo(() => {
    let list = activeTab === "favorites" ? favorites : movies;
    if (yearFrom) list = list.filter(m => parseInt(m.Year) >= parseInt(yearFrom));
    if (yearTo) list = list.filter(m => parseInt(m.Year) <= parseInt(yearTo));
    if (sortBy === "year-desc") return [...list].sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    if (sortBy === "year-asc") return [...list].sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    if (sortBy === "title") return [...list].sort((a, b) => a.Title.localeCompare(b.Title));
    return list;
  }, [movies, favorites, activeTab, sortBy, yearFrom, yearTo]);

  const renderContent = () => {

    if (activeTab === "history") {
      return (
        <WatchHistory
          history={watchHistory}
          onSelectMovie={getMovieDetails}
          onClear={clearHistory}
        />
      );
    }

    if (loading) {
      return (
        <div className={`movie-list ${viewMode}`}>
          {Array(8).fill(null).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty-state">
          <span style={{ fontSize: "60px" }}>😕</span>
          <p style={{ marginTop: "16px", fontSize: "18px" }}>{error}</p>
        </div>
      );
    }

    if (displayMovies.length === 0) {
      return (
        <div className="empty-state">
          <span style={{ fontSize: "60px" }}>
            {activeTab === "favorites" ? "💔" : "🎬"}
          </span>
          <p style={{ marginTop: "16px", fontSize: "18px" }}>
            {activeTab === "favorites"
              ? "No favorites yet! Click the 🤍 on any movie to save it."
              : "Search for a movie above to get started."}
          </p>
        </div>
      );
    }

    return (
      <div className={`movie-list ${viewMode}`}>
        {displayMovies.map(movie => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onSelect={(m) => getMovieDetails(m.imdbID)}
            onFavorite={toggleFavorite}
            isFavorite={favorites.some(f => f.imdbID === movie.imdbID)}
            onCompare={handleCompare}
            isInCompare={compareList.some(m => m.imdbID === movie.imdbID)}
            compareCount={compareList.length}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">

      <div className="header-section">
        <div className="header-content">
          <h1>🎬 CineSearch</h1>
          <p className="header-subtitle">Discover Your Next Favorite Film</p>
        </div>
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={(val) => dispatch({ type: "SET_SEARCH_TERM", payload: val })}
        onSearch={handleSearch}
        onSuggest={fetchSuggestions}
        suggestions={suggestions}
        // FIX: clearSuggestions is also called here so clicking a suggestion
        // item closes the dropdown AND properly loads its search results.
        onSelectSuggestion={(movie) => {
          clearSuggestions();                                       // ← close dropdown
          dispatch({ type: "SET_SEARCH_TERM", payload: movie.Title });
          handleSearch(movie.Title, 1);                            // ← load results for that movie
        }}
        onClear={handleClearSearch}
      />

      <div className="tabs">
        <button
          className={`tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 Search
        </button>
        <button
          className={`tab ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          ❤️ Favorites {favorites.length > 0 && `(${favorites.length})`}
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          🕐 History {watchHistory.length > 0 && `(${watchHistory.length})`}
        </button>
      </div>

      {activeTab !== "history" && (
        <div className="controls-bar">

          <button
            className={`control-button ${showMoodFilter ? "active" : ""}`}
            onClick={() => setShowMoodFilter(prev => !prev)}
          >
            🎭 Mood {mood && `· ${mood}`}
          </button>

          <div className="type-filter">
            {["all", "movie", "series", "episode"].map(t => (
              <button
                key={t}
                className={`type-btn ${filterType === t ? "active" : ""}`}
                onClick={() => {
                  dispatch({ type: "SET_FILTER_TYPE", payload: t });
                  if (searchTerm) {
                    updateURL(searchTerm, 1, t);
                    searchMovies(searchTerm, 1, t);
                  }
                }}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="year-range">
            <input
              type="number"
              className="year-input"
              placeholder="From year"
              value={yearFrom}
              min="1900"
              max="2025"
              onChange={e => dispatch({ type: "SET_YEAR_FROM", payload: e.target.value })}
            />
            <span className="year-separator">—</span>
            <input
              type="number"
              className="year-input"
              placeholder="To year"
              value={yearTo}
              min="1900"
              max="2025"
              onChange={e => dispatch({ type: "SET_YEAR_TO", payload: e.target.value })}
            />
          </div>

          <div className="sort-control">
            <label>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => dispatch({ type: "SET_SORT", payload: e.target.value })}
            >
              <option value="relevance">Relevance</option>
              <option value="year-desc">Newest First</option>
              <option value="year-asc">Oldest First</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => dispatch({ type: "SET_VIEW_MODE", payload: "grid" })}
              title="Grid view"
            >▦</button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => dispatch({ type: "SET_VIEW_MODE", payload: "list" })}
              title="List view"
            >☰</button>
          </div>

          {compareList.length > 0 && (
            <button
              className={`control-button compare-trigger ${compareList.length === 2 ? "compare-ready" : ""}`}
              onClick={() => { if (compareList.length === 2) setShowCompareModal(true); }}
              title={compareList.length === 2 ? "Click to compare!" : "Select one more movie"}
            >
              ⚖️ Compare ({compareList.length}/2)
              {compareList.length < 2 && " — pick one more"}
            </button>
          )}

        </div>
      )}

      {showMoodFilter && activeTab !== "history" && (
        <MoodFilter activeMood={mood} onMoodSelect={handleMoodSelect} />
      )}

      {renderContent()}

      {!loading && totalResults > 10 && activeTab === "search" && (
        <div className="pagination">
          <button
            className="page-button"
            disabled={currentPage === 1}
            onClick={() => handleSearch(searchTerm, currentPage - 1)}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {Math.ceil(totalResults / 10)}
          </span>
          <button
            className="page-button"
            disabled={currentPage >= Math.ceil(totalResults / 10)}
            onClick={() => handleSearch(searchTerm, currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}

      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
        {showCompareModal && compareList.length === 2 && (
          <CompareModal
            movies={compareList}
            onClose={() => {
              setShowCompareModal(false);
              dispatch({ type: "CLEAR_COMPARE" });
            }}
          />
        )}
      </Suspense>

    </div>
  );
}

export default MovieSearchApp;