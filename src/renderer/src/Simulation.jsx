import React from 'react'
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import './assets/simulation.css'

const SimulationScreen = ({ file }) => {
  const navigate = useNavigate()
  const handleMainWindow = () => {
    navigate('/')
  }
  const modelRenderStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px'
  }
  const simDivStyle = {
    display: 'grid',
    alignItems: 'center'
  }
  const three_size = 200

  return (
    <div style={simDivStyle}>
      <button onClick={handleMainWindow}>Back</button>
      <div style={modelRenderStyle}>
        {/* <RocketBox size={three_size} />
        <RocketBox size={three_size} /> */}
        {/* <RocketBox size={three_size} /> */}
        <Chart />
      </div>
    </div>
  )
}

export default SimulationScreen
