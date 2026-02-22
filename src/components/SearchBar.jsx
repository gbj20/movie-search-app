// ============================================================
// SearchBar.jsx  (UPDATED)
// Changes from original:
//  1. ↑↓ Keyboard navigation for suggestions dropdown
//  2. ✕ Clear button to wipe the search input
//  3. autoFocus - input is focused automatically on page load
//  4. Escape key closes suggestions
// ============================================================

import { useState } from "react";

// Props:
//   searchTerm         - current text in the input
//   setSearchTerm      - updates the text
//   onSearch           - called when user presses Enter or Search button
//   onSuggest          - called as user types (for autocomplete)
//   suggestions        - array of movie suggestion objects
//   onSelectSuggestion - called when user picks a suggestion
//   onClear            - called when user clicks the ✕ clear button
function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  onSuggest,
  suggestions,
  onSelectSuggestion,
  onClear,
}) {

  // Tracks which suggestion is highlighted by keyboard
  // -1 means "none highlighted"
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e) => {

    // If no suggestions showing, just handle Enter
    if (suggestions.length === 0) {
      if (e.key === "Enter") onSearch(searchTerm);
      return;
    }

    if (e.key === "ArrowDown") {
      // Move highlight down (wrap around to top)
      e.preventDefault(); // stop page from scrolling
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));

    } else if (e.key === "ArrowUp") {
      // Move highlight up (wrap around to bottom)
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));

    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        // User pressed Enter on a highlighted suggestion
        onSelectSuggestion(suggestions[activeIndex]);
        setActiveIndex(-1);
      } else {
        // Normal Enter = search
        onSearch(searchTerm);
      }

    } else if (e.key === "Escape") {
      // Close suggestions
      setActiveIndex(-1);
    }
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>

        <input
          autoFocus                  // focus on page load automatically
          className="search-input"
          value={searchTerm}
          placeholder="Search for movies, shows..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSuggest(e.target.value);
            setActiveIndex(-1); // reset keyboard highlight when typing
          }}
          onKeyDown={handleKeyDown}
        />

        {/* ✕ Clear button - only shows when there's text */}
        {searchTerm && (
          <button
            className="clear-input-btn"
            onClick={() => {
              setSearchTerm("");
              onClear();
              setActiveIndex(-1);
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}

        <button
          className="search-button"
          onClick={() => onSearch(searchTerm)}
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((movie, index) => (
            <div
              key={movie.imdbID}
              // "highlighted" class = keyboard is on this item
              className={`suggestion-item ${activeIndex === index ? "highlighted" : ""}`}
              onMouseDown={() => {
                // onMouseDown instead of onClick to fire before input loses focus
                onSelectSuggestion(movie);
                setActiveIndex(-1);
              }}
            >
              {movie.Poster !== "N/A" && (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="suggestion-poster"
                />
              )}
              <div className="suggestion-info">
                <div className="suggestion-title">{movie.Title}</div>
                <div className="suggestion-year">{movie.Year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
