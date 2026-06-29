import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

const option = {
  ...echartOptions.defaultOptions,
  ...{
    series: [
      {
        ...echartOptions.smoothLine,
        data: [30, 40, 20, 50, 40, 80, 90],
        itemStyle: { color: "#4CAF50" },
        lineStyle: { color: "#4CAF50", ...echartOptions.lineShadow }
      }
    ]
  }
};

export default function Echart1({ height }) {
  return <ReactEcharts style={{ height }} option={option} />;
}
