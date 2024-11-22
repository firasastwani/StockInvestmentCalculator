// src/StockPriceViewer.js
import React, { useState, useEffect } from 'react';

function StockPriceViewer() {
  const [startingBalance, setStartingBalance] = useState('');
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [startDate, setStartDate] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#333' : '#fff';
    document.body.style.color = darkMode ? '#fff' : '#000';
  }, [darkMode]);

  const handleNextStep = async (event) => {
    event.preventDefault();
    if (step === 1) {
      setCurrentBalance(parseFloat(startingBalance));
      setStep(2);
    } else if (step === 2) {
      try {
        const response = await fetch(`http://localhost:8080/stock?ticker=${ticker}&startDate=${startDate}&shares=${shares}&startingBalance=${currentBalance}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const newInvestment = {
          ticker,
          shares: parseFloat(shares),
          purchaseDate: startDate,
          purchasePrice: data.initialInvestment / parseFloat(shares),
        };

        setPortfolio([...portfolio, newInvestment]);
        setCurrentBalance(data.newBalance);
        setTicker('');
        setShares('');
        setStartDate('');
        setError(null);

        setTotalPortfolioValue(prevValue => prevValue + data.initialInvestment);

      } catch (error) {
        console.error('Error fetching stock price:', error);
        setError('Failed to fetch stock data');
      }
    }
  };

  const calculatePortfolioValue = async () => {
    let totalValue = 0;
    for (const investment of portfolio) {
      const response = await fetch(`http://localhost:8080/stockinfo?ticker=${investment.ticker}&date=${new Date().toISOString().split('T')[0]}`);
      const data = await response.json();
      totalValue += data.price * investment.shares;
    }
    return totalValue;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: darkMode ? '#444' : '#f9f9f9',
      color: darkMode ? '#fff' : '#000',
      position: 'relative'
    }}>
      <button 
        onClick={toggleDarkMode} 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: darkMode ? '#555' : '#ddd',
          color: darkMode ? '#fff' : '#000',
          border: 'none',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <h1>Stock Price Checker</h1>
      <form onSubmit={handleNextStep}>
        {step === 1 && (
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
        )}
        {step === 2 && (
          <>
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
          </>
        )}
        <button type="submit" style={{ width: '100%' }}>
          {step === 1 ? 'Set Starting Balance' : 'Add Investment'}
        </button>
      </form>

      <button onClick={async () => {
        const portfolioValue = await calculatePortfolioValue();
        alert(`Current Portfolio Value: $${portfolioValue.toFixed(2)}`);
      }} style={{ width: '100%', marginTop: '10px' }}>
        Check Portfolio Value
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div>
        <h2>Portfolio</h2>
        {portfolio.map((investment, index) => (
          <div key={index}>
            <p>{investment.ticker} - {investment.shares} shares @ ${investment.purchasePrice.toFixed(2)} on {investment.purchaseDate}</p>
          </div>
        ))}
        <p>Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default StockPriceViewer;
