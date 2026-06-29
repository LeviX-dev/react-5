import { useState, useEffect } from "react";
import {
  Card,
  Dropdown,
  Modal,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import Breadcrumb from "app/components/Breadcrumb";
import {
  fetchRoles,
  createRole,
  assignNavigationPermissions,
  fetchRoleNavigationPermissions,
} from "../../services/role_permissions_api";
import { fetchNavigations } from "app/navigations";

const DEFAULT_MODULES = {};

const buildModulesFromNavigations = (menuData = []) => {
  const modules = {};

  menuData.forEach((mainMenu) => {
    const mappedItems = [];

    if (mainMenu.id) {
      mappedItems.push({
        id: String(mainMenu.id),
        label: `★ ${mainMenu.name} (Main Access)`,
        checked: false,
      });
    }

    if (Array.isArray(mainMenu.sub) && mainMenu.sub.length > 0) {
      mainMenu.sub.forEach((subMenu) => {
        if (subMenu.id) {
          mappedItems.push({
            id: String(subMenu.id),
            label: subMenu.name,
            checked: false,
          });
        }
      });
    }

    const validItems = mappedItems.filter((i) => Boolean(i.id) && i.id !== "undefined");

    if (validItems.length > 0) {
      modules[mainMenu.name] = validItems;
    }
  });

  return modules;
};

export default function RolePermissionManager() {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  const [newRoleName, setNewRoleName] = useState("");
  const [addingRole, setAddingRole] = useState(false);
  const [addRoleError, setAddRoleError] = useState("");
  const [addRoleSuccess, setAddRoleSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [moduleTemplate, setModuleTemplate] = useState(DEFAULT_MODULES);
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState("");

  useEffect(() => {
    loadRoles();
    loadNavigationModules();
  }, []);

  const loadNavigationModules = async () => {
    setModulesLoading(true);
    setModulesError("");

    try {
      const menuData = await fetchNavigations();
      const mappedModules = buildModulesFromNavigations(menuData);

      setModuleTemplate(mappedModules);
      setModules(mappedModules);
    } catch (error) {
      setModulesError("Could not load menus for permissions.");
      setModuleTemplate(DEFAULT_MODULES);
      setModules(DEFAULT_MODULES);
    } finally {
      setModulesLoading(false);
    }
  };

  const loadRoles = async () => {
    setRolesLoading(true);
    setRolesError("");
    try {
      const data = await fetchRoles();
      console.log("Fetched roles:", data);
      setRoles(data);
    } catch {
      setRolesError("Could not load roles. Is the server running?");
    } finally {
      setRolesLoading(false);
    }
  };

  // Load permissions using the current moduleTemplate and selectedRole
  const loadPermissions = async () => {
    if (!selectedRole) return;
    try {
      const roleData = await fetchRoleNavigationPermissions(selectedRole.id);
      const rolePermissionIds = new Set(
        (roleData.navigationIds || []).map(String)
      );

      const updatedModules = {};
      Object.keys(moduleTemplate).forEach((moduleName) => {
        updatedModules[moduleName] = moduleTemplate[moduleName].map((perm) => ({
          ...perm,
          checked: rolePermissionIds.has(perm.id),
        }));
      });
      setModules(updatedModules);
    } catch (err) {
      console.error(err);
    }
  };

  // FIX: Load permissions every time the modal opens (showModal becomes true with a selectedRole)
  useEffect(() => {
    if (showModal && selectedRole) {
      loadPermissions();
    }
  }, [showModal, selectedRole]); // eslint-disable-line react-hooks/exhaustive-deps
  // loadPermissions is intentionally not a dependency because it uses moduleTemplate which is stable after initial load

  const handleAddRole = async () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) {
      setAddRoleError("Please enter a role name.");
      return;
    }

    setAddingRole(true);
    setAddRoleError("");
    setAddRoleSuccess("");

    try {
      const created = await createRole(trimmed);
      setRoles((prev) => [...prev, created]);
      setAddRoleSuccess(`Role "${created.name}" added successfully.`);
      setTimeout(() => setAddRoleSuccess(""), 3000);
    } catch (err) {
      setAddRoleError(err.message || "Failed to add role.");
    } finally {
      setAddingRole(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleAddRole();
  };

  // FIX: Removed manual setModules(moduleTemplate) – no resetting to unchecked
  const handleSelectRole = (roleId) => {
    const role = roles.find((r) => String(r.id) === String(roleId));
    if (!role) return;
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleCheckboxChange = (moduleName, id) => {
    setModules((prev) => ({
      ...prev,
      [moduleName]: prev[moduleName].map((p) =>
        p.id === id ? { ...p, checked: !p.checked } : p
      ),
    }));
  };

  const getSelectedPermissions = () => {
    const selected = [];
    Object.keys(modules).forEach((moduleName) => {
      modules[moduleName].forEach((perm) => {
        if (perm.checked) {
          selected.push(String(perm.id));
        }
      });
    });
    return selected;
  };

  return (
    <section>
      <Breadcrumb routeSegments={[{ name: "Permissions" }]} />

      <Card body className="mb-3">
        <Form.Label className="fw-semibold mb-1">Add New Role</Form.Label>
        <InputGroup className="mb-1" style={{ maxWidth: 420 }}>
          <Form.Control
            placeholder="Enter role name (e.g. Finance Manager)"
            value={newRoleName}
            onChange={(e) => {
              setNewRoleName(e.target.value);
              setAddRoleError("");
              setAddRoleSuccess("");
            }}
            onKeyDown={handleInputKeyDown}
            disabled={addingRole}
            isInvalid={!!addRoleError}
          />
          <Button
            style={{ backgroundColor: "#288B46", border: "none", minWidth: 110 }}
            onClick={handleAddRole}
            disabled={addingRole}
          >
            {addingRole ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Adding…
              </>
            ) : (
              <>
                <i className="i-Add me-1"></i> Add Role
              </>
            )}
          </Button>
        </InputGroup>

        {addRoleError && <div className="text-danger small mb-2">{addRoleError}</div>}
        {addRoleSuccess && <div className="text-success small mb-2">{addRoleSuccess}</div>}

        <hr className="my-3" />

        <Form.Label className="fw-semibold mb-1">Assign Permissions to Role</Form.Label>
        <div>
          {rolesLoading ? (
            <div className="text-muted small">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading roles…
            </div>
          ) : rolesError ? (
            <div className="text-danger small">
              {rolesError}{" "}
              <Button variant="link" size="sm" className="p-0" onClick={loadRoles}>
                Retry
              </Button>
            </div>
          ) : (
            <Dropdown onSelect={handleSelectRole}>
              <Dropdown.Toggle
                style={{ backgroundColor: "#288B46", border: "none" }}
                disabled={roles.length === 0}
              >
                <i className="i-Management text-18 me-2"></i>
                {roles.length === 0
                  ? "No roles yet — add one above"
                  : "Select Role to Assign Permissions"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {roles.map((role) => (
                  <Dropdown.Item key={role.id} eventKey={role.id}>
                    {role.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        {modulesLoading && <div className="text-muted small mt-2">Loading menus…</div>}
        {modulesError && <div className="text-danger small mt-2">{modulesError}</div>}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            {selectedRole?.name} — Permissions
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#f8f9fa" }}>
          <h6 className="mb-4">Select modules and actions for this role:</h6>
          <Row>
            {Object.keys(modules).map((moduleName) => (
              <Col md={4} key={moduleName} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Header className="bg-white font-weight-bold">
                    <i className="i-Arrow-Right-in-Circle me-2 text-primary"></i>
                    {moduleName}
                  </Card.Header>
                  <Card.Body>
                    {modules[moduleName].map((perm) => (
                      <Form.Check
                        key={perm.id}
                        type="checkbox"
                        id={perm.id}
                        label={perm.label}
                        checked={perm.checked}
                        onChange={() => handleCheckboxChange(moduleName, perm.id)}
                        className="mb-2 small text-muted"
                      />
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>

        <Modal.Footer className="justify-content-center">
          <Button
            style={{ backgroundColor: "#663399", border: "none", padding: "10px 40px" }}
            onClick={async () => {
              try {
                const selectedPermissions = getSelectedPermissions();
                await assignNavigationPermissions(selectedRole.id, selectedPermissions);
                alert("Permissions updated successfully");
                await loadPermissions(); // refresh the modal view with saved permissions
                setShowModal(false);
              } catch (err) {
                console.error(err);
                alert("Failed to update permissions");
              }
            }}
          >
            Submit Permissions
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}