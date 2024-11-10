package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"
)

const apiKey = "7SM0W1XG8KBQMOPE" // alpha vantage API key 

// struct to hold the alpha vantage API response
type AlphaVantageResponse struct {
	TimeSeries map[string]map[string]string `json:"Time Series (Daily)"` // alpha vantage API response
}


// function to get the stock price from the alpha vantage API
func getStockPrice(apiKey, ticker, date string) (float64, error) {

	// formats the url for the API request
	url := fmt.Sprintf("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=%s&outputsize=full&apikey=%s", ticker, apiKey)

	resp, err := http.Get(url)

	// if there is an error, err will not be nil
	if err != nil {
		return 0, err
	}

	// closes the response body after the function is done 
	defer resp.Body.Close()

	// if the response status is not ok, return an error 
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("error fetching data: %s", resp.Status)
	}


	// reads the response body into a byte slice
	body, err := ioutil.ReadAll(resp.Body)

	// if there is an error, return an error
	if err != nil {
		return 0, err
	}

	// Print the response body for debugging
	//fmt.Println("API Response:", string(body))

	var result AlphaVantageResponse

	// unmarshals the response body into the result struct
	err = json.Unmarshal(body, &result)

	// if there is an error, return an error
	if err != nil {
		return 0, err
	}

	// checks if the data exists in the response 
	if dailyData, exists := result.TimeSeries[date]; exists {

		// checks if the close price exists in the response
		if closePriceStr, exists := dailyData["4. close"]; exists {

			// initialzie the close price to a float 
			var closePrice float64

			// scans the close price string into a float variable
			fmt.Sscanf(closePriceStr, "%f", &closePrice)

			// returns the close price and nil error
			return closePrice, nil
		}
	}

	// if there is no data available for the given date, return an error and the date 
	return 0, fmt.Errorf("no data available for the given date: %s", date)
}


// function to handle the API request 
func stockHandler(w http.ResponseWriter, r *http.Request) {

	// gets the ticker from the URL query
	ticker := r.URL.Query().Get("ticker")

	// gets the start date from the URL query
	startDate := r.URL.Query().Get("startDate")

	// gets the number of shares from the URL query
	shares := r.URL.Query().Get("shares")

	// gets the starting balance from the URL query
	startingBalance := r.URL.Query().Get("startingBalance")

	// Converts the shares value to a float
	sharesFloat, err := strconv.ParseFloat(shares, 64)

	// if there is an error, return an error 
	if err != nil {
		http.Error(w, "Invalid number of shares", http.StatusBadRequest)
		return
	}

	// Converts the starting balance value to a float
	startingBalanceFloat, err := strconv.ParseFloat(startingBalance, 64)

	// If there is an error, return an error
	if err != nil {
		http.Error(w, "Invalid starting balance", http.StatusBadRequest)
		return
	}

	// Parses the start date string to a Time object 
	startDateParsed, err := time.Parse("2006-01-02", startDate)

	// if there is an error, return an error 
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	// if the inputed start date is a weekend, adjust the date to the previous business day
	switch startDateParsed.Weekday() {
	case time.Saturday:
		// adjusts saturday to friday
		startDateParsed = startDateParsed.AddDate(0, 0, -1)
	case time.Sunday:
		// adjusts sunday to friday
		startDateParsed = startDateParsed.AddDate(0, 0, -2)
	}

	// formats the start date to the expected format
	startDate = startDateParsed.Format("2006-01-02")

	// gets the start price
	startPrice, err := getStockPrice(apiKey, ticker, startDate)

	// if there is an error, return an error 
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching start price: %v", err), http.StatusInternalServerError)
		return
	}

	// calculates the initial investment
	initialInvestment := sharesFloat * startPrice

	// if the initial investment is greater than the starting balance, return an error
	if initialInvestment > startingBalanceFloat {
		// sets the content type to json	
		w.Header().Set("Content-Type", "application/json")
		// sets the status code to bad request
		w.WriteHeader(http.StatusBadRequest)
		// encodes the error message to json
		json.NewEncoder(w).Encode(map[string]string{"error": "Insufficient funds"})
		return
	}

	// gets the current date
	endDateParsed := time.Now()

	// if the current date is a weekend, adjust the date to the previous business day
	switch endDateParsed.Weekday() {
	case time.Saturday:
		endDateParsed = endDateParsed.AddDate(0, 0, -1)
	case time.Sunday:
		endDateParsed = endDateParsed.AddDate(0, 0, -2)
	}

	// formats the end date to the expected format 
	endDate := endDateParsed.Format("2006-01-02")

	// gets the end price from the alpha vantage API
	endPrice, err := getStockPrice(apiKey, ticker, endDate)

	// if there is an error, return an error
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching end price: %v", err), http.StatusInternalServerError)
		fmt.Println("Error fetching end price. Response body:", string(err.(*json.UnmarshalTypeError).Value))
		return
	}

	// calculates the final price of the investment 
	finalInvestment := sharesFloat * endPrice

	// calculates the final balance	
	newBalance := startingBalanceFloat - initialInvestment + finalInvestment

	// creates a response map with the initial investment, final investment, and new balance
	// interface{} allows for different types of values to be stored in the map
	response := map[string]interface{}{
		"initialInvestment": initialInvestment,
		"finalInvestment":   finalInvestment,
		"newBalance":        newBalance,
	}

	// sets the content type to json
	w.Header().Set("Content-Type", "application/json")

	// encodes the response map to json and writes it to the response writer
	json.NewEncoder(w).Encode(response)
}


func main() {

	// Serve static files from the current directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	// handles the API request
	http.HandleFunc("/stock", stockHandler)

	// logs the server start message
	log.Println("Server started at :8080")

	// starts the server
	log.Fatal(http.ListenAndServe(":8080", nil))
}