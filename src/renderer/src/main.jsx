import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SimulationScreen from './Simulation'
import RouteButton from './components/RouteButton'
import {HashRouter, Route, Routes} from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulation" element={<SimulationScreen />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
