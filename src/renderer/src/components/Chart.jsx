import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import React, {useEffect, useState} from "react";
import rocketData from "../utils/data.json"

const Chart = () => {
    const labelArrayTotal = rocketData.map((data) => data.Timestamp);
    const dataArrayTotal = rocketData.map((data) => data.Acc_Net);

    const [count, setCount] = useState(0);

    const [data, setData] = useState({
        labels: labelArrayTotal,
        datasets: [
          {
            label: "Acceleration",
            data: [],
            backgroundColor: "#064FF0",
            borderColor: "#064FF0",
          }
        ],
      });

    useEffect(() => {
        const id = setInterval(() => {
            const newData = {
                labels: [...data.labels, labelArrayTotal],
                datasets: [
                  {
                    ...data.datasets[0],
                    data: [...data.datasets[0].data, dataArrayTotal.slice(0, count + 1)]
                  }
                ]
              };
              console.log(data)
              console.log(dataArrayTotal.slice(0, count + 1))
              setCount(count + 1);
              setData(newData);
        }, 1000);

        return () => clearInterval(id);
    }, [data]);
    return(
        <div>
        <span> Current Acceleration: { dataArrayTotal[count] } </span>
        <Line data={data} />
      </div>
    );
};

export default Chart;