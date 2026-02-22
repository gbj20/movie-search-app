// ============================================================
// main.jsx  (UPDATED)
// Added: ErrorBoundary wraps everything so if something crashes,
//        users see a nice message instead of a blank white screen.
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MovieSearchApp from "./MovieSearchApp.jsx"
import { ThemeProvider } from "./context/ThemeContext"
import ErrorBoundary from "./components/ErrorBoundary"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ErrorBoundary is the outermost wrapper - catches any crash */}
    <ErrorBoundary>
      {/* ThemeProvider gives dark/light theme access to all children */}
      <ThemeProvider>
        <MovieSearchApp />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
