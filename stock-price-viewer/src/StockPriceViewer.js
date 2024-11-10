// src/StockPriceViewer.js
import React, { useState } from 'react';

function StockPriceViewer() {
  const [ticker, setTicker] = useState('');
  const [startingBalance, setStartingBalance] = useState('');
  const [shares, setShares] = useState('');
  const [startDate, setStartDate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`/stock?ticker=${ticker}&startingBalance=${startingBalance}&shares=${shares}&startDate=${startDate}`);
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock data');
      setResult(null);
    }
  };

  const fetchStockData = () => {
    fetch('http://localhost:8080/stock?ticker=QQQ&startDate=2024-08-07&shares=2&startingBalance=1000')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => {
        console.error('Error fetching stock data:', error);
        setError('Failed to fetch stock data');
      });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Stock Price Checker</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="ticker">Ticker Symbol:</label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="startingBalance">Starting Balance:</label>
          <input
            type="number"
            id="startingBalance"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="shares">Number of Shares:</label>
          <input
            type="number"
            id="shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="startDate">Start Date (YYYY-MM-DD):</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>Check</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && (
        <div>
          <p>Initial Investment: ${result.initialInvestment.toFixed(2)}</p>
          <p>Final Investment: ${result.finalInvestment.toFixed(2)}</p>
          <p>New Balance: ${result.newBalance.toFixed(2)}</p>
        </div>
      )}

      <button onClick={fetchStockData}>Check</button>
    </div>
  );
}

export default StockPriceViewer;