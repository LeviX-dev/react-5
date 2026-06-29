import { useEffect, useMemo, useState } from "react";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge,Modal, Form,Dropdown} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  
//For edit Modal
const [showModal, setShowModal] = useState(false);
const [editData, setEditData] = useState({});

//Add user button  modal
const [showAdminModal, setShowAdminModal] = useState(false);
const [showEmployeeModal, setShowEmployeeModal] = useState(false);
const [showClientModal, setShowClientModal] = useState(false);

const columns = useMemo(
    () => [
      {
        accessorKey: "User",
        header: "Name",
        searchable: true
      },
      {
        accessorKey: "action",
        header: "Action",
        Cell: ({ row }) => {
          const item = row?.original || {};
          const userId = item.id;
  
          return (
            <div className="d-flex align-items-center gap-2">
              {/* Edit */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#663399",
                  border: "none"
                }}
                onClick={() => {
                  setEditData(item);
                  setShowModal(true);
                  console.log("Editing user ID:", userId);
                }}
              >
                <i className="i-Edit text-white"></i>
              </Button>
  
              {/* Delete */}
              <Button
                className="btn-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#c4302b",
                  border: "none",
                  borderRadius: "4px"
                }}
                onClick={() => alert("Deleting user ID: " + userId)}
              >
                <i className="i-Close-Window text-white"></i>
              </Button>
            </div>
          );
        }
      }
    ],
    []
  );
  

  useEffect(() => {
    axios
      .get("/api/user/all")
      .then(({ data }) => {
        const userList = data.map((item, ind) => ({
          id: item.id || ind + 1,
          User: item.user || item.name
        }));
  
        setUsers(userList);
      })
      .catch((err) => console.error("Data fetch error:", err));
  }, []);
  

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Assets", path: "/Assets/Category"},
          { name: "Category" }
        ]}
      />

      <div className="mb-3">
      <Row className="mb-4">
  <Col lg={12}>
    <Card body>
      <h5 className="mb-3">Add Asset Category</h5>

      <div className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Name *"
        />

        <Button
          style={{
            backgroundColor: "#2dd4bf",
            border: "none",
            padding: "0 25px"
          }}
        >
          Save
        </Button>
      </div>
    </Card>
  </Col>
</Row>

      </div>


      <Card body className="mt-4">
        <Card.Title>Search In Table</Card.Title>
      
        {users.length > 0 ? (
          <div className="table-responsive">
            <RBTable data={users} varient="primary" columns={columns} />
          </div>
        ) : (
          <div className="text-center p-4">Loading user data...</div>
        )}
      </Card>


{/* //Edit Popup Modal */}
<Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="text-center mb-4">
      <img 
        src="/assets/images/faces/1.jpg" 
        className="rounded-circle" 
        style={{ width: '80px', height: '80px' }} 
        alt="User"
      />
    </div>
    <Form>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" defaultValue={editData?.User?.split(' ')[0]} />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" defaultValue={editData?.User?.split(' ')[1]} />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Username <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" defaultValue={editData?.username || "ATSS027"} />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Email <span className="text-danger">*</span></Form.Label>
          <Form.Control type="email" defaultValue={editData?.Contact} />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" defaultValue={editData?.phone || "8050832165"} />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="min:4 characters" />
        </Col>
        <Col md={12} className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" />
        </Col>
        <Col md={12}>
          <Form.Check type="checkbox" label="Active" defaultChecked={true} />
        </Col>
      </Row>
    </Form>
  </Modal.Body>
  <Modal.Footer className="justify-content-center border-0">
    <Button   className="me-auto" style={{ backgroundColor: '#663399', border: 'none', padding: '8px 60px' }} onClick={() => setShowModal(false)}>
      Edit
    </Button>
  </Modal.Footer>
</Modal>



