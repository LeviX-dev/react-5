import ReactEcharts from "echarts-for-react";
import echartOptions from "app/components/charts/echartOptions";

export default function DoughnutChart({ height }) {
  const option = {
    ...echartOptions.defaultOptions,
    legend: { show: true, bottom: 0 },
    series: [
      {
        type: "pie",
        ...echartOptions.pieRing,
        label: echartOptions.pieLabelCenterHover,
        data: [
          { name: "Pending", value: 20, itemStyle: { color: "#ced4da" } },
          { name: "Completed", value: 80, itemStyle: { color: "#663399" } }
        ]
      }
    ]
  };

  return <ReactEcharts style={{ height }} option={option} />;
}
