import { useNavigate } from "react-router-dom";

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const fileHandle = () => window.electron.ipcRenderer.send('file')
  const fileHandleSend = async () => {
    const resp = await window.electron.ipcRenderer.invoke('fileGet')
    console.log('file selected:', resp)
  }
  const navigate = useNavigate();
  const goToSimulation = () => {
    navigate("/simulation");
  };

  return (
    <>
      <div className="title">
        Rocket Visualizer
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={fileHandle}>
            Send File
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={fileHandleSend}>
            FileHandleSend
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={goToSimulation}>
            Simulation
          </a>
        </div>
      </div>
    </>
  )
}

export default App