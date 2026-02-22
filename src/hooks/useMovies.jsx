import { useState, useEffect, useRef } from "react";

export default function useMovies() {

  const API_KEY = "894809ee";

  const [movies, setMovies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("watchHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cache = useRef({});
  const debounceTimer = useRef(null);

  const uniqueMovies = (list) => {
    const seen = new Set();
    return list.filter(m => {
      if (seen.has(m.imdbID)) return false;
      seen.add(m.imdbID);
      return true;
    });
  };

  const searchMovies = async (term, page = 1, type = "all") => {
    if (!term || !term.trim()) return;

    localStorage.setItem("lastSearchTerm", term);

    const key = `${term.toLowerCase()}_${page}_${type}`;

    setLoading(true);
    setError(null);

    if (cache.current[key]) {
      setMovies(cache.current[key].movies);
      setTotalResults(cache.current[key].totalResults);
      setCurrentPage(page);
      setLoading(false);
      return;
    }

    try {
      const typeParam = type !== "all" ? `&type=${type}` : "";
      const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(term)}&page=${page}${typeParam}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === "True") {
        const cleaned = uniqueMovies(data.Search);
        setMovies(cleaned);
        setTotalResults(parseInt(data.totalResults));
        setCurrentPage(page);
        cache.current[key] = { movies: cleaned, totalResults: parseInt(data.totalResults) };
      } else {
        setMovies([]);
        setTotalResults(0);
        setError(data.Error || "No results found. Try a different search.");
      }
    } catch (err) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = (term) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!term.trim()) { setSuggestions([]); return; }

      const key = `suggest_${term.toLowerCase()}`;
      if (cache.current[key]) { setSuggestions(cache.current[key]); return; }

      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(term)}&page=1`
        );
        const data = await res.json();

        if (data.Response === "True") {
          const cleaned = uniqueMovies(data.Search).slice(0, 5);
          setSuggestions(cleaned);
          cache.current[key] = cleaned;
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    }, 500);
  };

  // FIX: New function - closes the suggestions dropdown from outside.
  // Called by MovieSearchApp whenever search is triggered or a suggestion is picked.
  const clearSuggestions = () => {
    // Also cancel any pending debounce so a delayed fetch doesn't re-open dropdown
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSuggestions([]);
  };

  const getMovieDetails = async (id) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
      );
      const data = await res.json();
      setSelectedMovie(data);

      const historyEntry = {
        imdbID: data.imdbID,
        Title: data.Title,
        Year: data.Year,
        Poster: data.Poster,
        viewedAt: new Date().toISOString(),
      };

      setWatchHistory(prev => {
        const filtered = prev.filter(h => h.imdbID !== id);
        const updated = [historyEntry, ...filtered].slice(0, 20);
        localStorage.setItem("watchHistory", JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      setError("Failed to load movie details. Please try again.");
    }
  };

  const clearHistory = () => {
    setWatchHistory([]);
    localStorage.removeItem("watchHistory");
  };

  return {
    movies,
    suggestions,
    selectedMovie,
    setSelectedMovie,
    currentPage,
    totalResults,
    loading,
    error,
    watchHistory,
    clearHistory,
    searchMovies,
    fetchSuggestions,
    clearSuggestions,   // FIX: now exported so MovieSearchApp can use it
    getMovieDetails,
  };
}
