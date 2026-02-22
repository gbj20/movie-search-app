// ============================================================
// ErrorBoundary.jsx  (NEW FILE)
// This is a special React class component.
// If anything inside it crashes, it catches the error
// and shows a friendly message instead of a blank white screen.
// 
// NOTE: Error boundaries MUST be class components (React rule).
// ============================================================

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // React calls this automatically when a child component crashes
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Also called on crash - good place to log errors
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-box">
            <span className="error-boundary-icon">😵</span>
            <h2>Oops! Something went wrong.</h2>
            <p>Don't worry — this happens sometimes.</p>
            <p className="error-boundary-detail">
              {this.state.error?.message}
            </p>
            <button
              className="error-boundary-btn"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }

    // No error? Just render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
