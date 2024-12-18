// src/App.js
import React from 'react';
import StockPriceViewer from './StockPriceViewer';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line} from 'react-chartjs-2';


function App() {
  return (
    <div className="App">
      <StockPriceViewer />
    </div>
  );
}

export default App;