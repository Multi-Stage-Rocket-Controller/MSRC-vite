import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RocketBox from './components/RocketBox.jsx';
import Chart from './components/Chart.jsx';
import './assets/simulation.css';

const SimulationScreen = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);

  const threeDivRef1 = useRef(null);

  const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

  const handleStart = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'start');
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('start');
      } else {
        console.error('WebSocket is not connected');
      }
    }
  };

  const handleStop = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'stop');
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('stop');
      } else {
        console.error('WebSocket is not connected');
      }
    }
  };

  const handleMainWindow = () => {
    if (isElectron) {
      window.electron.ipcRenderer.send('ws-send', 'reset');
    } else {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('reset');
      } else {
        console.error('WebSocket is not connected');
      }
    }
    navigate('/');
  };

  let startTime = new Date();
  let firstEntryHit = false;

  useEffect(() => {
    const handleMessage = (event, data) => {
      try {
        if (isElectron) {
          data = new TextDecoder().decode(data);
          const receivedData = JSON.parse(data);
          if (!firstEntryHit) {
            startTime = new Date(receivedData.timestamp).getTime();
            firstEntryHit = true;
          }
          receivedData.timestamp = Math.round((new Date(receivedData.timestamp).getTime() - startTime) / 100) / 10;
          setData((prevData) => [...prevData, receivedData]);
          setRoll(receivedData.Roll_Radians);
          setPitch(receivedData.Pitch_Radians);
          setYaw(receivedData.Yaw_Radians);
        } else {
          // Browser environment
          const receivedData = event.detail;
          if (!firstEntryHit) {
            startTime = new Date(receivedData.timestamp).getTime();
            firstEntryHit = true;
          }
          receivedData.timestamp = Math.round((new Date(receivedData.timestamp).getTime() - startTime) / 100) / 10;
          setData((prevData) => [...prevData, receivedData]);
          setRoll(receivedData.Roll_Radians);
          setPitch(receivedData.Pitch_Radians);
          setYaw(receivedData.Yaw_Radians);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };

    if (isElectron) {
      window.electron.ipcRenderer.on('ws-message', handleMessage);
    } else {
      window.addEventListener('ws-message', handleMessage);
    }

    return () => {
      if (isElectron) {
        window.electron.ipcRenderer.removeListener('ws-message', handleMessage);
      } else {
        window.removeEventListener('ws-message', handleMessage);
      }
    };
  }, [isElectron]);

  const simDivStyle = {
    display: 'grid',
    alignItems: 'center',
  };

  return (
    <div style={simDivStyle}>
      <button onClick={handleMainWindow}>Back</button>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <div className="threeDiv">
        <div ref={threeDivRef1}>
          <RocketBox roll={roll} pitch={pitch} yaw={yaw} />
        </div>
      </div>
      <Chart rocketData={data} />
    </div>
  );
};

export default SimulationScreen;
