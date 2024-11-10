import React, { useRef, useEffect, useState } from 'react' // Ensure useRef is imported
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import './assets/simulation.css'
import rocketDataMain from './utils/data.json'

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

  // Define your desired roll, pitch, and yaw in radians
  const roll = Math.PI / 4 // Example: 45 degrees in radians
  const pitch = Math.PI / 6 // Example: 30 degrees in radians
  const yaw = Math.PI / 3 // Example: 60 degrees in radians

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

  return (
    <div style={simDivStyle}>
      <button onClick={handleMainWindow}>Back</button>
      <div className="threeDiv"></div>
      <Chart rocketData={data} current={count} />
    </div>
  )
}

export default SimulationScreen
