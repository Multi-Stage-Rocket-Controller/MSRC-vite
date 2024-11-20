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

  const handleStart = () => window.electron.ipcRenderer.send('ws-send', 'start');
  const handleStop = () => window.electron.ipcRenderer.send('ws-send', 'stop');
  const handleMainWindow = () => {
    window.electron.ipcRenderer.send('ws-send', 'reset');
    navigate('/');
  };

  var startTime = new Date

  var firstEntryHit = false

  useEffect(() => {
    window.electron.ipcRenderer.on('ws-message', (event, data) => {
      // console.log('Raw data received from WebSocket:', data);
      try {
        data = new TextDecoder().decode(data);
        const receivedData = JSON.parse(data);
        console.log('Parsed data:', receivedData);
        if(!firstEntryHit) {
          startTime = new Date(receivedData.timestamp).getTime();
          firstEntryHit = true;
        }
        receivedData.timestamp = Math.round((new Date(receivedData.timestamp).getTime() - startTime)/100)/10;
        setData((prevData) => [...prevData, receivedData]);
        setRoll(receivedData.Roll_Radians);
        setPitch(receivedData.Pitch_Radians);
        setYaw(receivedData.Yaw_Radians);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ws-message');
    };
  }, []);

  const simDivStyle = {
    display: 'grid',
    alignItems: 'center'
  };

  return (
    <div style={simDivStyle}>
      <button onClick={handleMainWindow}>Back</button>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <div className="threeDiv">
        <div ref={threeDivRef1} >
          <RocketBox containerRef={threeDivRef1} roll={roll} pitch={pitch} yaw={yaw} />
        </div>
      </div>
      <Chart rocketData={data} />
    </div>
  );
};

export default SimulationScreen;