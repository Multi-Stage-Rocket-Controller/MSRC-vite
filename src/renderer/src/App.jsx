import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on('ws-message', (event, data) => {
      console.log('Received from WebSocket:', data);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ws-message');
    };
  }, []);

  const goToSimulation = async () => {
    try {
      const selectedFile = await window.rocket.openFile({
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
      });
      if (selectedFile) {
        const message = `replay, ${selectedFile}`;
        console.log("Sending to WebSocket server:", message);
        window.electron.ipcRenderer.send('ws-send', message);
        navigate("/simulation");
      } else {
        alert("No file selected.");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const goToLive = () => {
    try {
      const message = "live";
      console.log("Sending to WebSocket server:", message);
      window.electron.ipcRenderer.send('ws-send', message);
      navigate("/simulation");
    } catch (error) {
      console.error("Error sending live message:", error);
    }
  };

  return (
    <div>
      <div className="title">
        Rocket Visualizer
      </div>
      <div className="actions">
        <div className="replay">
          <a target="_blank" rel="noreferrer" onClick={goToSimulation}>
            Replay
          </a>
        </div>
        <div className="live">
          <a target="_blank" rel="noreferrer" onClick={goToLive}>
            Live
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;