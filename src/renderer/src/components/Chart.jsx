import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React, { useEffect, useRef, useState } from 'react'
import '../assets/chart.css'

const Chart = ({ rocketData = [], current = 0 }) => {
  var labelArrayTotal = rocketData.map((data) => data.timestamp)
  var rollRadiansTotal = rocketData.map((data) => data.Roll_Radians)
  var pitchRadiansTotal = rocketData.map((data) => data.Pitch_Radians)
  var yawRadiansTotal = rocketData.map((data) => data.Yaw_Radians)
  var latitudeTotal = rocketData.map((data) => data.Latitude)
  var longitudeTotal = rocketData.map((data) => data.Longitude)
  var accelerationDataTotal = rocketData.map((data) => data.Acc_net)
  var altitudeTotal = rocketData.map((data) => data.Altitude)
  var voltageTotal = rocketData.map((data) => data.Voltage)

  // const [count, setCount] = useState(0)

  const [activeTab, setActiveTab] = useState(0)

  const handleTabClick = (index) => {
    setActiveTab(index)
  }

  return (
    <div className="bottom-container">
      <div className="bottom-box left-box">
        <div className="section" onClick={() => handleTabClick(0)}>
          <div className="sectionText">Current Roll: {rollRadiansTotal[rollRadiansTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(1)}>
          <div className="sectionText">Current Pitch: {pitchRadiansTotal[pitchRadiansTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(2)}>
          <div className="sectionText">Current Yaw: {yawRadiansTotal[yawRadiansTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(3)}>
          <div className="sectionText">Current Latitude: {latitudeTotal[latitudeTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(4)}>
          <div className="sectionText">Current Longitude: {longitudeTotal[longitudeTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(5)}>
          <div className="sectionText">Current Acceleration: {accelerationDataTotal[accelerationDataTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(6)}>
          <div className="sectionText">Current Altitude: {altitudeTotal[altitudeTotal.length - 1]}</div>
        </div>
        <div className="section" onClick={() => handleTabClick(7)}>
          <div className="sectionText">Current Voltage: {voltageTotal[voltageTotal.length - 1]}</div>
        </div>
      </div>
      <div style={{ flex: 1 }} className="tab-content bottom-box">
        {activeTab === 0 && (
          <div className="bottom-box">
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Roll Radians',
                    data: rollRadiansTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Radians',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Pitch Radians',
                    data: pitchRadiansTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                    
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Radians',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Yaw Radians',
                    data: yawRadiansTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Radians',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 3 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Latitude',
                    data: latitudeTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Latitude',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 4 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Longitude',
                    data: longitudeTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Longitude',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 5 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Acceleration',
                    data: accelerationDataTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Acceleration (m/s^2)',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 6 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Altitude',
                    data: altitudeTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Altitude (m)',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {activeTab === 7 && (
          <div>
            <Line
              data={{
                labels: labelArrayTotal,
                datasets: [
                  {
                    label: 'Voltage',
                    data: voltageTotal,
                    borderColor: '#FFFFFF',
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Voltage',
                      color: 'white'
                    }
                  },
                  x: {
                    ticks: { color: 'white' },
                    title: {
                      display: true,
                      text: 'Time (s)',
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {/* Render content based on the active tab */}
      </div>
    </div>
  )
}

export default Chart
