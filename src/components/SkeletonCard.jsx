// ============================================================
// SkeletonCard.jsx  (NEW FILE)
// Shows an animated "shimmer" placeholder card while movies load.
// This is much better UX than a blank screen or spinner.
// We render 8 of these while waiting for the API response.
// ============================================================

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      {/* Fake poster area */}
      <div className="skeleton-poster shimmer"></div>
      {/* Fake title and year */}
      <div className="skeleton-info">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-year shimmer"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;
