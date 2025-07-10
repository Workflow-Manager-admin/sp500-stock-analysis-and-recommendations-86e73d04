import React, { useEffect, useState, useMemo } from "react";
import "./App.css";

// Color palette and theme vars (used in App.css):
// --primary: #1976d2; --secondary: #90caf9; --accent: #fbc02d

/** Utility: Fetch with fallback to mock sample data if backend is unavailable */
async function fetchStocks() {
  try {
    const res = await fetch("/stocks");
    if (!res.ok) throw new Error("Backend not available");
    return await res.json();
  } catch (e) {
    // Fallback to static sample data if backend fails
    return [
      {
        ticker: "AAPL",
        company: "Apple Inc.",
        sector: "Information Technology",
        recommendation: "BUY",
        score: 87,
        indicators: {
          pe_ratio: 23,
          debt_to_equity: 1.5,
          dividend_yield: 0.6,
          eps_growth: 15,
        },
      },
      {
        ticker: "MSFT",
        company: "Microsoft Corp.",
        sector: "Information Technology",
        recommendation: "HOLD",
        score: 69,
        indicators: {
          pe_ratio: 28,
          debt_to_equity: 0.7,
          dividend_yield: 0.8,
          eps_growth: 12,
        },
      },
      {
        ticker: "JPM",
        company: "JPMorgan Chase & Co.",
        sector: "Financials",
        recommendation: "SELL",
        score: 48,
        indicators: {
          pe_ratio: 10,
          debt_to_equity: 2.1,
          dividend_yield: 2.3,
          eps_growth: 1.5,
        },
      }
    ];
  }
}

/** Fetch breakdown for a single ticker */
async function fetchStockDetails(ticker) {
  try {
    const res = await fetch(`/stocks/${ticker}`);
    if (!res.ok) throw new Error("Backend not available");
    return await res.json();
  } catch (e) {
    // Fallback: return extra details for sample tickers if backend down
    if (ticker === "AAPL") {
      return {
        indicators: {
          pe_ratio: 23,
          pe_ratio_recommend: "BUY",
          debt_to_equity: 1.5,
          debt_to_equity_recommend: "BUY",
          dividend_yield: 0.6,
          dividend_yield_recommend: "HOLD",
          eps_growth: 15,
          eps_growth_recommend: "BUY",
        },
        rationale: "Strong earnings growth and healthy indicators."
      };
    } else if (ticker === "MSFT") {
      return {
        indicators: {
          pe_ratio: 28,
          pe_ratio_recommend: "HOLD",
          debt_to_equity: 0.7,
          debt_to_equity_recommend: "BUY",
          dividend_yield: 0.8,
          dividend_yield_recommend: "BUY",
          eps_growth: 12,
          eps_growth_recommend: "HOLD",
        },
        rationale: "Stable performance but price is high."
      };
    } else if (ticker === "JPM") {
      return {
        indicators: {
          pe_ratio: 10,
          pe_ratio_recommend: "SELL",
          debt_to_equity: 2.1,
          debt_to_equity_recommend: "SELL",
          dividend_yield: 2.3,
          dividend_yield_recommend: "BUY",
          eps_growth: 1.5,
          eps_growth_recommend: "SELL",
        },
        rationale: "Low growth and high leverage concerns."
      };
    }
    return {};
  }
}

const RECOMMENDATION_COLORS = {
  BUY: "var(--accent, #fbc02d)",
  HOLD: "#90caf9",
  SELL: "#d32f2f",
};

/** Visualize recommendation as color chip */
function RecommendationChip({ value }) {
  return (
    <span
      style={{
        background: RECOMMENDATION_COLORS[value] || "#bbb",
        color: "#111",
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 14,
        textShadow: "0 1px 2px rgba(255,255,255,0.08)",
      }}
    >
      {value}
    </span>
  );
}

/** Show a simple circular progress for the score */
function ScoreCircle({ score = 50, size = 32 }) {
  const radius = size / 2 - 4;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(Math.min(score, 100), 0) / 100;
  return (
    <svg width={size} height={size} style={{ verticalAlign: "middle" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1976d2"
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: "stroke-dashoffset 350ms linear" }}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="1em"
        fontWeight="bold"
        fill="#222"
      >
        {score}
      </text>
    </svg>
  );
}

