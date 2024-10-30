import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
import React, { useEffect, useState } from 'react'
import rocketData from '../utils/data.json'

const Chart = () => {
  rocketData = {}

  const labelArrayTotal = rocketData.map((data) => data.Timestamp)
  const rollRadiansTotal = rocketData.map((data) => data.Roll_Radians)
  const pitchRadiansTotal = rocketData.map((data) => data.Pitch_Radians)
  const yawRadiansTotal = rocketData.map((data) => data.Yaw_Radians)
  const latitudeTotal = rocketData.map((data) => data.Latitude)
  const longitudeTotal = rocketData.map((data) => data.Longitude)
  const accelerationDataTotal = rocketData.map((data) => data.Acc_Net)
  const altitudeTotal = rocketData.map((data) => data.Altitude)
  const voltageTotaL = rocketData.map((data) => data.Voltage)

  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [count])

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <ul>
          <li> Current Roll_Radians: {rollRadiansTotal[count]} </li>
          <li> Current Pitch_Radians: {pitchRadiansTotal[count]} </li>
          <li> Current Yaw_Radians: {yawRadiansTotal[count]} </li>
          <li> Current Latitude: {latitudeTotal[count]} </li>
          <li> Current Longitude: {longitudeTotal[count]} </li>
          <li> Current Acceleration: {accelerationDataTotal[count]} </li>
          <li> Current Altitude: {altitudeTotal[count]} </li>
          <li> Current Voltage: {voltageTotaL[count]} </li>
          <li> Time Elapsed: {labelArrayTotal[count]} </li>
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <Line
          data={{
            labels: labelArrayTotal,
            datasets: [
              {
                label: 'Acceleration',
                data: accelerationDataTotal,
                backgroundColor: '#064FF0',
                borderColor: '#064FF0'
              }
            ]
          }}
        />
      </div>
    </div>
  )
}

export default Chart
