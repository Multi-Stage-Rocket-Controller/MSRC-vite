import { useNavigate } from "react-router-dom";
import Background from "./components/Background.jsx";

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const fileHandle = () => window.electron.ipcRenderer.send('file')
  const navigate = useNavigate();
  const goToSimulation = () => {
    navigate("/simulation");
  };

  return (
    <>
      <Background />
      <div className="title">
        Rocket Visualizer
      </div>
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