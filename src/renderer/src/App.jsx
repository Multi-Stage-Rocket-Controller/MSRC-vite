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
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Connect
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


// const navigate = useNavigate()
// const handleMainWindow = () => {
//   navigate('/')
// }
// const modelValueStyle = {
//   display: 'flex',
//   justifyContent: 'space-around',
//   marginTop: '20px'
// }
// const simDivStyle = {
//   display: 'grid',
//   alignItems: 'center'
// }

// return (
//   <div style={simDivStyle}>
//     <button onClick={handleMainWindow}>Back</button>
//     <div className="threeDiv">
//       <RocketBox />
//       <RocketBox x_cam={0} y_cam={150} z_cam={0} />
//       <RocketBox x_cam={150} y_cam={0} z_cam={0} />
//     </div>
//     <div className="currentValueDiv" style={modelValueStyle}></div>
//   </div>
// )


export default App