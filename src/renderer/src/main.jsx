import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SimulationScreen from './Simulation'
import Sandbox from './Sandbox'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './DataContent'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/simulation" element={<SimulationScreen />} />
          <Route path="/sandbox" element={<Sandbox />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  </React.StrictMode>
)
