import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SimulationScreen from './Simulation'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Background from './components/Background'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Background />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulation" element={<SimulationScreen />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
