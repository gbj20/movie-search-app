import { useState } from "react";
function MovieModal({ movie, onClose }) {

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);   
  const getImageBase64 = async (url) => {
    const blobToBase64 = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);  
        reader.onerror  = reject;
        reader.readAsDataURL(blob);
      });

    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      return await blobToBase64(blob);
    } catch {
    }

    try {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res   = await fetch(proxy);
      const blob  = await res.blob();
      return await blobToBase64(blob);
    } catch {
      return null;
    }
  };

  const generatePDF = async () => {
    if (!movie) return;
    try {
      setLoading(true);
      const { jsPDF } = await import("jspdf");
      const doc        = new jsPDF();
      const pageWidth  = doc.internal.pageSize.getWidth();   
      const pageHeight = doc.internal.pageSize.getHeight();  
      const margin     = 15;
      doc.setFillColor(20, 18, 60);                     
      doc.rect(0, 0, pageWidth, 46, "F");
      doc.setFillColor(129, 140, 248);
      doc.rect(0, 46, pageWidth, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(movie.Title || "Movie", pageWidth - 30);
      doc.text(titleLines, pageWidth / 2, 18, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(180, 185, 255);
      const sub = [
        movie.Year,
        movie.Runtime,
        movie.imdbRating && movie.imdbRating !== "N/A" ? `IMDb ${movie.imdbRating}/10` : null,
      ].filter(Boolean).join("   |   ");
      doc.text(sub, pageWidth / 2, 38, { align: "center" });

      const posterX = margin;
      const posterY = 56;
      const posterW = 58;
      const posterH = 87; 

      const posterUrl = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
      const posterB64 = posterUrl ? await getImageBase64(posterUrl) : null;

      if (posterB64) {
        doc.addImage(posterB64, "JPEG", posterX, posterY, posterW, posterH);
        doc.setDrawColor(129, 140, 248);
        doc.setLineWidth(0.6);
        doc.rect(posterX, posterY, posterW, posterH);
      } else {
        // Placeholder if image couldn't load
        doc.setFillColor(30, 27, 80);
        doc.rect(posterX, posterY, posterW, posterH, "F");
        doc.setTextColor(130, 130, 180);
        doc.setFontSize(8);
        doc.text("No Image", posterX + posterW / 2, posterY + posterH / 2 - 2, { align: "center" });
        doc.text("Available",  posterX + posterW / 2, posterY + posterH / 2 + 5, { align: "center" });
      }

      const col2X     = posterX + posterW + 10;
      const col2Width = pageWidth - col2X - margin;
      let   detailY   = posterY + 2;
      const lineH     = 5;   
      const fieldGap  = 3;    

      const field = (label, value, y) => {
        if (!value || value === "N/A") return y;  

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 170);
        doc.text(label.toUpperCase(), col2X, y);
        y += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(25, 25, 55);
        const lines = doc.splitTextToSize(value, col2Width);
        doc.text(lines, col2X, y);
        y += lines.length * lineH + fieldGap;

        return y;
      };

      detailY = field("Genre",    movie.Genre,    detailY);
      detailY = field("Director", movie.Director, detailY);
      detailY = field("Cast",     movie.Actors,   detailY);
      detailY = field("Language", movie.Language, detailY);
      detailY = field("Country",  movie.Country,  detailY);
      detailY = field("Awards",   movie.Awards,   detailY);
      const divY = Math.max(posterY + posterH, detailY) + 8;
      doc.setDrawColor(200, 200, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, divY, pageWidth - margin, divY);

      let plotY = divY + 9;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(80, 90, 220);
      doc.text("Description", margin, plotY);
      plotY += 7;

      // Plot body text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 65);
      const plotLines = doc.splitTextToSize(
        movie.Plot || "No plot available.",
        pageWidth - margin * 2
      );
      doc.text(plotLines, margin, plotY);
      doc.setDrawColor(210, 210, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 190);
      doc.text(
        `Generated by CineSearch  •  Source: OMDb API  •  IMDb ID: ${movie.imdbID || "N/A"}`,
        pageWidth / 2,
        pageHeight - 9,
        { align: "center" }
      );

      const safeName = (movie.Title || "Movie").replace(/[^a-z0-9]/gi, "_");
      doc.save(`${safeName}_CineSearch.pdf`);

    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };
  const shareMovie = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("movie", movie.imdbID);

    navigator.clipboard.writeText(url.toString())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500); 
      })
      .catch(() => {
        alert(`Share this link:\n${url.toString()}`);
      });
  };

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="close-button" onClick={onClose}>✕</button>

        <div className="modal-action-buttons">
          <button
            className="pdf-download-button-top"
            onClick={generatePDF}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner"></span><span className="pdf-text">Generating...</span></>
            ) : (
              <><span className="pdf-icon">📄</span><span className="pdf-text">Download PDF</span></>
            )}
          </button>
          <button className="share-button" onClick={shareMovie}>
            {copied ? "Link Copied!" : "🔗 Share"}
          </button>
        </div>

        {/* Movie details */}
        <div className="movie-details">
          <div className="movie-header">

            {movie.Poster && movie.Poster !== "N/A" && (
              <img src={movie.Poster} alt={movie.Title} className="detail-poster" />
            )}

            <div className="movie-info-section">
              <h2>{movie.Title}</h2>

              <div className="movie-meta">
                <span className="meta-item"><strong>Year:</strong> {movie.Year || "N/A"}</span>
                <span className="meta-item"><strong>Rating:</strong> ⭐ {movie.imdbRating || "N/A"}</span>
                <span className="meta-item"><strong>Runtime:</strong> {movie.Runtime || "N/A"}</span>
              </div>

              <div className="detail-info">
                <p><strong>Genre:</strong> {movie.Genre || "N/A"}</p>
                <p><strong>Director:</strong> {movie.Director || "N/A"}</p>
                <p><strong>Cast:</strong> {movie.Actors || "N/A"}</p>
                <p><strong>Language:</strong> {movie.Language || "N/A"}</p>
                <p><strong>Awards:</strong> {movie.Awards || "N/A"}</p>
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