/** Modal dialog for indicator breakdown */
function IndicatorBreakdownModal({ open, ticker, company, onClose }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (open && ticker) {
      fetchStockDetails(ticker).then(setDetails);
    } else {
      setDetails(null);
    }
  }, [open, ticker]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          minWidth: 320,
          maxWidth: 420,
          padding: 24,
          background: "var(--bg-primary,#fff)",
          color: "var(--text-primary)",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          margin: "7vh auto",
          zIndex: 200,
          position: "relative"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 16,
            top: 12,
            background: "none",
            border: "none",
            color: "#888",
            fontSize: 22,
            fontWeight: 900,
            cursor: "pointer",
          }}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 id="modal-title" style={{ marginTop: 6, marginBottom: 18 }}>
          {company || ticker} - Indicator Breakdown
        </h2>
        {details ? (
          <div>
            <table className="indicator-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontWeight: 600 }}>Indicator</th>
                  <th style={{ textAlign: "left" }}>Value</th>
                  <th style={{ textAlign: "left" }}>Rec</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(details.indicators || {}).reduce((arr, [k, v]) => {
                  if (k.endsWith("_recommend")) return arr;
                  const rec = details.indicators[k + "_recommend"];
                  arr.push(
                    <tr key={k}>
                      <td>{k.replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase())}</td>
                      <td>{typeof v === "number" ? v : String(v)}</td>
                      <td>
                        {rec ? <RecommendationChip value={rec} /> : ""}
                      </td>
                    </tr>
                  );
                  return arr;
                }, [])}
              </tbody>
            </table>
            <div style={{ marginTop: 18 }}>
              <strong>Rationale:</strong>
              <span style={{ marginLeft: 8 }}>{details.rationale}</span>
            </div>
          </div>
        ) : (
          <p>Loading breakdown...</p>
        )}
      </div>
    </div>
  );
}

