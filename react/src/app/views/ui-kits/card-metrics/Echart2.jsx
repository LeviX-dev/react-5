import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

const option = {
  ...echartOptions.defaultOptions,
  ...{
    series: [
      {
        ...echartOptions.smoothLine,
        data: [6, 4, 7, 4, 6, 4, 1],
        itemStyle: { color: "#df0029" },
        lineStyle: { color: "#df0029", ...echartOptions.lineShadow }
      }
    ]
  }
};

export default function Echart2({ height }) {
  return <ReactEcharts style={{ height: height }} option={option} />;
}
