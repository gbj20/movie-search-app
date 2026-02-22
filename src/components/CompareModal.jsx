import { useState, useEffect } from "react";

const API_KEY = "894809ee";

// Props:
//   movies  - array of 2 basic movie objects (with imdbID)
//   onClose - called when user closes the modal
function CompareModal({ movies, onClose }) {

  const [details, setDetails] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  // Fetch FULL details for both movies at the same time
  useEffect(() => {
    const fetchBoth = async () => {
      setLoading(true);
      try {
        // Promise.all = run both fetches at the same time (faster!)
        const [dataA, dataB] = await Promise.all(
          movies.map(m =>
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${m.imdbID}&plot=short`)
              .then(r => r.json())
          )
        );
        setDetails([dataA, dataB]);
      } catch {
        // If fetch fails, fall back to basic data we already have
        setDetails(movies);
      } finally {
        setLoading(false);
      }
    };
    fetchBoth();
  }, []); // runs once when modal opens

  // Fields to compare (label shown in middle, key from API data)
  const fields = [
    { label: "📅 Year",      key: "Year" },
    { label: "⭐ IMDb Rating", key: "imdbRating" },
    { label: "⏱️ Runtime",   key: "Runtime" },
    { label: "🎬 Genre",     key: "Genre" },
    { label: "🎥 Director",  key: "Director" },
    { label: "🏆 Awards",    key: "Awards" },
    { label: "🌍 Language",  key: "Language" },
    { label: "🗳️ IMDb Votes", key: "imdbVotes" },
  ];

  // Figure out which movie has a higher rating
  const getWinner = () => {
    const [a, b] = details;
    if (!a || !b) return [null, null];
    const rA = parseFloat(a.imdbRating);
    const rB = parseFloat(b.imdbRating);
    if (isNaN(rA) || isNaN(rB)) return [null, null];
    if (rA > rB) return ["winner", "loser"];
    if (rB > rA) return ["loser", "winner"];
    return ["tie", "tie"];
  };

  const [statusA, statusB] = getWinner();
  const [a, b] = details;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button className="close-button" onClick={onClose}>✕</button>

        <h2 className="compare-title">⚔️ Movie Battle</h2>

        {loading ? (
          <div className="compare-loading">
            <div className="spinner"></div>
            <p>Loading movie details...</p>
          </div>
        ) : (
          <>
            {/* Top section: both movie posters and titles */}
            <div className="compare-header-row">
              <div className={`compare-movie-header ${statusA || ""}`}>
                {a?.Poster && a.Poster !== "N/A" && (
                  <img src={a.Poster} alt={a?.Title} className="compare-poster" />
                )}
                <h3>{a?.Title}</h3>
                {statusA === "winner" && <span className="winner-badge">🏆 Winner!</span>}
                {statusA === "tie"    && <span className="tie-badge">🤝 Tie</span>}
              </div>

              <div className="vs-badge">VS</div>

              <div className={`compare-movie-header ${statusB || ""}`}>
                {b?.Poster && b.Poster !== "N/A" && (
                  <img src={b.Poster} alt={b?.Title} className="compare-poster" />
                )}
                <h3>{b?.Title}</h3>
                {statusB === "winner" && <span className="winner-badge">🏆 Winner!</span>}
                {statusB === "tie"    && <span className="tie-badge">🤝 Tie</span>}
              </div>
            </div>

            {/* Comparison table */}
            <div className="compare-table">
              {fields.map(field => (
                <div key={field.key} className="compare-row">
                  <div className="compare-cell left">{a?.[field.key] || "N/A"}</div>
                  <div className="compare-label">{field.label}</div>
                  <div className="compare-cell right">{b?.[field.key] || "N/A"}</div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CompareModal;
