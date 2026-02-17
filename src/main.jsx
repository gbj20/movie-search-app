import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MovieSearchApp from "./MovieSearchApp.jsx";
import { ThemeProvider } from "./context/ThemeContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <MovieSearchApp />
    </ThemeProvider>
  </StrictMode>,
);
