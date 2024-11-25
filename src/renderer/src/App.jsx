import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('ws-message', (event, data) => {
        console.log('Received from WebSocket:', data);
      });

      return () => {
        window.electron.ipcRenderer.removeAllListeners('ws-message');
      };
    }
  }, [isElectron]);

  const goToSimulation = async () => {
    if (isElectron) {
      // Electron-specific code
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
    } else {
      // Browser-specific code
      document.getElementById('fileInput').click();
    }
  };

  const goToLive = () => {
    if (isElectron) {
      // Electron-specific code
      try {
        const message = "live";
        console.log("Sending to WebSocket server:", message);
        window.electron.ipcRenderer.send('ws-send', message);
        navigate("/simulation");
      } catch (error) {
        console.error("Error sending live message:", error);
      }
    } else {
      // Browser-specific code
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('live');
        window.ws.send('start');
        navigate("/simulation");
      } else {
        alert("WebSocket is not connected.");
      }
    }
  };

  return (
    <div>
      <div className="title">
        Rocket Visualizer
      </div>
      <div className="actions">
        <div className="action">
          <a onClick={goToSimulation}>
            Replay
          </a>
        </div>
        <div className="action">
          <a onClick={goToLive}>
            Live
          </a>
        </div>
      </div>
      {!isElectron && (
        // File input for browser environment
        <input
          type="file"
          id="fileInput"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = function (e) {
                const content = e.target.result;
                // Send the content to the server
                if (window.ws && window.ws.readyState === WebSocket.OPEN) {
                  const message = JSON.stringify({
                    type: 'replay',
                    filename: file.name,
                    content: content,
                  });
                  window.ws.send(message);
                } else {
                  alert("WebSocket is not connected.");
                }
                navigate("/simulation");
              };
              reader.readAsText(file);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
