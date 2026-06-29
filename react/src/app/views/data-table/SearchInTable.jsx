import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import { RBTable } from "@pallassystems/react-bootstrap-table";

import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
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
          { name: "Search In Table" }
        ]}
      />

      <Card body>
        <Card.Title>Search In Table</Card.Title>

        {users.length > 0 && <RBTable data={users} varient="primary" columns={columns} />}
      </Card>
    </section>
  );
}
