import { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import merge from "lodash/merge";
import clsx from "clsx";

import Layout1Header from "./header";
import Layout1Sidenav from "./sidebar";
import Footer from "../shared/Footer";

import Loading from "app/components/Loading";
import GullSearch from "app/layouts/shared/GullSearch";
import { setLayoutSettings } from "app/redux/layout/layoutSlice";
// import useGeoFenceMonitor from "app/hooks/useGeoFenceMonitor";
import api from "app/services/api";

export default function Layout1({ children }) {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.layout);
  const authUser = useSelector((state) => state.auth.user);
  const employeeId = authUser?.employee_id || authUser?.user_id || authUser?.id;

  const { layout1Settings, footer } = settings || {};

  const [attendanceMethod, setAttendanceMethod] = useState("manual");
  const [openLogId, setOpenLogId] = useState(null);

  const fetchGeoState = useCallback(() => {
    if (!employeeId) return;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      api.get(`/api/employees/${employeeId}`),
      api.get(`/api/attendance/${employeeId}`, { params: { date: today } }),
    ])
      .then(([empRes, logRes]) => {
        setAttendanceMethod(empRes.data?.data?.attendance_method || empRes.data?.employee?.attendance_method || "manual");
        const openLog = (logRes.data?.logs || []).find((l) => l.clock_in && !l.clock_out);
        setOpenLogId(openLog?.id || null);
      })
      .catch(() => {});
  }, [employeeId]);

  useEffect(() => {
    fetchGeoState();

    // Use log_id from event detail (avoids race condition from re-query)
    const handleCheckin = (event) => {
      console.log("[Layout1] geofence:checkin event received:", event.detail);
      const { log_id } = event.detail || {};
      if (log_id) {
        console.log("[Layout1] Setting openLogId to:", log_id);
        setOpenLogId(log_id);  // Use log_id directly from check-in response
      } else {
        console.log("[Layout1] No log_id in event, falling back to fetchGeoState");
        fetchGeoState();  // Fallback if no detail provided
      }
    };

    window.addEventListener("geofence:checkin", handleCheckin);
    return () => window.removeEventListener("geofence:checkin", handleCheckin);
  }, [fetchGeoState]);

  const handleSearchBoxClose = () => {
    const merged = merge({}, settings, {
      layout1Settings: { searchBox: { open: false } }
    });

    dispatch(setLayoutSettings(merged));
  };

  return (
    <Fragment>
    
      <div className="app-admin-wrap layout-sidebar-large">
        {/* HEADER  */}
        <Layout1Header />

        {/* NAVIGATION SIDEBAR */}
        <Layout1Sidenav />

        <div
          className={clsx("main-content-wrap d-flex flex-column", {
            "sidenav-open": layout1Settings.leftSidebar.open
          })}>
          <Suspense fallback={<Loading />}>
            <div className="main-content">{children}</div>
          </Suspense>

          {/* FOOTER AREA */}
          {footer.show ? <Footer /> : null}
        </div>
      </div>

      {/* SEARCH AREA MODAL */}
      <GullSearch open={layout1Settings.searchBox.open} handleClose={handleSearchBoxClose} />
    </Fragment>
  );
}
