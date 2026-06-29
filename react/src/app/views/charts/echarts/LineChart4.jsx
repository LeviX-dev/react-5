import ReactEcharts from "echarts-for-react";

import echartOptions from "app/components/charts/echartOptions";
import { generateLastDays } from "@utils";

export default function LineChart4({ height }) {
  const option = {
    ...echartOptions.lineSplitNoAxis,
    grid: { top: 15, left: 35, right: 35, bottom: 0 },
    series: [
      {
        type: "line",
        smooth: true,
        data: [40, 80, 20, 90, 30, 80, 40],
        label: { show: true, color: "#212121" },
        itemStyle: { borderColor: "rgba(102, 51, 153, 1)" },
        lineStyle: { ...echartOptions.lineShadow, color: "rgba(102, 51, 153, 0.8)", width: 3 }
      }
    ],

    xAxis: { type: "category", data: generateLastDays() }
  };

  return <ReactEcharts style={{ height }} option={option} />;
}
