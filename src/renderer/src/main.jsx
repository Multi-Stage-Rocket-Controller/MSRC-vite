import './assets/main.css';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SimulationScreen from './Simulation';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Background from './components/Background';

const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

function Main() {
  useEffect(() => {
    if (!isElectron) {
      // Browser environment
      // Set up WebSocket connection
      window.ws = new WebSocket('ws://localhost:8080');

      window.ws.onopen = () => {
        console.log('WebSocket connected in browser');
      };

      window.ws.onmessage = (event) => {
        const data = event.data;
        // Handle the received data
        const parsedData = JSON.parse(data);
        window.dispatchEvent(new CustomEvent('ws-message', { detail: parsedData }));
      };

      window.ws.onclose = () => {
        console.log('WebSocket closed');
      };

      window.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  }, []);

  return (
    <HashRouter>
      <Background />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulation" element={<SimulationScreen />} />
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
