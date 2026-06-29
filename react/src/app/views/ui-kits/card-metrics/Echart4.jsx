import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

const option = {
  ...echartOptions.defaultOptions,
  ...{
    series: [
      {
        data: [2, 2, 7, 4, 6, 4, 4],
        ...echartOptions.smoothLine,
        itemStyle: { color: "#df0029" },
        lineStyle: { color: "#df0029", ...echartOptions.lineShadow }
      }
    ]
  }
};

export default function Echart4({ height }) {
  return <ReactEcharts style={{ height }} option={option} />;
}
