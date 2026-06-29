import { Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import merge from "lodash/merge";
import clsx from "clsx";

import Layout2Header from "./header";
import Layout2Sidenav from "./sidebar";
import Footer from "../shared/Footer";

import Loading from "app/components/Loading";
import GullSearch from "app/layouts/shared/GullSearch";
import { setLayoutSettings } from "app/redux/layout/layoutSlice";
import useGeoFenceMonitor from "app/hooks/useGeoFenceMonitor";
import api from "app/services/api";

export default function Layout2({ children }) {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.layout);
  const authUser = useSelector((state) => state.auth.user);
  const employeeId = authUser?.employee_id || authUser?.user_id || authUser?.id;

  const { leftSidebar, header, searchBox } = settings.layout2Settings;

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
      const { log_id } = event.detail || {};
      if (log_id) {
        setOpenLogId(log_id);  // Use log_id directly from check-in response
      } else {
        fetchGeoState();  // Fallback if no detail provided
      }
    };

    window.addEventListener("geofence:checkin", handleCheckin);
    return () => window.removeEventListener("geofence:checkin", handleCheckin);
  }, [fetchGeoState]);


  const handleSearchBoxClose = () => {
    const merged = merge({}, settings, {
      layout2Settings: { searchBox: { open: false } }
    });

    dispatch(setLayoutSettings(merged));
  };

  return (
    <div>
    
      <div
        className={clsx("app-admin-wrap layout-sidebar-compact clearfix", {
          "sidenav-open": leftSidebar.open,
          [leftSidebar.theme]: true
        })}>
        <Layout2Sidenav />

        <div
          className={clsx("main-content-wrap d-flex flex-column", {
            "sidenav-open": leftSidebar.open
          })}>
          {/* HEADER SECTION */}
          {header.show ? <Layout2Header /> : null}

          <Suspense fallback={<Loading />}>
            <div className="main-content">{children}</div>
          </Suspense>

          {/* FOOTER SECTION */}
          <Footer />
        </div>
      </div>

      <GullSearch open={searchBox.open} handleClose={handleSearchBoxClose} />
    </div>
  );
}
