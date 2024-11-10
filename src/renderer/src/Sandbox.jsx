import { useNavigate } from "react-router-dom";

function Sandbox() {
  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };

  return (
    <div>
      <button onClick={goHome}>Go Home</button>
    </div>
  );
}

export default Sandbox;