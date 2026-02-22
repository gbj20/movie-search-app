// ============================================================
// movieReducer.js
// This file replaces all the separate useState() calls we had
// in MovieSearchApp. Instead of 6 separate states, we have ONE
// big state object managed by this reducer function.
// ============================================================

export const initialState = {
  searchTerm: "",       // what the user typed
  sortBy: "relevance",  // how results are sorted
  viewMode: "grid",     // "grid" or "list"
  filterType: "all",    // "all", "movie", "series", "episode"
  yearFrom: "",         // filter: only show movies from this year
  yearTo: "",           // filter: only show movies up to this year
  compareList: [],      // max 2 movies selected for comparison
  mood: null,           // active mood (e.g. "Funny", "Scary")
};

// The reducer is just a big switch statement.
// It receives the current state and an action, and returns a NEW state.
// We NEVER change state directly - we always return a new copy.
export function movieReducer(state, action) {
  switch (action.type) {

    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };

    case "SET_YEAR_FROM":
      return { ...state, yearFrom: action.payload };

    case "SET_YEAR_TO":
      return { ...state, yearTo: action.payload };

    case "SET_MOOD":
      return { ...state, mood: action.payload };

    // Add movie to compare list (max 2)
    case "ADD_TO_COMPARE":
      if (state.compareList.length >= 2) return state; // already full
      if (state.compareList.find(m => m.imdbID === action.payload.imdbID)) return state; // already in list
      return { ...state, compareList: [...state.compareList, action.payload] };

    // Remove one movie from compare list
    case "REMOVE_FROM_COMPARE":
      return {
        ...state,
        compareList: state.compareList.filter(m => m.imdbID !== action.payload)
      };

    // Empty the entire compare list
    case "CLEAR_COMPARE":
      return { ...state, compareList: [] };

    // Reset everything back to defaults
    case "CLEAR_ALL":
      return { ...initialState };

    default:
      return state;
  }
}
