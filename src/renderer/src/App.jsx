import { useNavigate } from "react-router-dom";

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const fileHandle = () => window.electron.ipcRenderer.send('file')
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
        Demo Version
      </p>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Ping
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={fileHandle}>
            Load
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