/*
 * useMovies Hook
 * Handles:
 * - Search & Pagination
 * - Suggestions with debounce
 * - API caching
 * - localStorage restore
 */

import { useState, useEffect, useRef } from "react";

export default function useMovies() {

    const API_KEY = "894809ee";

    const [movies, setMovies] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const cache = useRef({});
    const debounceTimer = useRef(null);
    const [lastSearchTerm, setLastSearchTerm] = useState("");

    const uniqueMovies = (list) => {
        const seen = new Set();
        const result = [];

        for (const m of list) {
            if (!seen.has(m.imdbID)) {
                seen.add(m.imdbID);
                result.push(m);
            }
        }
        return result;
    };

    const searchMovies = async (term, page = 1) => {

        if (!term) return;
        setLastSearchTerm(term);
        localStorage.setItem("lastSearchTerm", term);
        const key = `${term.toLowerCase()}_${page}`;

        if (cache.current[key]) {
            setMovies(cache.current[key].movies);
            setTotalResults(cache.current[key].totalResults);
            setCurrentPage(page);

            return;
        }

        const res = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&s=${term}&page=${page}`
        );

        const data = await res.json();

        if (data.Response === "True") {

            const cleaned = uniqueMovies(data.Search);

            setMovies(cleaned);
            setTotalResults(parseInt(data.totalResults));
            setCurrentPage(page);

            cache.current[key] = {
                movies: cleaned,
                totalResults: parseInt(data.totalResults)
            };
        }
    };

    const fetchSuggestions = (term) => {

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {

            if (!term.trim()) {
                setSuggestions([]);
                return;
            }

            const key = `suggest_${term.toLowerCase()}`;

            if (cache.current[key]) {
                setSuggestions(cache.current[key]);
                return;
            }

            const res = await fetch(
                `https://www.omdbapi.com/?apikey=${API_KEY}&s=${term}&page=1`
            );

            const data = await res.json();

            if (data.Response === "True") {
                const cleaned = uniqueMovies(data.Search).slice(0, 5);
                setSuggestions(cleaned);
                cache.current[key] = cleaned;
            } else {
                setSuggestions([]);
            }

        }, 500);
    };

    const getMovieDetails = async (id) => {

        const res = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
        );

        const data = await res.json();
        setSelectedMovie(data);
    };
    useEffect(() => {
        const saved = localStorage.getItem("lastSearchTerm");
        if (saved) {
            searchMovies(saved, 1);
            setLastSearchTerm(saved); 
        }
    }, []);


    return {
        movies,
        suggestions,
        selectedMovie,
        setSelectedMovie,
        currentPage,
        totalResults,
        searchMovies,
        fetchSuggestions,
        getMovieDetails
    };
}
