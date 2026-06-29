import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import api from "app/services/api";
import { getDaysUntil } from "./dashboardHolidayUtils";

export default function TopSellingProducts() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api
      .get("/api/calendar/upcoming-holidays")
      .then(({ data }) => setHolidays(data))
      .catch((err) => {
        console.error("Upcoming holidays error:", err);
        setHolidays([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatMonth = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short" });

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h3" className="mb-3">Upcoming Holidays</Card.Title>
          <div className="placeholder-glow d-flex flex-column gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="d-flex gap-3 align-items-center">
                <span className="placeholder rounded" style={{ width: 60, height: 60 }} />
                <div className="flex-grow-1">
                  <span className="placeholder col-8 d-block mb-1" />
                  <span className="placeholder col-5 d-block" />
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title as="h3" className="mb-0">Upcoming Holidays</Card.Title>
          <Link to="/calendar" className="text-primary text-small">View All</Link>
        </div>

        {holidays.length === 0 ? (
          <div className="text-center py-4">
            <i className="i-Calendar text-muted" style={{ fontSize: 48 }} />
            <p className="text-muted mt-2 mb-0">No upcoming holidays</p>
          </div>
        ) : (
          holidays.map((h, idx) => {
            const { label, cls } = getDaysUntil(h.event_date);

            return (
              <div
                key={h.id ?? idx}
                className="d-flex gap-3 align-items-center border-bottom pb-3 mb-1"
              >
                <div
                  className="bg-light rounded text-center p-2 flex-shrink-0"
                  style={{ minWidth: 64 }}
                >
                  <div className="text-20 fw-bold text-primary">
                    {new Date(h.event_date).getDate()}
                  </div>
                  <div className="text-small text-muted">{formatMonth(h.event_date)}</div>
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex align-items-center gap-1">
                    {h.icon && <span>{h.icon}</span>}
                    <h5 className="mb-0 text-truncate">{h.title}</h5>
                  </div>
                  {h.description && (
                    <p className="text-small text-muted m-0 text-truncate">{h.description}</p>
                  )}
                </div>

                <span className={`badge ${cls} flex-shrink-0`}>{label}</span>
              </div>
            );
          })
        )}
      </Card.Body>
    </Card>
  );
}