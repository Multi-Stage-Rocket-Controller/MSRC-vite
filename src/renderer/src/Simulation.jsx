import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RocketBox from './components/RocketBox.jsx';
import Chart from './components/Chart.jsx';
import './assets/simulation.css';

const SimulationScreen = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);  // Initialize with an empty array
  const [count, setCount] = useState(0);

  const handleStart = () => window.electron.ipcRenderer.send('ws-send', 'start'); // Send 'start' message to WebSocket
  const handleStop = () => window.electron.ipcRenderer.send('ws-send', 'stop'); // Send 'stop' message to WebSocket
  const handleMainWindow = () => navigate('/');

  const threeDivRef1 = useRef(null);

  useEffect(() => {
    window.electron.ipcRenderer.on('ws-message', (event, data) => {
      console.log('Raw data received from WebSocket:', data);
      try {
        data = new TextDecoder().decode(data);
        const receivedData = JSON.parse(data);
        console.log('Parsed data:', receivedData);
        setData((prevData) => [...prevData, receivedData]);
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
          <RocketBox containerRef={threeDivRef1} data={data} current={count} />
        </div>
      </div>
      <Chart rocketData={data} current={count} />
    </div>
  );
};

export default SimulationScreen;