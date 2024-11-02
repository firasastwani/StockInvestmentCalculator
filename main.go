package main

import (
	"fmt"
	"log"
	"net/http"
	"io/ioutil"
	"encoding/json"
)

type StockPrice struct {
	// Define the structure based on the API response
	Price float64 `json:"price"`
}

func getStockPrice(ticker string, date string) (float64, error) {
	// Replace with actual API URL and parameters
	url := fmt.Sprintf("https://api.example.com/stock/%s/price?date=%s", ticker, date)
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var stockPrice StockPrice
	err = json.Unmarshal(body, &stockPrice)
	if err != nil {
		return 0, err
	}

	return stockPrice.Price, nil
}

func main() {
	var startingBalance float64
	var ticker string
	var shares int
	var startDate, endDate string

	fmt.Print("Enter starting balance: ")
	fmt.Scan(&startingBalance)

	fmt.Print("Enter stock ticker: ")
	fmt.Scan(&ticker)

	fmt.Print("Enter number of shares: ")
	fmt.Scan(&shares)

	fmt.Print("Enter start date (YYYY-MM-DD): ")
	fmt.Scan(&startDate)

	fmt.Print("Enter end date (YYYY-MM-DD): ")
	fmt.Scan(&endDate)

	startPrice, err := getStockPrice(ticker, startDate)
	if err != nil {
		log.Fatalf("Error fetching start price: %v", err)
	}

	endPrice, err := getStockPrice(ticker, endDate)
	if err != nil {
		log.Fatalf("Error fetching end price: %v", err)
	}

	initialInvestment := startPrice * float64(shares)
	finalValue := endPrice * float64(shares)
	profit := finalValue - initialInvestment

	fmt.Printf("Initial investment: $%.2f\n", initialInvestment)
	fmt.Printf("Final portfolio value: $%.2f\n", finalValue)
	fmt.Printf("Profit: $%.2f\n", profit)
}