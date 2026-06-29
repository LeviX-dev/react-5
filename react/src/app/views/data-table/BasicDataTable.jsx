import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import { RBTable } from "@pallassystems/react-bootstrap-table";

import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function BasicDataTable() {
  const [users, setUsers] = useState([]);
  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "company", header: "Company" },
      { accessorKey: "balance", header: "Balance" },
      { accessorKey: "age", header: "Age" }
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
          { name: "Basic Data Table" }
        ]}
      />

      <Card body>
        <Card.Title>Basic Data Table</Card.Title>

        {users.length > 0 && (
          <RBTable
            data={users}
            varient="primary"
            columns={columns}
            footer={{ enablePagination: false }}
            header={{ enableFilters: false, enableDensityToggle: false, enableExportButton: false }}
          />
        )}
      </Card>
    </section>
  );
}
