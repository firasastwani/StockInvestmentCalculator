# Stock Investment Calculator API

A simple Go-based web service with a React frontend that calculates investment returns based on historical stock data using the Alpha Vantage API.

## Features

- Fetches historical stock prices using Alpha Vantage API
- Calculates investment returns between a start date and current date
- Handles weekend dates by adjusting to the nearest business day
- Validates if the investment amount is within the available balance
- Serves both static files and API endpoints
- Interactive React frontend for user input and result display

## Prerequisites

- Go 1.x installed
- Node.js and npm installed
- Alpha Vantage API key (currently using a demo key)

## API Endpoint

### GET /stock

Calculates the investment return for a given stock.

**Query Parameters:**
- `ticker` - Stock symbol (e.g., AAPL, GOOGL)
- `startDate` - Investment start date (YYYY-MM-DD format)
- `shares` - Number of shares to purchase
- `startingBalance` - Initial available balance

## Frontend

The frontend is built using React and provides a user-friendly interface for inputting stock data and viewing investment results.

### Features

- Input fields for stock ticker, starting balance, number of shares, and start date
- Displays initial investment, final investment, and new balance
- Error handling for failed API requests

## Tech Stack

- Backend: Go, REST API
- Frontend: JavaScript, React
- Data: Alpha Vantage API

## Getting Started

1. Clone the repository.
2. Install Go and Node.js if not already installed.
3. Set up your Alpha Vantage API key.
4. Run the Go server and React frontend.
5. Access the application via your web browser.