{/* //add Admin modalpopup*/}
<Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Add Admin</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Row>
        {/* Row 1 */}
        <Col md={6} className="mb-3">
          <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="First Name" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Last Name" />
        </Col>

        {/* Row 2 */}
        <Col md={6} className="mb-3">
          <Form.Label>Username <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Unique Value" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Email <span className="text-danger">*</span></Form.Label>
          <Form.Control type="email" placeholder="example@example.com" />
        </Col>

        {/* Row 3 */}
        <Col md={6} className="mb-3">
          <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Phone" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="min:4 characters" />
        </Col>

        {/* Row 4 */}
        <Col md={6} className="mb-3">
          <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="Re-type Password" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" />
        </Col>

        
        <Col md={12} className="mt-2">
          <Form.Check 
            type="checkbox" 
            label="Active" 
            defaultChecked={true} 
            className="text-primary"
          />
        </Col>
      </Row>
      
      <Button 
        style={{ backgroundColor: '#663399', border: 'none', padding: '8px 40px' }} 
        className="mt-4"
        onClick={() => setShowAdminModal(false)}
      >
        Add
      </Button>
    </Form>
  </Modal.Body>
</Modal>


{/* //add Employee modapopup */}
<Modal show={showEmployeeModal} onHide={() => setShowEmployeeModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Add Employee</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
    <Form>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="First Name" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Last Name" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Staff Id <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Staff Id" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Email <span className="text-danger">*</span></Form.Label>
          <Form.Control type="email" placeholder="example@example.com" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Phone" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Date Of Birth <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Gender...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Company <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Company...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Department <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Department...</option>
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Designation...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Office Shift <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Office Shift...</option>
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Username <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Unique Value" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Role <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Role...</option>
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="Re-type Password" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Attendance Type <span className="text-danger">*</span></Form.Label>
          <Form.Select>
            <option>Select Attendance Type...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Date Of Joining <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" />
        </Col>
      </Row>
      <div className="mt-3">
        <Button 
          style={{ backgroundColor: '#663399', color: '#ffff', border: 'none', padding: '8px 40px' }}
          onClick={() => setShowEmployeeModal(false)}
        >
          Add
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>


{/* //add Client modapopup */}
<Modal show={showClientModal} onHide={() => setShowClientModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Add Client</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ maxHeight: '85vh', overflowY: 'auto' }}>
    <Form>
      <Row>
       
        <Col md={6} className="mb-3">
          <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="First" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Last" />
        </Col>

       
        <Col md={6} className="mb-3">
          <Form.Label>Company <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Company" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Username <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Username" />
        </Col>

       
        <Col md={6} className="mb-3">
          <Form.Label>Email <span className="text-danger">*</span></Form.Label>
          <Form.Control type="email" placeholder="example@example.com" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Phone" />
        </Col>

       
        <Col md={6} className="mb-3">
          <Form.Label>Website</Form.Label>
          <Form.Control type="text" placeholder="Website" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Col>

      
        <Col md={6} className="mb-3">
          <Form.Label>Address Line 1</Form.Label>
          <Form.Control type="text" placeholder="Address Line 1" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Address Line 2</Form.Label>
          <Form.Control type="text" placeholder="Address Line 2" />
        </Col>

       
        <Col md={6} className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control type="text" placeholder="City" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>State/Province</Form.Label>
          <Form.Control type="text" placeholder="State/Province" />
        </Col>

     
        <Col md={6} className="mb-3">
          <Form.Label>ZIP</Form.Label>
          <Form.Control type="text" placeholder="ZIP" />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>Country</Form.Label>
          <Form.Select>
            <option>Select Country...</option>
            <option value="IN">India</option>
            <option value="US">USA</option>
          </Form.Select>
        </Col>

        {/* Image Upload */}
        <Col md={12} className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" />
        </Col>
      </Row>

      <div className="mt-2">
        <Button 
          style={{ backgroundColor: '#663399', color: '#ffff', border: 'none', padding: '8px 30px' }}
          onClick={() => setShowClientModal(false)}
        >
          Add
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

    </section>
  );
}