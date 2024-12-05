import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React, { useMemo } from 'react'
import '../assets/chart.css'

const Chart = ({ rocketData = [], currentTab = 0 }) => {
  const limitedData = useMemo(() => {
    return rocketData.slice(-50)
  }, [rocketData])
  const labelArray = limitedData.map((data) => data.timestamp)
  const rollRadians = limitedData.map((data) => data.Roll_Radians)
  const pitchRadians = limitedData.map((data) => data.Pitch_Radians)
  const yawRadians = limitedData.map((data) => data.Yaw_Radians)
  const latitude = limitedData.map((data) => data.Latitude)
  const longitude = limitedData.map((data) => data.Longitude)
  const accelerationData = limitedData.map((data) => data.Acc_net)
  const altitude = limitedData.map((data) => data.Altitude)
  const voltage = limitedData.map((data) => data.Voltage)

  const chartConfigs = useMemo(() => [
    { label: 'Roll', data: rollRadians, yTitle: 'Roll (Radians)' },
    { label: 'Pitch', data: pitchRadians, yTitle: 'Pitch (Radians)' },
    { label: 'Yaw', data: yawRadians, yTitle: 'Yaw (Radians)' },
    { label: 'Latitude', data: latitude, yTitle: 'Latitude' },
    { label: 'Longitude', data: longitude, yTitle: 'Longitude' },
    { label: 'Acceleration', data: accelerationData, yTitle: 'Acceleration (m/s²)' },
    { label: 'Altitude', data: altitude, yTitle: 'Altitude (m)' },
    { label: 'Voltage', data: voltage, yTitle: 'Voltage (V)' }
  ], [rollRadians, pitchRadians, yawRadians, latitude, longitude, accelerationData, altitude, voltage])

  const currentConfig = chartConfigs[currentTab]

  return (
    <div className="bottom-container">
      <div className="bottom-box">
        {currentConfig && (
          <Line
            data={{
              labels: labelArray,
              datasets: [
                {
                  label: currentConfig.label,
                  data: currentConfig.data,
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
                    text: currentConfig.yTitle,
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
              },
              animation: {
                duration: 0.2,
                easing: 'linear'
              },
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Chart