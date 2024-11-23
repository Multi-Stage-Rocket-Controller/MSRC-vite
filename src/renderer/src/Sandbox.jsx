import { useNavigate } from 'react-router-dom'
import './assets/simulation.css'
import arrow from './assets/arrow.svg'

const Sandbox = () => {
  const navigate = useNavigate()
  const goToSplash = () => {
    navigate('/')
  }

  const borderStyle = {
    border: '3px solid green',
    width: '90vw',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  return (
    <div style={borderStyle}>
      <div className="header">
        <button className="back-button" onClick={goToSplash}>
          <img src={arrow} alt="Back" />
        </button>
        <div className="title">Rocket Visualizer</div>
      </div>
      <div className="main">
        <div className="left-side">Buttons</div>
        <div className="right-side">
          <div className="rocket">Rocket</div>
          <div className="control-buttons">
            <button className="control-button">Start</button>
            <button className="control-button">Stop</button>
          </div>
          <p>Graphs</p>
        </div>
      </div>
    </div>
  )
}

export default Sandbox
