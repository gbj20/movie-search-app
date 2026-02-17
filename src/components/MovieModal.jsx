import React, { useState } from "react";

function MovieModal({ movie, onClose }) {

  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {

    if (!movie) return;

    try {
      setLoading(true);

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.text(movie.Title || "Movie", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Year: ${movie.Year || "N/A"}`, 20, 40);
      doc.text(`Rating: ${movie.imdbRating || "N/A"}`, 20, 50);
      doc.text(`Runtime: ${movie.Runtime || "N/A"}`, 20, 60);

      const plot = movie.Plot || "No plot available.";
      const lines = doc.splitTextToSize(plot, 170);
      doc.text(lines, 20, 80);

      const safeTitle = (movie.Title || "Movie").replace(/[^a-z0-9]/gi, "_");
      doc.save(`${safeTitle}.pdf`);

    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-button"
          onClick={onClose}
        >
          ✕
        </button>
        <button
          className="pdf-download-button-top"
          onClick={generatePDF}
          disabled={loading}
        >
          {loading ? (
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

            {movie.Poster && movie.Poster !== "N/A" && (
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="detail-poster"
              />
            )}

            <div className="movie-info-section">

              <h2>{movie.Title}</h2>

              <div className="movie-meta">
                <span className="meta-item">
                  <strong>Year:</strong> {movie.Year || "N/A"}
                </span>
                <span className="meta-item">
                  <strong>Rating:</strong> ⭐ {movie.imdbRating || "N/A"}
                </span>
                <span className="meta-item">
                  <strong>Runtime:</strong> {movie.Runtime || "N/A"}
                </span>
              </div>

              <div className="detail-info">
                <p><strong>Genre:</strong> {movie.Genre || "N/A"}</p>
                <p><strong>Director:</strong> {movie.Director || "N/A"}</p>
                <p><strong>Cast:</strong> {movie.Actors || "N/A"}</p>
              </div>

            </div>

          </div>

          <div className="plot-section">
            <h3>Description</h3>
            <p>{movie.Plot || "No plot available."}</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default MovieModal;
