//
// Simple API interface for backend connection
//

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// PUBLIC_INTERFACE
export async function fetchStocks({ filter = "", search = "", sort = "" } = {}) {
  /**
   * Fetches a list of stocks with optional filtering, searching, and sorting.
   * @param {Object} params - filter: recommendation ("buy"/"hold"/"sell"),
   *                         search: ticker symbol, sort: by field
   * @returns {Promise<Array>} - List of stock summary objects
   */
  let url = `${API_BASE}/stocks?`;
  const params = [];
  if (filter) params.push(`recommendation=${filter}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
  url += params.join("&");

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to fetch stocks");
  return resp.json();
}

// PUBLIC_INTERFACE
export async function fetchStockDetail(ticker) {
  /**
   * Fetches the detail for a specific ticker.
   * @param {string} ticker
   * @returns {Promise<Object>} - Stock detail object
   */
  const resp = await fetch(`${API_BASE}/stocks/${ticker}`);
  if (!resp.ok) throw new Error("Failed to fetch stock detail for " + ticker);
  return resp.json();
}
