import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

const option = {
  ...echartOptions.defaultOptions,
  ...{
    series: [
      {
        ...echartOptions.smoothLine,
        data: [2, 2, 7, 4, 6, 4, 8],
        itemStyle: { color: "#4CAF50" },
        lineStyle: { color: "#4CAF50", ...echartOptions.lineShadow }
      }
    ]
  }
};

export default function Echart3({ height }) {
  return <ReactEcharts style={{ height }} option={option} />;
}
