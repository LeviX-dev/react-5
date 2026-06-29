import React from "react";
import ReactECharts from "echarts-for-react";

export default function LineChart1({ height = "260px" }) {
  const option = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
    yAxis: {
      type: "value",
      name: "Sales ($)",
    },
    series: [
      {
        data: [820, 932, 901, 934],
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