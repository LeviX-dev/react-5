
import EmployeeList from "./EmployeeList";
import EmployeeDetail from "./EmployeeDetail";
import ImportEmployees from "./ImportEmployees";

const employeeRoutes = [
  {
    path: "employees/EmployeeLists",
    element: <EmployeeList />,
  },
  {
    path: "employees/ImportEmployees",
    element: <ImportEmployees />,
  },
  {
    // EmployeeDetail handles all tabs via :tab param
    path: "employees/:id/:tab?",
    element: <EmployeeDetail />,
  },
];

export default employeeRoutes;
