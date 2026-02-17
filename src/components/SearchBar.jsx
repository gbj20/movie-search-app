function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  onSuggest,
  suggestions,
  onSelectSuggestion
}) {

  return (
    <div className="search-container">

      <div className="search-box">
        <span className="search-icon">🔍</span>

        <input
          className="search-input"
          value={searchTerm}
          placeholder="Search for movies..."
          onChange={(e)=>{
            setSearchTerm(e.target.value);
            onSuggest(e.target.value);  
          }}
          onKeyDown={(e)=>{
            if(e.key==="Enter"){
              onSearch(searchTerm);
            }
          }}
        />

        <button
          className="search-button"
          onClick={()=>onSearch(searchTerm)}
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">

          {suggestions.map(movie => (
            <div
              key={movie.imdbID}
              className="suggestion-item"
              onMouseDown={()=>onSelectSuggestion(movie)}
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
