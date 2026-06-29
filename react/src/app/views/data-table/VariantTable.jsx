import { useEffect, useMemo, useState } from "react";
import { Col, Form, Card } from "react-bootstrap";
import { RBTable } from "@pallassystems/react-bootstrap-table";

import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function VariantsDataTable() {
  const [users, setUsers] = useState([]);
  const [variant, setVariant] = useState("primary");

  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" },
      { accessorKey: "name", header: "Name", searchable: true },
      { accessorKey: "email", header: "Email", searchable: true },
      { accessorKey: "company", header: "Company", searchable: true },
      { accessorKey: "balance", header: "Balance", searchable: true },
      { accessorKey: "age", header: "Age", searchable: true }
    ],
    []
  );

  useEffect(() => {
    axios.get("/api/user/all").then(({ data }) => {
      const userList = data.map((item, ind) => ({
        age: item.age,
        index: ind + 1,
        name: item.name,
        email: item.email,
        balance: item.balance,
        company: item.company
      }));

      setUsers(userList);
    });
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Data Table", path: "data-table" },
          { name: "Variants" }
        ]}
      />

      <Card body>
        <Card.Title>Different Variants</Card.Title>

        <Col md={6}>
          <Form.Select
            size="lg"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            aria-label="Variants">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="link">Link</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Form.Select>
        </Col>

        {users.length > 0 && <RBTable data={users} varient={variant} columns={columns} />}
      </Card>
    </section>
  );
}
