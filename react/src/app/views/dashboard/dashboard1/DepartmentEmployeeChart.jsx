import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import api from "app/services/api";

// Palette that complements the existing dashboard colours
const SLICE_COLORS = [
  "#4361ee", "#3bc9db", "#ffc107", "#dc3545",
  "#20c997", "#6f42c1", "#fd7e14", "#0dcaf0",
  "#198754", "#e83e8c",
];

export default function DepartmentEmployeeChart() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api
      .get("/api/dashboard/department-stats")
      .then(({ data: res }) => {
        // Expect: [{ department_name, employee_count }, …]
        setData(Array.isArray(res) ? res : res.data ?? []);
      })
      .catch((err) => {
        console.error("Department stats error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = data.reduce((s, d) => s + Number(d.employee_count), 0);

  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) =>
        `<b>${name}</b><br/>${value} employee${value !== 1 ? "s" : ""} (${percent}%)`,
    },
    legend: {
      orient: "vertical",
      right: "2%",
      top: "center",
      type: "scroll",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: "#555" },
      formatter: (name) => {
        const entry = data.find((d) => d.department_name === name);
        return entry ? `${name}  (${entry.employee_count})` : name;
      },
    },
    series: [
      {
        name: "Employees",
        type: "pie",
        radius: ["42%", "70%"],   // donut style
        center: ["38%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: "bold" },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,.15)" },
        },
        data: data.map((d, i) => ({
          name: d.department_name,
          value: Number(d.employee_count),
          itemStyle: { color: SLICE_COLORS[i % SLICE_COLORS.length] },
        })),
      },
    ],
  };

  /* ── states ── */
  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h3" className="mb-3">Employees by Department</Card.Title>
          <div className="placeholder-glow d-flex flex-column gap-2">
            {[1, 2, 3].map((i) => (
              <span key={i} className="placeholder col-12" style={{ height: 36, borderRadius: 6 }} />
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5 text-muted">
          <i className="i-Bar-Chart" style={{ fontSize: 48 }} />
          <p className="mt-2 mb-0">
            {error ? "Failed to load department data." : "No department data available."}
          </p>
        </Card.Body>
      </Card>
    );
  }

  /* ── main render ── */
  return (
    <Card className="mb-4">
      <Card.Body>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <Card.Title as="h3" className="mb-0">Employees by Department</Card.Title>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              Distribution across {data.length} department{data.length !== 1 ? "s" : ""}
            </p>
          </div>
          <span
            className="badge bg-primary"
            style={{ fontSize: 13, padding: "6px 12px", borderRadius: 20 }}
          >
            {total} Total
          </span>
        </div>

        {/* Donut chart */}
        <ReactECharts option={pieOption} style={{ height: 280 }} />

        {/* Mini bar rankings below the chart */}
        <div className="mt-2 d-flex flex-column gap-2">
          {[...data]
            .sort((a, b) => b.employee_count - a.employee_count)
            .slice(0, 5)
            .map((dept, i) => {
              const pct = total ? Math.round((dept.employee_count / total) * 100) : 0;
              const color = SLICE_COLORS[
                data.findIndex((d) => d.department_name === dept.department_name) %
                  SLICE_COLORS.length
              ];
              return (
                <div key={dept.department_name}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span className="text-muted fw-semibold">{dept.department_name}</span>
                    <span style={{ color }}>
                      {dept.employee_count} ({pct}%)
                    </span>
                  </div>
                  <div
                    className="rounded-pill"
                    style={{ height: 6, background: "#eef0f5" }}
                  >
                    <div
                      className="rounded-pill"
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: color,
                        transition: "width .6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card.Body>
    </Card>
  );
}