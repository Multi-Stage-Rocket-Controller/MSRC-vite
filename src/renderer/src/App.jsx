import React, { useContext } from 'react'
import { useNavigate } from "react-router-dom";
import { DataContext } from './DataContext.jsx'

function App() {
  const { jsonData, setJsonData } = useContext(DataContext) // Consume the context
  console.log("App Component - jsonData:", jsonData) // Log jsonData
  
  const navigate = useNavigate();
  const goToSimulation = () => { navigate("/simulation"); };
  const goToSandbox = () => { navigate("/sandbox"); };

  const handleFileOpen = async () => {
    const selectedFile = await window.rocket.openFile()
    if (selectedFile) {
      const data = await window.rocket.loadJSON(selectedFile)
      if (data) {
        setJsonData(data)
        console.log("Loaded JSON Data:", data)
      } else {
        alert("Failed to load JSON data.")
      }
    } else {
      alert("No file selected.")
    }
  }

  return (
    <>
      <div className="title">
        Rocket Visualizer
      </div>
      <div className="actions">
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