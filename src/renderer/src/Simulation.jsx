import React, { useRef, useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import Background from './components/Background.jsx'
import { DataContext } from './DataContext'
import './assets/simulation.css'

const SimulationScreen = () => {
  const navigate = useNavigate()
  const { jsonData } = useContext(DataContext)
  const handleMainWindow = () => navigate('/')

  const simDivStyle = {
    display: 'grid',
    alignItems: 'center'
  }

  const threeDivRef1 = useRef(null)
  const threeDivRef2 = useRef(null)
  const threeDivRef3 = useRef(null)

  const [data, setData] = useState(jsonData ? [jsonData[0]] : [])
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (jsonData && count < jsonData.length) {
      setData((prevData) => [...prevData, jsonData[count]])
    }
  }, [count, jsonData])

  const rocketBoxStyle = {
    width: 300,
    height: 300
  }

  return (
    <div style={simDivStyle}>
      <button onClick={handleMainWindow}>Back</button>
      <div className="threeDiv">
        <div ref={threeDivRef1} style={rocketBoxStyle}>
          <RocketBox containerRef={threeDivRef1} data={data} current={count} />
        </div>
        <div ref={threeDivRef2} style={rocketBoxStyle}>
          <RocketBox
            containerRef={threeDivRef2}
            y_cam={150}
            z_cam={0}
            data={data}
            current={count}
          />
        </div>
        <div ref={threeDivRef3} style={rocketBoxStyle}>
          <RocketBox
            containerRef={threeDivRef3}
            x_cam={150}
            z_cam={0}
            data={data}
            current={count}
          />
        </div>
      </div>
      <Chart rocketData={data} current={count} />
    </div>
  )
}

export default SimulationScreen
