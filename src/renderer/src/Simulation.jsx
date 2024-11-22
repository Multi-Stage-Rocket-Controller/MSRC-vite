import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RocketBox from './components/RocketBox.jsx';
import Chart from './components/Chart.jsx';
import './assets/simulation.css';

const SimulationScreen = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);  // Initialize with an empty array
  const [count, setCount] = useState(0);

  const threeDivRef1 = useRef(null);
  const threeDivRef2 = useRef(null);
  const threeDivRef3 = useRef(null);

  var startTime = new Date

  var firstEntryHit = false

  useEffect(() => {
    window.electron.ipcRenderer.on('ws-message', (event, data) => {
      console.log('Raw data received from WebSocket:', data);
      try {
        data = new TextDecoder().decode(data);
        const receivedData = JSON.parse(data);
        console.log('Parsed data:', receivedData);
        if (!firstEntryHit) {
          startTime = new Date(receivedData.timestamp).getTime();
          firstEntryHit = true;
        }
        receivedData.timestamp = Math.round((new Date(receivedData.timestamp).getTime() - startTime) / 100) / 10;
        setData((prevData) => [...prevData, receivedData]);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ws-message');
    };
  }, []);

  const handleStart = () => {
    window.electron.ipcRenderer.send('ws-send', 'start');
  };

  const handleStop = () => {
    window.electron.ipcRenderer.send('ws-send', 'stop');
  };

  const handleMainWindow = () => navigate('/');

  const simDivStyle = {
    display: 'grid',
    alignItems: 'center'
  };

  const rocketBoxStyle = {
    width: 300,
    height: 300
  };

  const flex2 = {
    flex: 2
  }
  const flex3 = {
    flex: 3
  }

  return (
    <div style={simDivStyle}>
      <div className="topBox">
        <div style={flex3} ><button className="btn1" onClick={handleMainWindow}>Back</button></div>
        <div style={flex2}><button className="btn1" onClick={handleStart}>Start</button>
          <button className="btn1" onClick={handleStop}>Stop</button></div>
          <div style={flex3}></div>
      </div>
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
  );
};

export default SimulationScreen;