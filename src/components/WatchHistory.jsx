// ============================================================
// WatchHistory.jsx  (NEW FILE)
// Shows a timeline of all movies the user has clicked on.
// Data is stored in localStorage so it persists after refresh.
// ============================================================

// Props:
//   history       - array of { Title, Year, Poster, imdbID, viewedAt }
//   onSelectMovie - called when user clicks a history item (opens modal)
//   onClear       - called when user clicks "Clear All"
function WatchHistory({ history, onSelectMovie, onClear }) {

  // Show empty state if no history yet
  if (history.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: "60px" }}>🕐</span>
        <p style={{ marginTop: "16px", fontSize: "18px" }}>
          No history yet! Click on any movie to start.
        </p>
      </div>
    );
  }

  // Format the timestamp nicely: "Feb 19, 2:30 PM"
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="watch-history">

      {/* Header row with title and clear button */}
      <div className="history-header">
        <h3>🕐 Watch History ({history.length} movies)</h3>
        <button className="clear-history-btn" onClick={onClear}>
          🗑️ Clear All
        </button>
      </div>

      {/* The timeline */}
      <div className="history-timeline">
        {history.map((item, index) => (
          <div
            key={`${item.imdbID}_${index}`}
            className="history-item"
            onClick={() => onSelectMovie(item.imdbID)}
            title="Click to view details"
          >
            {/* The dot on the left of the timeline */}
            <div className="timeline-dot"></div>

            {/* The card on the right */}
            <div className="history-card">
              {item.Poster && item.Poster !== "N/A" ? (
                <img
                  src={item.Poster}
                  alt={item.Title}
                  className="history-poster"
                />
              ) : (
                <div className="history-poster-placeholder">🎬</div>
              )}
              <div className="history-info">
                <p className="history-title">{item.Title}</p>
                <p className="history-year">{item.Year}</p>
                <p className="history-time">👁️ {formatTime(item.viewedAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WatchHistory;
