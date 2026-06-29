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
            value: 80,
            name: "Email Subscription",
            ...echartOptions.pieLabelOff,
            itemStyle: { borderColor: "#4CAF50" }
          },
          {
            value: 20,
            name: "Registration",
            ...echartOptions.pieLabelOff,
            itemStyle: { borderColor: "#df0029" }
          }
        ]
      }
    ]
  }
};

export default function Echart5({ height }) {
  return <ReactEcharts style={{ height }} option={option} />;
}
