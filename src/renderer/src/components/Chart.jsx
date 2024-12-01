import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React from 'react'
import '../assets/chart.css'

const Chart = ({ rocketData = [], currentTab = 0 }) => {
  console.log('Current Tab:', currentTab)
  
  const labelArrayTotal = rocketData.map((data) => data.timestamp)
  const rollRadiansTotal = rocketData.map((data) => data.Roll_Radians)
  const pitchRadiansTotal = rocketData.map((data) => data.Pitch_Radians)
  const yawRadiansTotal = rocketData.map((data) => data.Yaw_Radians)
  const latitudeTotal = rocketData.map((data) => data.Latitude)
  const longitudeTotal = rocketData.map((data) => data.Longitude)
  const accelerationDataTotal = rocketData.map((data) => data.Acc_net)
  const altitudeTotal = rocketData.map((data) => data.Altitude)
  const voltageTotal = rocketData.map((data) => data.Voltage)

  // Configuration for each tab
  const chartConfigs = [
    {
      label: 'Roll Radians',
      data: rollRadiansTotal,
      yTitle: 'Radians',
    },
    {
      label: 'Pitch Radians',
      data: pitchRadiansTotal,
      yTitle: 'Radians',
    },
    {
      label: 'Yaw Radians',
      data: yawRadiansTotal,
      yTitle: 'Radians',
    },
    {
      label: 'Latitude',
      data: latitudeTotal,
      yTitle: 'Latitude',
    },
    {
      label: 'Longitude',
      data: longitudeTotal,
      yTitle: 'Longitude',
    },
    {
      label: 'Acceleration',
      data: accelerationDataTotal,
      yTitle: 'Acceleration (m/s²)',
    },
    {
      label: 'Altitude',
      data: altitudeTotal,
      yTitle: 'Altitude (m)',
    },
    {
      label: 'Voltage',
      data: voltageTotal,
      yTitle: 'Voltage',
    },
  ]

  const currentConfig = chartConfigs[currentTab]

  return (
    <div className="bottom-container">
      <div className="bottom-box">
        {currentConfig && (
          <Line
            data={{
              labels: labelArrayTotal,
              datasets: [
                {
                  label: currentConfig.label,
                  data: currentConfig.data,
                  borderColor: '#FFFFFF',
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  ticks: { color: 'white' },
                  title: {
                    display: true,
                    text: currentConfig.yTitle,
                    color: 'white',
                  },
                },
                x: {
                  ticks: { color: 'white' },
                  title: {
                    display: true,
                    text: 'Time (s)',
                    color: 'white',
                  },
                },
              },
              animation: {
                duration: 0.045, // Disable animation duration
                easing: 'linear', // Set easing to linear
              },
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Chart