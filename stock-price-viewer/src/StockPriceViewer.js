import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './StockPriceViewer.css';

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
  const [isLoading, setIsLoading] = useState(false);
  const [stockPrices, setStockPrices] = useState([0]);

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
      setIsLoading(true);
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

        const costOfShares = newInvestment.purchasePrice * newInvestment.shares;
        setCurrentBalance(prevBalance => prevBalance - costOfShares);

        setPortfolio([...portfolio, newInvestment]);
        setTicker('');
        setShares('');
        setStartDate('');
        setError(null);

        setTotalPortfolioValue(prevValue => prevValue + data.finalInvestment);

        addStockPrice(); // Update chart with new total account value
      } catch (error) {
        console.error('Error fetching stock price:', error);
        setError('Failed to fetch stock data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addStockPrice = () => {
    const totalAccountValue = parseFloat(totalPortfolioValue) + parseFloat(currentBalance); // Total account value
    const difference = totalAccountValue - parseFloat(startingBalance); // Growth or decline from starting balance
    setStockPrices((prevPrices) => [...prevPrices, difference]); // Add difference to chart
  };

  const data = {
    labels: stockPrices.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: 'Stock Prices',
        data: stockPrices,
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={`stock-price-viewer ${darkMode ? 'dark-mode' : ''}`}>
      <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-btn">
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <h1>Stock Price Checker</h1>
      
      <form onSubmit={handleNextStep} className="form">
        {step === 1 && (
          <div className="form-group">
            <label htmlFor="startingBalance">Starting Balance:</label>
            <input
              type="number"
              id="startingBalance"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              required
            />
          </div>
        )}
        {step === 2 && (
          <>
            <div className="form-group">
              <label htmlFor="ticker">Ticker Symbol:</label>
              <input
                type="text"
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="shares">Number of Shares:</label>
              <input
                type="number"
                id="shares"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Start Date (YYYY-MM-DD):</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : (step === 1 ? 'Set Starting Balance' : 'Add Investment')}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="portfolio">
        <h2>Portfolio</h2>
        {portfolio.map((investment, index) => (
          <div key={index} className="investment">
            <p>{investment.ticker} - {investment.shares} shares @ ${investment.purchasePrice.toFixed(2)} on {investment.purchaseDate}</p>
          </div>
        ))}
        <div className="portfolio-summary">
          <p><strong>Total Portfolio Value:</strong> ${totalPortfolioValue.toFixed(2)}</p>
          <p><strong>Remaining Balance:</strong> ${currentBalance.toFixed(2)}</p>
          <p><strong>Total Account Value:</strong> ${(parseFloat(totalPortfolioValue) + parseFloat(currentBalance)).toFixed(2)}</p>
          <p className={`percent-change ${parseFloat(totalPortfolioValue) + parseFloat(currentBalance) > parseFloat(startingBalance) ? 'positive' : 'negative'}`}>
            <strong>Percent Change:</strong> {(((parseFloat(totalPortfolioValue) + parseFloat(currentBalance) - parseFloat(startingBalance)) / parseFloat(startingBalance)) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="chart-container">
        <Line data={data} options={{ maintainAspectRatio: true }} height={250} />
      </div>

      <div className="footer">
        <button onClick={addStockPrice} className="add-price-btn">
          Add Stock Price Change
        </button>
      </div>
    </div>
  );
}

export default StockPriceViewer;