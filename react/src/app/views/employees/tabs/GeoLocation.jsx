import { useEffect, useMemo, useState } from "react";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Card, Button } from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock"; 

export default function LocationTable() {
  const [locations, setLocations] = useState([]);

  const columns = useMemo(
    () => [
      { accessorKey: "location", header: "Location", searchable: true },
      { accessorKey: "latitude", header: "Latitude" },
      { accessorKey: "longitude", header: "Longitude" },
      {
        accessorKey: "action",
        header: "Action",
        style: { textAlign: "center" },
        Cell: ({ row }) => {
          const item = row?.original || {};
          return (
            // <Button
            //   variant="danger"
            //   onClick={() => alert(`Deleting location: ${item.location}`)}
            // >
            //   <i className="i-Close-Window text-18"></i>
            // </Button>
            <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#c4302b",
                  border: "none",
                  borderRadius: "4px",
                }}
                onClick={() => alert(`Deleting location: ${item.location}`)}
              >
                <i className="i-Close-Window text-white"></i>
              </Button>
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    axios
      .get("/api/location/all") // replace with your actual API
      .then(({ data }) => {
        const list = data.map((item, index) => ({
          id: item.id || index + 1,
          location: item.name || "Unknown Location",
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
        }));

        setLocations(list);
      })
      .catch((err) => {
        console.error("Location API Error:", err);
        // fallback static data
        setLocations([
          { id: 1, location: "Myospaz Software Technologies, Pune", latitude: 18.4682929, longitude: 73.7072464 },
        ]);
      });
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: "Location List" },
        ]}
      />

      <Card body>
        <Card.Title>Location Table</Card.Title>

        {locations.length > 0 && (
          <RBTable
            data={locations}
            columns={columns}
            varient="primary"
            footer={{ enablePagination: true, pageSize: 5, pageSizeOptions: [5, 10, 20, 50] }}
            header={{ enableFilters: true, enableDensityToggle: true, enableExportButton: true }}
          />
        )}
      </Card>
    </section>
  );
}
