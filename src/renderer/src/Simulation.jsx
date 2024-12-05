import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RocketBox from './components/RocketBox.jsx'
import Chart from './components/Chart.jsx'
import './assets/simulation.css'

const SimulationScreen = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])

  const [roll, setRoll] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [yaw, setYaw] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [rocketCamera, setRocketCamera] = useState('xy')

  const threeDivRef1 = useRef(null)

  const handleStart = () => window.electron.ipcRenderer.send('ws-send', 'start')
  const handleStop = () => window.electron.ipcRenderer.send('ws-send', 'stop')
  const handleMainWindow = () => {
    window.electron.ipcRenderer.send('ws-send', 'reset')
    navigate('/')
  }
  const handleTabChange = (tabIndex) => setActiveTab(tabIndex)
  const handleCameraChange = (camera) => setRocketCamera(camera)

  var startTime = new Date()
  var firstEntryHit = false

  useEffect(() => {
    window.electron.ipcRenderer.on('ws-message', (event, data) => {
      // console.log('Raw data received from WebSocket:', data);
      try {
        data = new TextDecoder().decode(data)
        const receivedData = JSON.parse(data)
        // console.log('Parsed data:', receivedData);
        if (!firstEntryHit) {
          startTime = new Date(receivedData.timestamp).getTime()
          firstEntryHit = true
        }
        receivedData.timestamp =
          Math.round((new Date(receivedData.timestamp).getTime() - startTime) / 100) / 10
        setData((prevData) => [...prevData, receivedData])
        setRoll(receivedData.Roll_Radians)
        setPitch(receivedData.Pitch_Radians)
        setYaw(receivedData.Yaw_Radians)
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ws-message')
    }
  }, [])

  return (
    <div className="master">
      <div className="header">
        <button className="back-button" onClick={handleMainWindow} aria-label="Back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 5 5 12 12 19"></polyline>
          </svg>
        </button>
        <div className="title" style={{ fontSize: '40px', marginLeft: '20px' }}>
          Rocket Visualizer
        </div>
        <div className="control-buttons">
          <button className="start-button" onClick={handleStart}>
            Start
          </button>
          <button className="stop-button" onClick={handleStop}>
            Stop
          </button>
        </div>
      </div>
      <div className="main">
        <div className="left-side">
          <ul className="buttons">
            <li>
              <button className="current-button" onClick={() => {handleCameraChange('xy'); handleTabChange(0);}}>
                Roll: {roll}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleCameraChange('yz');handleTabChange(1)}}>
                Pitch: {pitch}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleCameraChange('xz');handleTabChange(2)}}>
                Yaw: {yaw}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleTabChange(5)}}>
                Acceleration: {data.length > 0 ? data[data.length - 1].Acc_net : 0}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleTabChange(6)}}>
                Altitude: {data.length > 0 ? data[data.length - 1].Altitude : 0}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleTabChange(7)}}>
                Voltage: {data.length > 0 ? data[data.length - 1].Voltage : 0}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleTabChange(4)}}>
                Longitude: {data.length > 0 ? data[data.length - 1].Longitude : 0}
              </button>
            </li>
            <li>
              <button className="current-button" onClick={() => {handleTabChange(3)}}>
                Latitude: {data.length > 0 ? data[data.length - 1].Latitude : 0}
              </button>
            </li>
          </ul>
          <Chart rocketData={data} currentTab={activeTab}/>
        </div>
        <div className="right-side">
          <div className="threeDiv">
            <div ref={threeDivRef1}>
              <RocketBox roll={roll} pitch={pitch} yaw={yaw} currentCamera={rocketCamera} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationScreen
