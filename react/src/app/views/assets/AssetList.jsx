import { useEffect, useMemo, useState } from "react";
import { RBTable } from "@pallassystems/react-bootstrap-table";
import { Row, Col, Card, Button, Badge,Modal, Form,Dropdown} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import { axios } from "fake-db/mock";

export default function SearchInDataTable() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // checkbox ke liye
 
const [showAssetModal, setShowAssetModal] = useState(false);  // Add Asset Modal

  
  

//For edit Modal
const [showModal, setShowModal] = useState(false);
const [editData, setEditData] = useState({});

//Add user button  modal
const [showAdminModal, setShowAdminModal] = useState(false);
const [showEmployeeModal, setShowEmployeeModal] = useState(false);
const [showClientModal, setShowClientModal] = useState(false);

const [showColumnMenu, setShowColumnMenu] = useState(false);

const [visibleColumns, setVisibleColumns] = useState({
  assetName: true,
  category: true,
  companyAssetCode: true,
  isWorking: true,
  assignTo: true,
  company: true,           //columns visibility
  warrantyDate: true,
  action: true,
});




const columns = useMemo(
  () => [
    {
      dataField: "id",
      text: "Select",
      formatter: (cell, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedIds((prev) =>
              checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
            );
          }}
        />
      ),
    },

    { accessorKey: "assetName", header: "Asset Name", searchable: true },

    { accessorKey: "category", header: "category", searchable: true },

    { accessorKey: "companyAssetCode", header: "Company Asset Code", searchable: true },

    { accessorKey: "isWorking", header: "Is Working?", searchable: true },

    { accessorKey: "assignTo", header: "Assign To", searchable: true },

    { accessorKey: "company", header: "Company", searchable: true },

    { accessorKey: "warrantyDate", header: "Warranty Date", searchable: true },

    {
      accessorKey: "action",
      header: "action",
      Cell: ({ row }) => {
        const item = row; // ✅ RBTable correct usage

        return (
          <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px"
  }}
>
  <Button
    style={{
      width: 32,
      height: 32,
      backgroundColor: "#663399",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }}
    onClick={() => {
      setEditData(item);
      setShowModal(true);
    }}
  >
    <i className="i-Edit text-white"></i>
  </Button>

  <Button
    style={{
      width: 32,
      height: 32,
      backgroundColor: "#c4302b",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }}
  >
    <i className="i-Close-Window text-white"></i>
  </Button>
</div>
        );
      }
    }
  ],
  [selectedIds]
);


  useEffect(() => {
    axios.get("/api/user/all").then(({ data }) => {
      const userList = data.map((item, ind) => ({
        id: item.id || ind + 1,
        index: ind + 1,
         User: item.user || item.name,         
        Contact: item.contact || item.email, 
        LoginInfo: item.loginInfo || item.company, 
        status: item.status || "Active",    
        action: item.action || item.age      
      }));
 
      setUsers(userList);
    }).catch(err => console.error("Data fetch error:", err));
  }, []);useEffect(() => {
    axios.get("/api/user/all").then(({ data }) => {
      const userList = data.map((item, ind) => ({
        id: item.id || ind + 1,
  
        assetName: item.assetName || "Laptop",
        category: item.category || "IT",
        companyAssetCode: item.companyAssetCode || "CMP-001",
        isWorking: item.isWorking || "Yes",
        assignTo: item.assignTo || "Employee",
        company: item.company || "ABC Pvt Ltd",
        warrantyDate: item.warrantyDate || "12-08-2026",
      }));
  
      setUsers(userList);
    });
  }, []);
  

  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Dashboard", path: "/" },
          { name: "Assets ", path: "/Assets/Assets List" },
          { name: "Assets  " }
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
                  onClick={() => setShowAssetModal(true)}
                >
                <span className="ul-btn__icon">
                <i className="i-Add-User text-18"></i>
                </span>
                <span className="ul-btn__text ms-2">Add Asset</span>
                </Button>
                  {/* <Dropdown>
  <Dropdown.Toggle 
    className="btn-icon m-1 d-flex align-items-center text-white border-0" 
    style={{ backgroundColor: "#663399" }}
    id="dropdown-add-user"
  >
    <span className="ul-btn__icon"><i className="i-Add-User text-18"></i></span>
    <span className="ul-btn__text ml-2">Add User</span>
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item onClick={() => setShowAdminModal(true)}>Add Admin</Dropdown.Item>
    <Dropdown.Item onClick={() => setShowEmployeeModal(true)}>Add Employee</Dropdown.Item>
    <Dropdown.Item onClick={() => setShowClientModal(true)}>Add Client</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown> */}


         {/* //Button2 */}
           {/* <Button className="btn-youtube btn-icon m-1 d-flex align-items-center text-white border-0">
                     */}

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
  {/* <Button 
    className="btn-icon d-flex align-items-center justify-content-center me-1" 
    style={{ width: 36, height: 36, backgroundColor: "#007bff", border: "none", borderRadius: "0" }}
  >
    <i className="i-Billing text-18 text-white"></i> 
  </Button> */}

  {/* Eye Icon  */}
  <Button
                    className="btn-icon d-flex align-items-center justify-content-center me-1"
                    style={{ width: 36, height: 36, backgroundColor: "#007bff", border: "none", borderRadius: 0 }}
                  >
                    <i className="i-Billing text-18 text-white"></i>
                  </Button>
                 <Dropdown align="end">
                    <Dropdown.Toggle
                      className="btn-icon d-flex align-items-center justify-content-center"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: "#663399",
                        border: "none",
                        borderRadius: 0
                      }}
                    >
                            <i className="i-Eye text-18 text-white"></i>
                          </Dropdown.Toggle>
              
                          <Dropdown.Menu style={{ backgroundColor: "#7d5bbe" }}>
                            <Dropdown.Item className="text-black">Asset Name</Dropdown.Item>
                            <Dropdown.Item className="text-black">Category</Dropdown.Item>
                            <Dropdown.Item className="text-black">Company Asset Code</Dropdown.Item>
                            <Dropdown.Item className="text-black">Is Working?</Dropdown.Item>
                           <Dropdown.Item className="text-black">	Assign to</Dropdown.Item>
                            <Dropdown.Item className="text-black">Company</Dropdown.Item>
                            <Dropdown.Item className="text-black">Warranty Date</Dropdown.Item>
                            <Dropdown.Item className="text-black">action</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
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

           {/* ================= Add Asset Modal ================= */}
<Modal
  show={showAssetModal}
  onHide={() => setShowAssetModal(false)}
  size="xl"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Add Assets</Modal.Title>
  </Modal.Header>

  <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
    <Form>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label>Asset Name <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" placeholder="Asset Name" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Company Asset Code</Form.Label>
          <Form.Control type="text" placeholder="Company Asset Code" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select>
            <option>Select Category...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Is Working</Form.Label>
          <Form.Select>
            <option>Select Status...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Company</Form.Label>
          <Form.Select>
            <option>Select Company...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Employee</Form.Label>
          <Form.Select>
            <option>Select Employee...</option>
          </Form.Select>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Warranty / AMC End Date <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Manufacturer <span className="text-danger">*</span></Form.Label>
          <Form.Control type="text" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Invoice Number</Form.Label>
          <Form.Control type="text" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Serial Number</Form.Label>
          <Form.Control type="text" />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Asset Image</Form.Label>
          <Form.Control type="file" />
        </Col>

        <Col md={12} className="mb-3">
          <Form.Label>Asset Note</Form.Label>
          <Form.Control as="textarea" rows={4} />
        </Col>
      </Row>
    </Form>
  </Modal.Body>

  <Modal.Footer className="justify-content-center border-0">
    <Button
      style={{
        backgroundColor: "#facc15",
        border: "none",
        padding: "8px 50px"
      }}
      onClick={() => setShowAssetModal(false)}
    >
      Add
    </Button>
  </Modal.Footer>
</Modal>


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