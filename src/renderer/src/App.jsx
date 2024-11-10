import { useNavigate } from "react-router-dom";
import Background from "./components/Background.jsx";

function App() {
  const navigate = useNavigate();
  const goToSimulation = () => {
    navigate("/simulation");
  };
  const goToSandbox = () => {
    navigate("/sandbox");
  };

  const handleFileOpen = async () => {
    const selectedFile = await window.rocket.openFile()
    if (selectedFile) {
      console.log("Selected file path:", selectedFile)
    } else {
      alert("No file selected.")
    }
  }

  return (
    <>
      <Background />
      <div className="title">
        Rocket Visualizer
      </div>
      <div className="actions">
        <div className="action">
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={handleFileOpen}>
            Load
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={goToSimulation}>
            Simulation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={goToSandbox}>
            Sandbox
          </a>
        </div>
      </div>
    </>
  )
}

export default App