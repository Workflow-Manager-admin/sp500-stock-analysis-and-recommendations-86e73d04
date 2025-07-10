import React, { useState, useEffect } from "react";
import "./App.css";
import StockEvaluatorDashboard from "./StockEvaluatorDashboard";

// PUBLIC_INTERFACE
function App() {
  /**
   * Root app component for S&P 500 Stock Evaluator.
   * Manages theme control and displays dashboard.
   */
  const [theme, setTheme] = useState("light");

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        style={{ position: "fixed", zIndex: 2002 }}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <StockEvaluatorDashboard />
    </div>
  );
}

export default App;
