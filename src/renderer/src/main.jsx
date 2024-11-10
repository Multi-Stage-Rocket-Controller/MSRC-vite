import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SimulationScreen from './Simulation'
import Sandbox from './Sandbox'
import {HashRouter, Route, Routes} from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulation" element={<SimulationScreen />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
