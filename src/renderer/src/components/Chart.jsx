import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React, { useEffect, useRef, useState } from 'react'
import '../assets/chart.css'

const Chart = ({ rocketData = [], current = 0 }) => {
  var labelArrayTotal = rocketData.map((data) => data.Timestamp)
  var rollRadiansTotal = rocketData.map((data) => data.Roll_Radians)
  var pitchRadiansTotal = rocketData.map((data) => data.Pitch_Radians)
  var yawRadiansTotal = rocketData.map((data) => data.Yaw_Radians)
  var latitudeTotal = rocketData.map((data) => data.Latitude)
  var longitudeTotal = rocketData.map((data) => data.Longitude)
  var accelerationDataTotal = rocketData.map((data) => data.Acc_Net)
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
          Current Roll: {rollRadiansTotal[rollRadiansTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(1)}>
          Current Pitch: {pitchRadiansTotal[pitchRadiansTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(2)}>
          Current Yaw: {yawRadiansTotal[yawRadiansTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(3)}>
          Current Latitude: {latitudeTotal[latitudeTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(4)}>
          Current Longitude: {longitudeTotal[longitudeTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(5)}>
          Current Acceleration: {accelerationDataTotal[accelerationDataTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(6)}>
          Current Altitude: {altitudeTotal[altitudeTotal.length - 1]}
        </div>
        <div className="section" onClick={() => handleTabClick(7)}>
          Current Voltage: {voltageTotal[voltageTotal.length - 1]}
        </div>
      </div>
      <div className="bottom-box">
        <div style={{ flex: 1 }} className="tab-content">
          {activeTab === 0 && (
            <div>
              <Line
                data={{
                  labels: labelArrayTotal,
                  datasets: [
                    {
                      label: 'Roll Radians',
                      data: rollRadiansTotal,
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
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
                      borderColor: '#FFFFFF'
                    }
                  ]
                }}
                options={{
                  plugins: {
                    // changin the lagend colour
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  // Changing the label colour
                  scales: {
                    y: {
                      ticks: { color: 'white', beginAtZero: true }
                    },
                    x: {
                      ticks: { color: 'white', beginAtZero: true }
                    }
                  }
                }}
              />
            </div>
          )}
          {/* Render content based on the active tab */}
        </div>
      </div>
    </div>
  )
}

export default Chart
