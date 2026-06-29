import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

const option = {
  ...echartOptions.defaultOptions,
  ...{
    series: [
      {
        type: "pie",
        itemStyle: echartOptions.pieLineStyle,
        data: [
          {
            value: 40,
            name: "Running",
            ...echartOptions.pieLabelOff,
            itemStyle: { borderColor: "#ff9800" }
          },
          {
            value: 60,
            name: "Completed",
            ...echartOptions.pieLabelOff,
            itemStyle: { borderColor: "#4CAF50" }
          }
        ]
      }
    ]
  }
};

export default function Echart8({ height }) {
  return <ReactEcharts style={{ height }} option={option} />;
}
