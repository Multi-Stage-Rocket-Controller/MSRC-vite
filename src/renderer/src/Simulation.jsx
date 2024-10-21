import React, { useRef } from 'react' // Ensure useRef is imported
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
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

  const threeDivRef1 = useRef(null)
  const threeDivRef2 = useRef(null)
  const threeDivRef3 = useRef(null)

  return (
    <div style={simDivStyle}>
    <button onClick={handleMainWindow}>Back</button>
    <div className="threeDiv">
      <div ref={threeDivRef1} style={{ width: 300, height: 300 }}>
        {/* X-Y Plane */}
        <RocketBox containerRef={threeDivRef1} />
      </div>
      <div ref={threeDivRef2} style={{ width: 300, height: 300 }}>
        {/* X-Z Plane */}
        <RocketBox containerRef={threeDivRef2} x_cam={0} y_cam={150} z_cam={0} />
      </div>
      <div ref={threeDivRef3} style={{ width: 300, height: 300 }}>
        {/* Y-Z Plane */}
        <RocketBox containerRef={threeDivRef3} x_cam={150} y_cam={0} z_cam={0} />
      </div>
    </div>
        <Chart />
    </div>
  )
}

export default SimulationScreen
