import React, { useState, useEffect, useCallback } from "react";
import { fetchStocks, fetchStockDetail } from "./api";
import StockDetailModal from "./StockDetailModal";
import "./StockEvaluatorDashboard.css";

// Utility for color based on recommendation
const recColor = rec =>
  rec === "BUY"
    ? "#1976d2"
    : rec === "SELL"
      ? "#b71c1c"
      : "#fbc02d";

// Simple spark visual for score
function ScoreBar({ score }) {
  return (
    <div
      className="score-bar"
      title={`Score: ${score ?? "-"} / 100`}
      aria-label={`Score: ${score ?? "-"}/100`}
    >
      <div
        className="score-bar-fill"
        style={{
          width: (Number(score) || 0) + "%",
          background: `linear-gradient(90deg, #1976d2, #fbc02d ${score}%, #eee 100%)`,
        }}
      ></div>
      <span className="score-bar-label">{score ?? "-"}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function StockEvaluatorDashboard() {
  /**
   * Main dashboard for viewing analyzed S&P 500 stocks, applying filters/search, and seeing modals.
   */
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recFilter, setRecFilter] = useState(""); // "", "BUY", "HOLD", "SELL"
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("ticker");
  const [modalTicker, setModalTicker] = useState(null);
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Load main dashboard data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStocks({
        filter: recFilter,
        search,
        sort,
      });
      setStocks(data || []);
    } catch (e) {
      setError("Failed to load stocks. Please try again.");
    }
    setLoading(false);
  }, [recFilter, search, sort]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal logic: fetch detail when modalTicker changes
  useEffect(() => {
    if (!modalTicker) {
      setDetail(null);
      return;
    }
    setDetail(null);
    fetchStockDetail(modalTicker)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [modalTicker]);

  // For modals - open/close
  const openModal = ticker => { setModalTicker(ticker); setModalOpen(true); };
  const closeModal = () => { setModalTicker(null); setModalOpen(false); };

  // UI controls
  const handleFilter = evt => setRecFilter(evt.target.value);
  const handleSearch = evt => setSearch(evt.target.value);
  const handleSort = evt => setSort(evt.target.value);

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    if (!modalOpen) return;
    const handleEsc = e => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  // --- UI ---
  return (
    <main className="dashboard-main">
      <section className="dashboard-header">
        <h1>S&amp;P 500 Stock Evaluator</h1>
        <p className="dashboard-desc">Analyze, sort, and explore S&amp;P 500 recommendations based on real-time indicators.</p>
      </section>

      <aside className="dashboard-controls">
        <label>
          <span>Recommendation:{" "}</span>
          <select value={recFilter} onChange={handleFilter}>
            <option value="">All</option>
            <option value="BUY">Buy</option>
            <option value="HOLD">Hold</option>
            <option value="SELL">Sell</option>
          </select>
        </label>
        <label>
          <span>Sort by:{" "}</span>
          <select value={sort} onChange={handleSort}>
            <option value="ticker">Ticker</option>
            <option value="recommendation">Recommendation</option>
            <option value="score">Score</option>
          </select>
        </label>
        <label>
          <span>Search:{" "}</span>
          <input type="text" placeholder="AAPL, MSFT..." value={search} onChange={handleSearch} />
        </label>
        <button className="dashboard-refresh" onClick={loadData} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </aside>

      {error ? (
        <div className="dashboard-error">{error}</div>
      ) : (
        <section className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company</th>
                <th>Recommendation</th>
                <th>Score</th>
                <th>Indicators</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={5}>No results.</td>
                </tr>
              ) : (
                stocks.map(stock => (
                  <tr
                    key={stock.ticker}
                    tabIndex={0}
                    className="dashboard-row"
                    onClick={() => openModal(stock.ticker)}
                    onKeyPress={e => { if(e.key === "Enter") openModal(stock.ticker); }}
                    aria-label={`Open details for ${stock.ticker}`}
                  >
                    <td>{stock.ticker}</td>
                    <td>{stock.companyName}</td>
                    <td>
                      <span
                        className="rec-dot"
                        style={{
                          backgroundColor: recColor(stock.recommendation),
                          marginRight: 6,
                        }}
                      />
                      <span className={`rec-label rec-${(stock.recommendation || "HOLD").toLowerCase()}`}>
                        {stock.recommendation}
                      </span>
                    </td>
                    <td>
                      <ScoreBar score={stock.total_score} />
                    </td>
                    <td>
                      <button
                        onClick={e => { e.stopPropagation(); openModal(stock.ticker); }}
                        tabIndex={-1}
                        className="dashboard-detail-btn"
                        aria-label={`View indicator breakdown for ${stock.ticker}`}
                      >Breakdown</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      <StockDetailModal open={modalOpen} onClose={closeModal} stock={detail} />
    </main>
  );
}
