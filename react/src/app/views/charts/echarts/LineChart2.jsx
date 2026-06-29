import React from "react";
import ReactECharts from "echarts-for-react";

export default function LineChart2({ height = "260px" }) {
  const option = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
      name: "Sales ($)",
    },
    series: [
      {
        data: [120, 200, 150, 180, 220, 160, 140],
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#4361ee",
          width: 3,
        },
        areaStyle: {
          color: "rgba(67, 97, 238, 0.1)",
        },
        symbol: "circle",
        symbolSize: 8,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} />;
}