// ============================================================
// MoodFilter.jsx  (NEW FILE)
// The "What's your mood?" feature.
// Each mood button maps to a search query sent to OMDb.
// Zero backend needed — purely frontend creative thinking!
// ============================================================

// Each mood has: emoji, display label, and what we search for
const MOODS = [
  { emoji: "😂", label: "Funny",   query: "comedy" },
  { emoji: "😱", label: "Scary",   query: "horror" },
  { emoji: "💘", label: "Romance", query: "romance" },
  { emoji: "💥", label: "Action",  query: "action thriller" },
  { emoji: "🤔", label: "Mystery", query: "mystery detective" },
  { emoji: "🚀", label: "Sci-Fi",  query: "science fiction space" },
  { emoji: "🎭", label: "Drama",   query: "drama emotional" },
  { emoji: "🧒", label: "Family",  query: "family animation" },
];

// Props:
//   activeMood  - the label of currently selected mood (or null)
//   onMoodSelect - function called when user clicks a mood
function MoodFilter({ activeMood, onMoodSelect }) {
  return (
    <div className="mood-filter">
      <p className="mood-title">🎭 What's your mood today?</p>
      <div className="mood-buttons">
        {MOODS.map((mood) => (
          <button
            key={mood.label}
            className={`mood-btn ${activeMood === mood.label ? "active" : ""}`}
            onClick={() => onMoodSelect(mood)}
            title={`Search ${mood.label} movies`}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodFilter;
