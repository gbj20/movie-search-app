import React, { useState, useEffect, useRef, useCallback } from "react";
import './MovieSearchApp.css';

function MovieSearchApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sortBy, setSortBy] = useState('relevance'); 
  const [viewMode, setViewMode] = useState('grid'); 
  
  const debounceTimer = useRef(null);
  const searchCache = useRef({});
  const activeSearchRequest = useRef(null);
  const activeSuggestionRequest = useRef(null);
  const lastSuggestionTerm = useRef('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    } else {
      document.body.className = 'dark';
    }

    const savedFavorites = localStorage.getItem('movieFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedSearchTerm = localStorage.getItem('lastSearchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
      handleSearchWithTerm(savedSearchTerm);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('appTheme', newTheme);
  };

  useEffect(() => {
    if (searchTerm === '') {
      setMovies([]);
      setTotalResults(0);
      setCurrentPage(1);
      setSuggestions([]);
      setShowSuggestions(false);
      lastSuggestionTerm.current = '';
      if (activeSuggestionRequest.current) {
        activeSuggestionRequest.current = null;
      }
    }
  }, [searchTerm]);

  const debouncedSearch = useCallback((term) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (term.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      lastSuggestionTerm.current = '';
      return;
    }

    const normalizedTerm = term.toLowerCase().trim();
    
    debounceTimer.current = setTimeout(() => {
      if (normalizedTerm === lastSuggestionTerm.current) {
        return;
      }
      
      const cacheKey = `suggestions_${normalizedTerm}`;
      if (searchCache.current[cacheKey]) {
        setSuggestions(searchCache.current[cacheKey]);
        setShowSuggestions(true);
        lastSuggestionTerm.current = normalizedTerm;
        return;
      }
      
      if (activeSuggestionRequest.current !== normalizedTerm) {
        fetchSuggestions(term);
      }
    }, 500);
  }, []);

  const fetchSuggestions = async (term) => {
    const normalizedTerm = term.toLowerCase().trim();
    const cacheKey = `suggestions_${normalizedTerm}`;
    
    if (activeSuggestionRequest.current === normalizedTerm) {
      return;
    }
    
    activeSuggestionRequest.current = normalizedTerm;
    lastSuggestionTerm.current = normalizedTerm;
    setIsSearching(true);
    const API_KEY = "894809ee";
    
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(term)}&page=1`
      );
      const data = await response.json();

      if (activeSuggestionRequest.current !== normalizedTerm) {
        return;
      }

      if (data.Response === 'True') {
        const uniqueMovies = [];
        const seenIds = new Set();
        
        for (const movie of data.Search) {
          if (!seenIds.has(movie.imdbID)) {
            seenIds.add(movie.imdbID);
            uniqueMovies.push(movie);
          }
        }
        
        const topSuggestions = uniqueMovies.slice(0, 5);
        setSuggestions(topSuggestions);
        setShowSuggestions(true);
        searchCache.current[cacheKey] = topSuggestions;
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
      if (activeSuggestionRequest.current === normalizedTerm) {
        activeSuggestionRequest.current = null;
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (movie) => {
    setSearchTerm(movie.Title);
    setShowSuggestions(false);
    setSuggestions([]);
    activeSuggestionRequest.current = null;
    handleSearchWithTerm(movie.Title, 1);
  };

  const handleSearchWithTerm = async (term, page = 1) => {
    const normalizedTerm = term.toLowerCase().trim();
    const searchKey = `${normalizedTerm}_page${page}`;
    
    if (activeSearchRequest.current === searchKey) {
      return;
    }
    
    if (searchCache.current[searchKey]) {
      const cachedData = searchCache.current[searchKey];
      setMovies(cachedData.movies);
      setTotalResults(cachedData.totalResults);
      setCurrentPage(page);
      setShowFavorites(false);
      return;
    }

    activeSearchRequest.current = searchKey;
    const API_KEY = "894809ee";
    
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(term)}&page=${page}`
      );
      const data = await response.json();

      if (activeSearchRequest.current !== searchKey) {
        return;
      }

      if (data.Response === 'True') {
        const uniqueMovies = [];
        const seenIds = new Set();
        
        for (const movie of data.Search) {
          if (!seenIds.has(movie.imdbID)) {
            seenIds.add(movie.imdbID);
            uniqueMovies.push(movie);
          }
        }
        
        setMovies(uniqueMovies);
        setTotalResults(parseInt(data.totalResults));
        setCurrentPage(page);
        setShowFavorites(false);
        
        searchCache.current[searchKey] = {
          movies: uniqueMovies,
          totalResults: parseInt(data.totalResults)
        };
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      if (activeSearchRequest.current === searchKey) {
        activeSearchRequest.current = null;
      }
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchTerm.trim()) {
      alert("Please enter a movie name");
      return;
    }

    setShowSuggestions(false);
    setSuggestions([]);
    
    const normalizedTerm = searchTerm.toLowerCase().trim();
    const searchKey = `${normalizedTerm}_page${page}`;
    
    if (activeSearchRequest.current === searchKey) {
      return;
    }
    
    if (searchCache.current[searchKey]) {
      const cachedData = searchCache.current[searchKey];
      setMovies(cachedData.movies);
      setTotalResults(cachedData.totalResults);
      setCurrentPage(page);
      setShowFavorites(false);
      localStorage.setItem('lastSearchTerm', searchTerm);
      return;
    }

    activeSearchRequest.current = searchKey;
    const API_KEY = "894809ee";
    localStorage.setItem('lastSearchTerm', searchTerm);
    
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`
      );
      const data = await response.json();

      if (activeSearchRequest.current !== searchKey) {
        return;
      }

      if (data.Response === 'True') {
        const uniqueMovies = [];
        const seenIds = new Set();
        
        for (const movie of data.Search) {
          if (!seenIds.has(movie.imdbID)) {
            seenIds.add(movie.imdbID);
            uniqueMovies.push(movie);
          }
        }
        
        setMovies(uniqueMovies);
        setTotalResults(parseInt(data.totalResults));
        setCurrentPage(page);
        setShowFavorites(false);
        
        searchCache.current[searchKey] = {
          movies: uniqueMovies,
          totalResults: parseInt(data.totalResults)
        };
      } else {
        alert("No Movies Found!");
        setMovies([]);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      alert("Error searching movies. Please try again.");
    } finally {
      if (activeSearchRequest.current === searchKey) {
        activeSearchRequest.current = null;
      }
    }
  };

  const getMovieDetails = async (movieID) => {
    const cacheKey = `details_${movieID}`;
    
    if (searchCache.current[cacheKey]) {
      setSelectedMovie(searchCache.current[cacheKey]);
      return;
    }

    const API_KEY = '894809ee';
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieID}&plot=full`
      );
      const data = await response.json();
      setSelectedMovie(data);
      searchCache.current[cacheKey] = data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      alert("Error loading movie details. Please try again.");
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handleSearch(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handleSearch(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(totalResults / 10);

  const toggleFavorite = (movie) => {
    let updatedFavorites;
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    } else {
      updatedFavorites = [...favorites, movie];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('movieFavorites', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (movieID) => {
    return favorites.some(fav => fav.imdbID === movieID);
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve) => {
      if (!url || url === 'N/A') {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataURL);
        } catch (error) {
          console.error('Error converting image:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // FIXED: PDF generation with proper rating format
  const generateMoviePDF = async () => {
    if (!selectedMovie) return;

    setIsGeneratingPDF(true);

    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(0, 123, 255);
      const titleLines = doc.splitTextToSize(selectedMovie.Title, pageWidth - 2 * margin);
      doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += titleLines.length * 10 + 5;

      // Year
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Released: ${selectedMovie.Year}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Separator line
      doc.setDrawColor(0, 123, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Poster image
      if (selectedMovie.Poster && selectedMovie.Poster !== 'N/A') {
        try {
          const imageData = await loadImageAsBase64(selectedMovie.Poster);
          if (imageData) {
            const imgWidth = 60;
            const imgHeight = 90;
            const imgX = (pageWidth - imgWidth) / 2;
            doc.addImage(imageData, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 20;
          }
        } catch (error) {
          console.error('Error adding poster:', error);
        }
      }

   
      doc.setFontSize(11);
      const details = [
        ['Rating:', selectedMovie.imdbRating && selectedMovie.imdbRating !== 'N/A' ? `${selectedMovie.imdbRating}/10 ⭐` : 'Not Rated'],
        ['Genre:', selectedMovie.Genre || 'N/A'],
        ['Runtime:', selectedMovie.Runtime || 'N/A'],
        ['Director:', selectedMovie.Director || 'N/A'],
        ['Cast:', selectedMovie.Actors || 'N/A']
      ];

      details.forEach(([label, value]) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const valueLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 40);
        doc.text(valueLines, margin + 40, yPosition);
        yPosition += Math.max(8, valueLines.length * 7 + 2);
      });

      yPosition += 10;

      // Plot section
      if (yPosition > pageHeight - 70) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 123, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Plot Summary', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      const plotText = selectedMovie.Plot || 'No plot available.';
      const plotLines = doc.splitTextToSize(plotText, pageWidth - 2 * margin);
      
      plotLines.forEach((line) => {
        if (yPosition > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      // Footer
      const footerY = pageHeight - 10;
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(
        `Generated from Movie Search App | ${currentDate}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      // Save PDF
      const safeTitle = selectedMovie.Title.replace(/[^a-z0-9]/gi, '_');
      doc.save(`${safeTitle}_MovieDetails.pdf`);

      setIsGeneratingPDF(false);
      showSuccessMessage('✓ PDF Downloaded Successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGeneratingPDF(false);
      alert("Error generating PDF. Please check your connection.");
    }
  };

  const showSuccessMessage = (message) => {
    const successMsg = document.createElement('div');
    successMsg.className = 'pdf-success-message';
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  };

  // Get sorted/filtered movies
  const getDisplayMovies = () => {
    const moviesToDisplay = showFavorites ? favorites : movies;
    
    if (sortBy === 'year-desc') {
      return [...moviesToDisplay].sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortBy === 'year-asc') {
      return [...moviesToDisplay].sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    } else if (sortBy === 'title') {
      return [...moviesToDisplay].sort((a, b) => a.Title.localeCompare(b.Title));
    }
    
    return moviesToDisplay;
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <div className="header-content">
          <h1>🎬 CineSearch</h1>
          <p className="header-subtitle">Discover Your Next Favorite Film</p>
        </div>
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text"
            placeholder="Search for movies..."
            value={searchTerm} 
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(1);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="search-input" 
          />
          <button onClick={() => handleSearch(1)} className="search-button">
            Search
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((movie) => (
              <div 
                key={movie.imdbID}
                className="suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(movie);
                }}
              >
                {movie.Poster !== 'N/A' && (
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

      <div className="controls-bar">
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`control-button ${showFavorites ? 'active' : ''}`}>
          ❤️ Favorites {favorites.length > 0 && `(${favorites.length})`}
        </button>
        
        {!showFavorites && movies.length > 0 && (
          <>
            <div className="sort-control">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="year-desc">Year (Newest)</option>
                <option value="year-asc">Year (Oldest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <button 
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid View">
                ▦
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                title="List View">
                ☰
              </button>
            </div>
          </>
        )}
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button" 
              onClick={() => setSelectedMovie(null)}
            > 
              ✕
            </button>
            
            <button 
              className="pdf-download-button-top"
              onClick={generateMoviePDF}
              disabled={isGeneratingPDF}
              title="Download as PDF"
            >
              {isGeneratingPDF ? (
                <>
                  <span className="spinner"></span>
                  <span className="pdf-text">Generating...</span>
                </>
              ) : (
                <>
                  <span className="pdf-icon">📄</span>
                  <span className="pdf-text">Download PDF</span>
                </>
              )}
            </button>

            <div className="movie-details">
              <div className="movie-header">
                {selectedMovie.Poster !== 'N/A' && (
                  <img
                    src={selectedMovie.Poster}
                    alt={selectedMovie.Title}
                    className="detail-poster" 
                  />
                )}
                <div className="movie-info-section">
                  <h2>{selectedMovie.Title}</h2>
                  <div className="movie-meta">
                    <span className="meta-item">
                      <strong>Year:</strong> {selectedMovie.Year}
                    </span>
                    <span className="meta-item">
                      <strong>Rating:</strong> ⭐ {selectedMovie.imdbRating}/10
                    </span>
                    <span className="meta-item">
                      <strong>Runtime:</strong> {selectedMovie.Runtime}
                    </span>
                  </div>
                  <div className="detail-info">
                    <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
                    <p><strong>Director:</strong> {selectedMovie.Director}</p>
                    <p><strong>Cast:</strong> {selectedMovie.Actors}</p>
                  </div>
                </div>
              </div>
              
              <div className="plot-section">
                <h3>Plot Summary</h3>
                <p>{selectedMovie.Plot}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="result-section">
        {(showFavorites ? favorites.length > 0 : movies.length > 0) && (
          <p className="results-count">
            {showFavorites
              ? `${favorites.length} favorite ${favorites.length === 1 ? 'movie' : 'movies'}`
              : `Found ${totalResults} results - Page ${currentPage} of ${totalPages}`
            }
          </p>
        )}
        
        {showFavorites && favorites.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>No Favorites Yet</h3>
            <p>Start adding movies to your favorites by clicking the heart icon!</p>
          </div>
        )}

        <div className={`movie-list ${viewMode}`}>
          {getDisplayMovies().map((movie) => (
            <div 
              key={movie.imdbID}
              className="movie-item"
              onClick={() => getMovieDetails(movie.imdbID)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(movie);
                }}
                className={`heart-button ${isFavorite(movie.imdbID) ? 'active' : ''}`}
                title={isFavorite(movie.imdbID) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(movie.imdbID) ? '❤️' : '🤍'}
              </button>

              <div className="movie-overlay">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
              </div>
            </div>
          ))}
        </div>

        {!showFavorites && movies.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="page-button"
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="page-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieSearchApp;