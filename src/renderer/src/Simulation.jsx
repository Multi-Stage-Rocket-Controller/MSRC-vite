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
  const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1

  const getCameraLabel = (camera) => {
    const cameraMap = {
      xy: 'XY Plane (looking down Z-axis)',
      yz: 'YZ Plane (looking down X-axis)',
      xz: 'XZ Plane (looking down Y-axis)'
    }
    return cameraMap[camera] || 'Unknown Camera'
  }

  const handleStart = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'start')
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('start')
      } else {
        console.error('WebSocket is not connected')
      }
    }
  }

  const handleStop = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'stop')
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('stop')
      } else {
        console.error('WebSocket is not connected')
      }
    }
  }

  const handleMainWindow = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'reset')
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('reset')
      } else {
        console.error('WebSocket is not connected')
      }
    }
    navigate('/')
  }
  const handleTabChange = (tabIndex) => setActiveTab(tabIndex)
  const handleCameraChange = (camera) => setRocketCamera(camera)

  let startTime = new Date()
  let firstEntryHit = false

  useEffect(() => {
    const handleMessage = (event, data) => {
      try {
        if (isElectron) {
          data = new TextDecoder().decode(data)
          const receivedData = JSON.parse(data)
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
        } else {
          // Browser environment
          const receivedData = event.detail
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
        }
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    }

    if (isElectron) {
      window.electron.ipcRenderer.on('ws-message', handleMessage)
    } else {
      window.addEventListener('ws-message', handleMessage)
    }

    return () => {
      if (isElectron) {
        window.electron.ipcRenderer.removeListener('ws-message', handleMessage)
      } else {
        window.removeEventListener('ws-message', handleMessage)
      }
    }
  }, [isElectron])

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
          <div className="buttons-container">
            <ul className="buttons">
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleCameraChange('xy')
                    handleTabChange(0)
                  }}
                >
                  Roll: {roll}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleCameraChange('yz')
                    handleTabChange(1)
                  }}
                >
                  Pitch: {pitch}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleCameraChange('xz')
                    handleTabChange(2)
                  }}
                >
                  Yaw: {yaw}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleTabChange(5)
                  }}
                >
                  Acceleration: {data.length > 0 ? data[data.length - 1].Acc_net : 0}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleTabChange(6)
                  }}
                >
                  Altitude: {data.length > 0 ? data[data.length - 1].Altitude : 0}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleTabChange(7)
                  }}
                >
                  Voltage: {data.length > 0 ? data[data.length - 1].Voltage : 0}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleTabChange(4)
                  }}
                >
                  Longitude: {data.length > 0 ? data[data.length - 1].Longitude : 0}
                </button>
              </li>
              <li>
                <button
                  className="current-button"
                  onClick={() => {
                    handleTabChange(3)
                  }}
                >
                  Latitude: {data.length > 0 ? data[data.length - 1].Latitude : 0}
                </button>
              </li>
            </ul>
          </div>
          <Chart rocketData={data} currentTab={activeTab} />
        </div>
        <div className="right-side">
          <div className="camera-label">{getCameraLabel(rocketCamera)}</div>
          <div className="threeDiv" ref={threeDivRef1}>
            <RocketBox roll={roll} pitch={pitch} yaw={yaw} currentCamera={rocketCamera} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationScreen
