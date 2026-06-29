import employeeRoutes from "app/views/employees/employeeRoutes";
import Card from "react-bootstrap/Card";

const USER_ACTIVITY = [
  [
    { title: "Pages / Visit", count: 2065 },
    { title: "New user", count: 465 },
    { title: "Last week", count: 23456 }
  ],
  [
    { title: "Pages / Visit", count: 435 },
    { title: "New user", count: 5435643 },
    { title: "Last week", count: 45435 }
  ],
  [
    { title: "Pages / Visit", count: 545 },
    { title: "New user", count: 54353 },
    { title: "Last week", count: 4643 }
  ]
];

export default function UserActivity() {
  return (
    <Card className="mb-4">
      <Card.Body className="p-0">
        <div className="card-title border-bottom d-flex justify-content-between align-items-center m-0 p-3">
          <h3 className="mb-0">User activity</h3>
          <span className="badge badge-pill bg-warning">Updated daily</span>
        </div>

        {USER_ACTIVITY.map((activity = [], index) => (
          <div key={index} className="d-flex border-bottom justify-content-between p-3">
            {activity.map((item, i) => (
              <div key={i} className="flex-grow-1">
                <span className="text-small text-muted">{item.title}</span>
                <h5 className="m-0">{item.count}</h5>
              </div>
            ))}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
}
