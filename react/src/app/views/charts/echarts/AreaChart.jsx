import Echart from "echarts-for-react";

const option = {
  grid: { left: 0, top: 0, right: 0, bottom: 0 },
  yAxis: { show: false, type: "value", splitLine: { show: false } },
  series: [{ data: [25, 18, 20, 30, 40, 43], type: "line", smooth: true }],
  xAxis: { show: false, type: "category", showGrid: false, boundaryGap: false }
};

export default function AreaChart({ height, color }) {
  return <Echart style={{ height: height }} option={{ ...option, color: [...color] }} />;
}
