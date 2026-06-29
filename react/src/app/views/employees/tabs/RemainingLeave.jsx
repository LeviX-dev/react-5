import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import Spinner from "react-bootstrap/Spinner";

import Breadcrumb from "app/components/Breadcrumb";
import api from "app/services/api";

export default function RemainingLeave({ employee }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(
    () => [
      // { accessorKey: "policy_name", header: "Policy" },
      { accessorKey: "leave_type", header: "Leave Type" },
      { accessorKey: "allocated_days", header: "Allocated Days" },
      { accessorKey: "used_days", header: "Used Days" },
      { accessorKey: "remaining_days", header: "Remaining Days" },
    ],
    []
  );

const fetchRemaining = async () => {
  try {
    if (!employee?.id) return;

    setLoading(true);

    const res = await api.get("/api/leave/remaining", {
      params: { 
        employee_id: employee.id,
        policy_id: employee.policy_id   // ✅ ADD THIS
      },
    });

    if (res.data?.success) {
      setUsers(res.data.data || []);
    } else {
      setUsers([]);
    }
  } catch (err) {
    console.error("❌ API Error:", err);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (employee?.id) fetchRemaining();
  }, [employee?.id]);

  useEffect(() => {
    const refresh = () => fetchRemaining();

    window.addEventListener("leaveUpdated", refresh);
    return () => window.removeEventListener("leaveUpdated", refresh);
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Remaining Leave" },
        ]}
      />

      <Card body>
        <Card.Title>Remaining Leave</Card.Title>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {!employee?.id && (
          <p className="text-center">Select employee to view leave data</p>
        )}

        {!loading && employee?.id && users.length > 0 && (
          <RBTable
            data={users}
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

        {!loading && employee?.id && users.length === 0 && (
          <p className="text-center">No remaining leave data found</p>
        )}
      </Card>
    </section>
  );
}