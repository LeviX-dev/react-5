import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import api from "app/services/api";

const CARD_CONFIG = [
  { key: "totalEmployees", icon: "i-Add-User",   label: "Total Employees", color: "primary" },
  { key: "present",        icon: "i-Check",       label: "Present Today",   color: "success" },
  { key: "late",           icon: "i-Alarm-Clock", label: "Late Today",      color: "warning" },
  { key: "earlyLeaving",   icon: "i-Door",        label: "Early Leaving",   color: "danger"  },
];

export default function ThisYearSales() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    api
      .get("/api/dashboard/stats", { params: { date: today } })
      .then((res) => setMetrics(res.data))
      .catch((err) => {
        console.error("Dashboard stats error:", err);
        setMetrics({ totalEmployees: 0, present: 0, late: 0, earlyLeaving: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Row>
      {CARD_CONFIG.map(({ key, icon, label, color }) => (
        <Col lg={3} sm={6} key={key}>
          <Card className={`card-icon-bg gap-3 card-icon-bg-${color} o-hidden mb-4`}>
            <Card.Body className="align-items-center gap-4">
              <i className={icon} />
              <div className="content gap-1">
                <p className="text-muted mb-0 text-capitalize">{label}</p>
                {loading ? (
                  <div className="placeholder-glow">
                    <span className={`placeholder col-6 bg-${color}`} />
                  </div>
                ) : (
                  <p className={`lead text-${color} text-24 mb-0`}>
                    {metrics?.[key] ?? 0}
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}