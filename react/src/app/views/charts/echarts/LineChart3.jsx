import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import api from "app/services/api";

export default function LineChart3({ height = "360px" }) {
  const [option, setOption]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/dashboard/20day-trend")
      .then(({ data }) => {
        setOption(buildOption(
          data.map((r) => r.date.substring(5)),
          data.map((r) => Number(r.present_count ?? 0)),
          data.map((r) => Number(r.absent_count  ?? 0)),
          data.map((r) => Number(r.late_count    ?? 0)),
        ));
      })
      .catch((err) => {
        console.error("20-day trend error:", err);
        const demo = Array.from({ length: 20 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - 19 + i);
          return d.toISOString().split("T")[0].substring(5);
        });
        setOption(buildOption(
          demo,
          demo.map(() => Math.floor(Math.random() * 100) + 60),
          demo.map(() => Math.floor(Math.random() * 30)  + 5),
          demo.map(() => Math.floor(Math.random() * 20)  + 3),
        ));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return <ReactECharts option={option} style={{ height }} />;
}

function buildOption(dates, present, absent, late) {
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Present", "Absent", "Late"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: dates, axisLabel: { rotate: 45 } },
    yAxis: { type: "value", name: "Employees", minInterval: 1 },
    series: [
      {
        name: "Present", type: "line", data: present, smooth: true,
        symbol: "circle", symbolSize: 8,
        lineStyle: { color: "#28a745", width: 3 },
        itemStyle: { color: "#28a745" },
        areaStyle: { color: "rgba(40,167,69,0.1)" },
      },
      {
        name: "Absent", type: "line", data: absent, smooth: true,
        symbol: "diamond", symbolSize: 8,
        lineStyle: { color: "#dc3545", width: 3 },
        itemStyle: { color: "#dc3545" },
      },
      {
        name: "Late", type: "line", data: late, smooth: true,
        symbol: "triangle", symbolSize: 8,
        lineStyle: { color: "#ffc107", width: 3 },
        itemStyle: { color: "#ffc107" },
      },
    ],
  };
}