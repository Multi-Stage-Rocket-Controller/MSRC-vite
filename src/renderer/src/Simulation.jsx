import React from "react";
import { useNavigate } from "react-router-dom";
import RocketBox from "./components/RocketBox.jsx";
import './assets/simulation.css'

const SimulationScreen = ({file}) => {
  const navigate = useNavigate();
  const handleMainWindow = () => {
    navigate("/");
  };
  const modelRenderStyle = {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  };
  
  return (
    <div>
      <button onClick={handleMainWindow}>Back</button>
      <div style={modelRenderStyle}>
        <RocketBox label="X-Y Plane" cameraPosition={[2, 2, 0]} />
        {/* <RocketBox label="X-Z Plane" cameraPosition={[2, 0, 2]} />
        <RocketBox label="Y-Z Plane" cameraPosition={[0, 2, 2]} /> */}
      </div>
    </div>
  );
};

export default SimulationScreen;
