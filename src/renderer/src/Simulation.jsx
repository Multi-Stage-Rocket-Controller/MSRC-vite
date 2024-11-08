import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import Background from './components/Background.jsx'
import './assets/simulation.css'

const SimulationScreen = () => {
  const navigate = useNavigate()
  const handleMainWindow = () => {
    navigate('/')
  }
  const modelValueStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px'
  }
  const simDivStyle = {
    display: 'grid',
    alignItems: 'center'
  }

  const roll = Math.PI / 4 // 45 degrees (rad)
  const pitch = Math.PI / 6 // 30 degrees (rad)
  const yaw = Math.PI / 3 // 60 degrees (rad)

  const threeDivRef1 = useRef(null)
  const threeDivRef2 = useRef(null)
  const threeDivRef3 = useRef(null)
  const rocketBoxStyle = {
    width: 300,
    height: 300
  }

  return (
    <div style={simDivStyle}>
      <Background />
      <button onClick={handleMainWindow}>Back</button>
      <div className="threeDiv">
        <div ref={threeDivRef1} style={rocketBoxStyle}>
          {/* X-Y Plane */}
          <RocketBox containerRef={threeDivRef1} />
        </div>
        <div ref={threeDivRef2} style={rocketBoxStyle}>
          {/* X-Z Plane */}
          <RocketBox
            containerRef={threeDivRef2}
            x_cam={0}
            y_cam={150}
            z_cam={0}
            // roll={roll}
            // pitch={pitch}
            // yaw={yaw}
          />
        </div>
        <div ref={threeDivRef3} style={rocketBoxStyle}>
          {/* Y-Z Plane */}
          <RocketBox containerRef={threeDivRef3} x_cam={150} y_cam={0} z_cam={0} />
        </div>
      </div>
      <Chart />
    </div>
  )
}

export default SimulationScreen
