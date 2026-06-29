import { useEffect } from "react";
import SimpleAlert from "./SimpleAlert";
import DangerAlert from "./DangerAlert";
import SuccessAlert from "./SuccessAlert";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppAlert() {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "UI Kits", path: "/uikits" }, { name: "Alerts" }]} />

      <div className="mb-5">
        <SimpleAlert />
      </div>

      <div className="mb-5">
        <h4 className="mb-3">Success Alert</h4>
        <SuccessAlert />
      </div>

      <div className="mb-5">
        <h4 className="mb-3">Danger Alert</h4>
        <DangerAlert />
      </div>
    </div>
  );
}
