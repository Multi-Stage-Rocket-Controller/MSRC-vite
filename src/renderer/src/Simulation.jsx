import React, { useRef, useEffect, useState } from 'react' // Ensure useRef is imported
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import Background from './components/Background.jsx'
import { DataContext } from './DataContext'
import './assets/simulation.css'
import rocketDataMain from './utils/data.json'

const SimulationScreen = () => {
  const navigate = useNavigate()
  const { jsonData } = useContext(DataContext)
  const handleMainWindow = () => navigate('/')
  
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

  const rocketData = Object.values(rocketDataMain)
  const [data, setData] = useState(rocketData.splice(0, 1))
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [count])

  useEffect(() => {
    const id = setInterval(() => {
      setData(rocketData.splice(0, 1 + count))
    }, 1000)

    return () => clearInterval(id)
  }, [data])
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
      <div className="threeDiv"></div>
      <Chart rocketData={data} current={count} />
    </div>
  )
}

export default SimulationScreen
