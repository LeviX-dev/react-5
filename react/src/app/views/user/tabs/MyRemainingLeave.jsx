import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function MyRemainingLeave({ employee }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(
    () => [
      { accessorKey: "leave_type",      header: "Leave Type" },
      { accessorKey: "allocated_days",  header: "Allocated Days" },
      { accessorKey: "used_days",       header: "Used Days" },
      { accessorKey: "remaining_days",  header: "Remaining Days" },
    ],
    []
  );

  const fetchRemaining = async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await api.get("/api/leave/remaining", {
        params: { employee_id: employee.id, policy_id: employee.policy_id },
      });
      setRows(res.data?.success ? res.data.data || [] : []);
    } catch (err) {
      console.error("Remaining leave error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee?.id) fetchRemaining();
  }, [employee?.id]);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "My Remaining Leave" },
        ]}
      />

      <Card body>
        <Card.Title>My Remaining Leave</Card.Title>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && rows.length > 0 && (
          <RBTable
            data={rows}
            columns={columns}
            varient="primary"
            footer={{ enablePagination: true }}
            toolbar={{
              enableFilters: true,
              enableGlobalFilter: true,
              enableDensityToggle: true,
              enableExportButton: true,
            }}
          />
        )}

        {!loading && rows.length === 0 && (
          <p className="text-center text-muted">No remaining leave data found.</p>
        )}
      </Card>
    </section>
  );
}
