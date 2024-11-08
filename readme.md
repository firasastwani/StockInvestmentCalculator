# Stock Investment Calculator API

A simple Go-based web service that calculates investment returns based on historical stock data using the Alpha Vantage API.

## Features

- Fetches historical stock prices using Alpha Vantage API
- Calculates investment returns between a start date and current date
- Handles weekend dates by adjusting to the nearest business day
- Validates if the investment amount is within the available balance
- Serves both static files and API endpoints

## Prerequisites

- Go 1.x installed
- Alpha Vantage API key (currently using a demo key)

## API Endpoint

### GET /stock

Calculates the investment return for a given stock.

**Query Parameters:**
- `ticker` - Stock symbol (e.g., AAPL, GOOGL)
- `startDate` - Investment start date (YYYY-MM-DD format)
- `shares` - Number of shares to purchase
- `startingBalance` - Initial available balance