/** Stock table row */
function StockRow({ stock, onClickDetails }) {
  return (
    <tr>
      <td
        style={{
          fontWeight: 700,
          color: "#1976d2",
          cursor: "pointer",
          textDecoration: "underline",
          minWidth: 70,
        }}
        onClick={() => onClickDetails(stock.ticker, stock.company)}
        tabIndex={0}
        aria-label={`Open details for ${stock.ticker}`}
      >
        {stock.ticker}
      </td>
      <td>{stock.company}</td>
      <td className="hide-mobile">{stock.sector}</td>
      <td>
        <RecommendationChip value={stock.recommendation} />
      </td>
      <td>
        <ScoreCircle score={stock.score} size={36} />
      </td>
      <td>
        <button
          className="indicator-btn"
          onClick={() => onClickDetails(stock.ticker, stock.company)}
          style={{
            background: "#fff",
            color: "#1976d2",
            padding: "4px 12px",
            border: "1px solid #90caf9",
            borderRadius: 8,
            fontWeight: 500,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Details
        </button>
      </td>
    </tr>
  );
}

/** Dashboard Sidebar (Filter/Search) */
function DashboardSidebar({ filter, setFilter, search, setSearch }) {
  return (
    <aside className="dashboard-sidebar">
      <div style={{ marginBottom: 28, fontWeight: 600, fontSize: 22, letterSpacing: ".5px" }}>
        <span role="img" aria-label="stocks" style={{ marginRight: 8 }}>📊</span>
        Filters
      </div>
      <div className="sidebar-group">
        <label htmlFor="recommendation-filter">Recommendation:</label>
        <select
          id="recommendation-filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="BUY">Buy</option>
          <option value="HOLD">Hold</option>
          <option value="SELL">Sell</option>
        </select>
      </div>
      <div className="sidebar-group" style={{ marginTop: 18 }}>
        <label htmlFor="ticker-search">Search Ticker:</label>
        <input
          id="ticker-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value.toUpperCase())}
          placeholder="AAPL, GOOG, etc."
          autoComplete="off"
          style={{ border: "1px solid #1976d2", borderRadius: 8, padding: 6 }}
        />
      </div>
    </aside>
  );
}

/** PUBLIC_INTERFACE */
function App() {
  const [theme, setTheme] = useState("light");

  // Stock data
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering and searching
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTicker, setModalTicker] = useState("");
  const [modalCompany, setModalCompany] = useState("");

  // Effect: fetch initial data
  useEffect(() => {
    setLoading(true);
    fetchStocks().then(data => {
      setStocks(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  // Theme effect (applies data-theme to root)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Filtering & sorting stocks
  const filteredStocks = useMemo(() => {
    return stocks
      .filter(
        s =>
          (!filter || s.recommendation === filter) &&
          (!search || s.ticker.toUpperCase().includes(search.toUpperCase()))
      )
      .sort((a, b) => {
        if (sortKey === "score") {
          return sortDir === "desc" ? b.score - a.score : a.score - b.score;
        } else if (sortKey === "ticker") {
          return sortDir === "asc"
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        } else if (sortKey === "recommendation") {
          return sortDir === "asc"
            ? a.recommendation.localeCompare(b.recommendation)
            : b.recommendation.localeCompare(a.recommendation);
        }
        return 0;
      });
  }, [stocks, filter, search, sortKey, sortDir]);

  function openModal(ticker, company) {
    setModalTicker(ticker);
    setModalCompany(company);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalTicker("");
    setModalCompany("");
  }

  /** PUBLIC_INTERFACE */
  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 28px",
          background: "var(--primary, #1976d2)",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: ".02em",
            letterSpacing: "1.2px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <span style={{
            background: "#fbc02d",
            color: "#1976d2",
            borderRadius: 8,
            fontWeight: 900,
            marginRight: 10,
            padding: "0 7px",
          }}>S&P 500</span>
          <span>
            Stock Evaluator
          </span>
        </div>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          style={{
            background: "var(--secondary, #90caf9)",
            color: "#122",
            fontWeight: 500,
            fontSize: 15,
            border: "none",
            borderRadius: 8,
            padding: "7px 20px",
            marginLeft: 10,
          }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      <main className="dashboard-main" style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 56px)"
      }}>
        <DashboardSidebar
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />
        <section className="dashboard-content" style={{
          flex: 1,
          padding: "32px 2vw 32px 2vw",
          minWidth: 0
        }}>
          <div style={{
            fontSize: 18,
            margin: "0 0 16px 2px",
            color: "var(--primary, #1976d2)",
            fontWeight: 540
          }}>
            Recommendations Dashboard
          </div>
          <div
            style={{
              background: "var(--bg-secondary, #f8f9fa)",
              border: "1px solid var(--border-color, #e9ecef)",
              borderRadius: 12,
              padding: "14px 10px 7px 10px",
              boxShadow: "0px 1px 8px 0 rgb(30 50 132 / 7%)",
            }}
          >
            {loading ? (
              <div style={{ padding: 40, fontWeight: 500, fontSize: 17 }}>
                Loading stocks...
              </div>
            ) : (
              <table
                className="stock-table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "transparent",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2.5px solid #90caf9"}}>
                    <th
                      onClick={() => handleSort("ticker")}
                      style={{
                        cursor: "pointer",
                        color: sortKey === "ticker" ? "#fbc02d" : "#1976d2",
                        userSelect: "none",
                        fontWeight: 700,
                        paddingBottom: 5,
                      }}
                    >
                      Ticker {sortKey === "ticker" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th>Company</th>
                    <th className="hide-mobile">Sector</th>
                    <th
                      onClick={() => handleSort("recommendation")}
                      style={{
                        cursor: "pointer",
                        color: sortKey === "recommendation" ? "#fbc02d" : "#1976d2",
                        fontWeight: 700,
                        userSelect: "none",
                        paddingBottom: 5,
                      }}
                    >
                      Rec {sortKey === "recommendation" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("score")}
                      style={{
                        cursor: "pointer",
                        color: sortKey === "score" ? "#fbc02d" : "#1976d2",
                        fontWeight: 700,
                        userSelect: "none",
                        paddingBottom: 5,
                      }}
                    >
                      Score {sortKey === "score" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <StockRow
                        key={stock.ticker}
                        stock={stock}
                        onClickDetails={openModal}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, color: "#888" }}>
                        No stocks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
      <IndicatorBreakdownModal
        open={modalOpen}
        ticker={modalTicker}
        company={modalCompany}
        onClose={closeModal}
      />
      {/* Footer for attribution */}
      <footer
        style={{
          fontSize: 13,
          textAlign: "center",
          color: "#aaa",
          background: "#fafbfd",
          padding: "16px 0",
          marginTop: 28,
          borderTop: "1px solid #eaecef",
        }}
      >
        Powered by S&P 500 Stock Evaluator &middot; Data via yfinance
      </footer>
    </div>
  );
}

export default App;
