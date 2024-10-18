import React from "react";
import { useNavigate } from "react-router-dom";

const RouteButton = () => {
    const navigate = useNavigate();
    const handleMainWindow = () => {
      navigate("/");
    };

    return(
        <div>
            <button onClick={handleMainWindow}>Back</button>
            <h1>Simulation Screen</h1>
        </div>
    );
};

export default RouteButton;