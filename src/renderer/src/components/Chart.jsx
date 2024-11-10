import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React, { useEffect, useRef, useState } from 'react'

const Chart = ({ rocketData = [], current = 0 }) => {
  const labelArrayTotal = rocketData.map((data) => data.Timestamp)
  const rollRadiansTotal = rocketData.map((data) => data.Roll_Radians)
  const pitchRadiansTotal = rocketData.map((data) => data.Pitch_Radians)
  const yawRadiansTotal = rocketData.map((data) => data.Yaw_Radians)
  const latitudeTotal = rocketData.map((data) => data.Latitude)
  const longitudeTotal = rocketData.map((data) => data.Longitude)
  const accelerationDataTotal = rocketData.map((data) => data.Acc_Net)
  const altitudeTotal = rocketData.map((data) => data.Altitude)
  const voltageTotaL = rocketData.map((data) => data.Voltage)

  // const [count, setCount] = useState(0)

  const [activeTab, setActiveTab] = useState(0)

  const handleTabClick = (index) => {
    setActiveTab(index)
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <ul>
          <li> Current Roll_Radians: {rollRadiansTotal[current]} </li>
          <li> Current Pitch_Radians: {pitchRadiansTotal[current]} </li>
          <li> Current Yaw_Radians: {yawRadiansTotal[current]} </li>
          <li> Current Latitude: {latitudeTotal[current]} </li>
          <li> Current Longitude: {longitudeTotal[current]} </li>
          <li> Current Acceleration: {accelerationDataTotal[current]} </li>
          <li> Current Altitude: {altitudeTotal[current]} </li>
          <li> Current Voltage: {voltageTotaL[current]} </li>
          <li> Time Elapsed: {labelArrayTotal[current]} </li>
        </ul>
      </div>
      <div>
        <div style={{ flex: 1 }} className="side-tabs">
          <ul style={{ backgroundColor: '#333333' }} className="tab-list">
            <li
              style={{ float: 'left', display: 'block' }}
              onClick={() => handleTabClick(0)}
              className={activeTab === 0 ? 'active' : ''}
            >
              Roll Radians
            </li>
            <li
              style={{ float: 'left', display: 'block' }}
              onClick={() => handleTabClick(1)}
              className={activeTab === 1 ? 'active' : ''}
            >
              Pitch Radians
            </li>
            <li
              style={{ float: 'left', display: 'block' }}
              onClick={() => handleTabClick(2)}
              className={activeTab === 2 ? 'active' : ''}
            >
              Yaw Radians
            </li>
            {/* Add more tabs as needed */}
          </ul>
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
                        backgroundColor: '#064FF0',
                        borderColor: '#064FF0'
                      }
                    ]
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
                        backgroundColor: '#064FF0',
                        borderColor: '#064FF0'
                      }
                    ]
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
                        backgroundColor: '#064FF0',
                        borderColor: '#064FF0'
                      }
                    ]
                  }}
                />
              </div>
            )}
            {/* Render content based on the active tab */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chart
