import { useEffect, useMemo, useState } from "react";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge,Modal, Form,Dropdown} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  
  // States for handling Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // State for Row Selection
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      { accessorKey: "index", header: "No" }, 
      { accessorKey: "location", header: "Location", searchable: true },
      { accessorKey: "locationHead", header: "Location Head", searchable: true },
      { accessorKey: "addressLine1", header: "Address Line 1", searchable: true },
      { accessorKey: "addressLine2", header: "Address Line 2", searchable: true },
      { accessorKey: "city", header: "City", searchable: true },
      { accessorKey: "state", header: "State", searchable: true },
      { accessorKey: "country", header: "Country", searchable: true },
      { accessorKey: "zip", header: "ZIP", searchable: true },
      { 
        accessorKey: "action", 
        header: "action", 
        Cell: ({ row }) => {
          const item = row?.original || {};
          const userId = item.id;

          return (
            <div className="d-flex align-items-center gap-2">
              {/* Edit Button */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', backgroundColor: '#663399', border: 'none' }}
                onClick={() => {
                  setEditData(item);    
                  setShowModal(true);   
                  console.log("Editing user ID: " + userId); 
                }}
              >
                <i className="i-Edit text-white"></i>
              </Button>

              {/* Delete Button */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{  width: '28px',   height: '28px',  backgroundColor: '#c4302b',  border: 'none', borderRadius: '4px'
                }}
                onClick={() => alert("Deleting user ID: " + userId)}
              >
                <i className="i-Close-Window "></i>
              </Button>
            </div>
          );
        }
      },
    ],
    []
  );

  useEffect(() => {
    axios.get("/api/user/all").then(({ data }) => {
      const location = data.map((item, ind) => ({
        id: item.id || ind + 1,
         index: ind + 1,
        location: item.location || "MVML (Mahindra) ",
        locationHead: item.locationHead || "Dinesh",
        addressLine1: item.addressLine1 || "Talegaon",
        addressLine2: item.addressLine2 || "",
        city: item.city || "Pune",
        state: item.state || "Maharashtra",
        country: item.country || "India",
        zip: item.zip || "0",
        action: "", 
      }));

      setUsers(location);
    });
  }, []);

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "organisation", path: "/organization/location" },
          { name: "Location" }
        ]}
      />


    <div className="mb-3">
        <Row>
          <Col lg={12}>
            <Card body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex">
                  <Button 
                    className="btn-icon m-1 d-flex align-items-center text-white border-0"
                    style={{ backgroundColor: "#663399" }}
                  
                 onClick={() => {
                 setEditData(null); 
                setShowModal(true); 
              }}
            >

                    <span className="ul-btn__icon"><i className="i-Map-Marker text-18"></i></span>
                    <span className="ul-btn__text ml-2">Add Location</span>
                  </Button>
     

          <Button 
                className="btn-icon m-1 d-flex align-items-center text-white border-0 shadow-none"
                 style={{ backgroundColor: '#c4302b' }} >
                 <span className="ul-btn__icon"><i className="i-Close-Window text-18"></i></span>
                  <span className="ul-btn__text ml-2">Bulk Delete</span>
         </Button>
                </div>


    {/* //right  side icon */}
 <div className="d-flex align-items-center border-0">
  {/* PDF Icon */}
  <Button 
    className="btn-icon d-flex align-items-center justify-content-center me-1" 
    style={{ width: 36, height: 36, backgroundColor: "#f44336", border: "none", borderRadius: "0" }}
  >
    <i className="i-File-Horizontal-Text text-18 text-white"></i> 
  </Button>

  {/* CSV Icon */}
  <Button 
    className="btn-icon d-flex align-items-center justify-content-center me-1" 
    style={{ width: 36, height: 36, backgroundColor: "#ffc107", border: "none", borderRadius: "0" }}
  >
    <i className="i-File-CSV text-18 text-white"></i>
  </Button>

  {/* Print Icon  */}
  <Button 
    className="btn-icon d-flex align-items-center justify-content-center me-1" 
    style={{ width: 36, height: 36, backgroundColor: "#007bff", border: "none", borderRadius: "0" }}
  >
    <i className="i-Billing text-18 text-white"></i> 
  </Button>

  {/* Eye Icon  */}
  <Button 
    className="btn-icon d-flex align-items-center justify-content-center me-1" 
    style={{ width: 36, height: 36, backgroundColor: "#663399", border: "none", borderRadius: "0" }}
  >
    <i className="i-Eye text-18 text-white"></i>
  </Button>
</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>



      <Card body>
        <Card.Title>Location Details</Card.Title>

        {users.length > 0 ? (
          <RBTable 
            data={users} 
            varient="primary" 
            columns={columns} 

          />
        ) : (
          <p>Loading data...</p>
        )}
      </Card>
 

{/* --- popupmodel for  add & edit --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Location" : "Add Location"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Unique Value"
                  defaultValue={editData?.location || ""} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Location Head</Form.Label>
                <Form.Select defaultValue={editData?.locationHead || ""}>
                    <option value="">{editData ? editData.locationHead : "Select Employee..."}</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Address Line 1 <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="full address"
                  defaultValue={editData?.addressLine1 || ""} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Optional" 
                  defaultValue={editData?.addressLine2 || ""} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Optional"
                  defaultValue={editData?.city || ""} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Optional"
                  defaultValue={editData?.state || ""} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Select defaultValue={editData?.country || ""}>
                    <option value="">{editData ? editData.country : "Select Country..."}</option>
                    <option value="India">India</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>ZIP</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Optional"
                  defaultValue={editData?.zip || ""} 
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-end">
         <Button style={{ backgroundColor: '#663399', color: '#ffff', border: 'none', padding: '8px 30px' }}
            onClick={() => setShowModal(false)}
          >
            {editData ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
 