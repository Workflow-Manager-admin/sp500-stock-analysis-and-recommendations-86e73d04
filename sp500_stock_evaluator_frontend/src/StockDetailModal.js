import React from "react";
import "./StockDetailModal.css";

// PUBLIC_INTERFACE
export default function StockDetailModal({ open, onClose, stock }) {
  /**
   * Modal for displaying per-ticker details with indicator breakdown.
   * @param {Object} props:
   *    open (bool): whether modal is open,
   *    onClose (func): callback to close,
   *    stock (object): stock detail data (may be null).
   */
  if (!open || !stock) return null;

  return (
    <div className="modal-overlay" onClick={onClose} tabIndex={-1}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close Detail">&times;</button>
        <h2>
          {stock.ticker} – {stock.companyName}
        </h2>
        <div className="modal-section">
          <strong>Recommendation:</strong>{" "}
          <span className={`rec-badge rec-${stock.recommendation?.toLowerCase() || "hold"}`}>
            {stock.recommendation}
          </span>
          <span className="modal-score">
            <b>Score: </b>{stock.total_score ?? "-"} / 100
          </span>
        </div>
        <div className="modal-section">
          <h3>Indicator Breakdown</h3>
          <table className="indicator-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
                <th>Score</th>
                <th>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {stock.indicators && Object.entries(stock.indicators).map(([indName, detail]) => (
                <tr key={indName}>
                  <td>{indName}</td>
                  <td>{detail.value ?? "-"}</td>
                  <td>{detail.score !== undefined ? detail.score : "-"}</td>
                  <td>{detail.weight !== undefined ? (detail.weight * 100).toFixed(0) + "%" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-section">
          <strong>Last Updated:</strong>{" "}
          <span className="modal-mutedsmall">
            {stock.last_updated || "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}
