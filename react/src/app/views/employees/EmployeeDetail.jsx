import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import General from "./tabs/General";
import Profile from "./tabs/Profile";
import SetSalary from "./tabs/SetSalary";
import Leave from "./tabs/Leave";
import PaySlip from "./tabs/PaySlip";
import RemainingLeave from "./tabs/RemainingLeave";
import GeoLocation from "./tabs/GeoLocation";
import api from "app/services/api";

// ------------------------------------------------------
// Responsive hook
// ------------------------------------------------------
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ------------------------------------------------------
// Responsive Tab Bar
// ------------------------------------------------------
const TabBar = ({ tabs, activeTab, onTabClick, isMobile }) => {
  return (
    <>
      {/* Inject scrollbar-hide style once */}
      <style>{`
        .tab-scroll-container::-webkit-scrollbar { display: none; }
        .tab-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
        .tab-item { transition: color 0.18s, border-color 0.18s, background 0.18s; }
        .tab-item:hover { color: #663399 !important; }
      `}</style>

      {isMobile ? (
        /* ── Mobile: horizontally scrollable pill strip ── */
        <div
          className="tab-scroll-container"
          style={{
            display:       "flex",
            overflowX:     "auto",
            gap:           8,
            padding:       "4px 0 10px",
            borderBottom:  "2px solid #e9ecef",
          }}
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                className="tab-item"
                onClick={() => onTabClick(t.key)}
                style={{
                  flexShrink:      0,
                  padding:         "7px 16px",
                  borderRadius:    20,
                  border:          isActive ? "none" : "1px solid #dee2e6",
                  backgroundColor: isActive ? "#663399" : "#fff",
                  color:           isActive ? "#fff" : "#555",
                  fontWeight:      isActive ? 700 : 500,
                  fontSize:        13,
                  cursor:          "pointer",
                  whiteSpace:      "nowrap",
                  boxShadow:       isActive ? "0 2px 8px rgba(102,51,153,0.25)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Desktop: underline tabs ── */
        <div
          style={{
            display:      "flex",
            gap:          0,
            borderBottom: "2px solid #e9ecef",
            overflowX:    "auto",
          }}
          className="tab-scroll-container"
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                className="tab-item"
                onClick={() => onTabClick(t.key)}
                style={{
                  padding:         "10px 22px",
                  border:          "none",
                  borderBottom:    isActive ? "2px solid #663399" : "2px solid transparent",
                  marginBottom:    -2,
                  backgroundColor: "transparent",
                  color:           isActive ? "#663399" : "#666",
                  fontWeight:      isActive ? 700 : 500,
                  fontSize:        14,
                  cursor:          "pointer",
                  whiteSpace:      "nowrap",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------
export default function EmployeeDetail() {
  const { id, tab } = useParams();
  const navigate    = useNavigate();
  const isMobile    = useIsMobile();

  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState(tab || "general");

  const tabs = [
    { key: "general",   label: "General"   },
    { key: "set-salary", label: "Set Salary" },
    { key: "leave",      label: "Leave"      },
    { key: "pay-slip",   label: "Pay Slip"   },
    // { key: "profile",          label: "Profile"          },
    // { key: "remaining-leave",  label: "Remaining Leave"  },
    // { key: "geo-location",     label: "Geo Location"     },
  ];

  // Fetch employee
  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/employees/${id}`)
      .then((res) => {
        setEmployee(res.data.data);
        console.log("Fetched Employee:", res.data.data);
      })
      .catch((err) => console.error("Fetch Error:", err));
  }, [id]);

  // Default tab redirect
  useEffect(() => {
    if (!tab) {
      navigate(`/employees/${id}/general`, { replace: true });
    } else {
      setActiveTab(tab);
    }
  }, [tab, id, navigate]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`/employees/${id}/${tabName}`);
  };

  if (!employee) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <div style={{ textAlign: "center", color: "#888" }}>
          <div className="spinner-border spinner-border-sm" role="status" />
          <p style={{ marginTop: 8, fontSize: 13 }}>Loading employee...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "12px 10px" : "20px 24px" }}>

      {/* ── Employee header ── */}
      <div style={{
        display:        "flex",
        alignItems:     isMobile ? "flex-start" : "center",
        flexDirection:  isMobile ? "column" : "row",
        gap:            isMobile ? 4 : 12,
        marginBottom:   isMobile ? 16 : 20,
      }}>
        {/* Avatar circle */}
        <div style={{
          width:           isMobile ? 42 : 50,
          height:          isMobile ? 42 : 50,
          borderRadius:    "50%",
          backgroundColor: "#663399",
          color:           "#fff",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          fontSize:        isMobile ? 16 : 20,
          fontWeight:      700,
          flexShrink:      0,
        }}>
          {employee.first_name?.[0]?.toUpperCase()}{employee.last_name?.[0]?.toUpperCase()}
        </div>

        <div>
          <h2 style={{
            margin:     0,
            fontSize:   isMobile ? 18 : 24,
            fontWeight: 700,
            color:      "#222",
            lineHeight: 1.2,
          }}>
            {employee.first_name} {employee.last_name}
          </h2>
          {(employee.designation || employee.department) && (
            <p style={{ margin: "2px 0 0", fontSize: isMobile ? 12 : 13, color: "#888" }}>
              {[employee.designation, employee.department].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        isMobile={isMobile}
      />

      {/* ── Tab content ── */}
      <div style={{ marginTop: isMobile ? 14 : 20 }}>
        {activeTab === "general"    && <General    employee={employee} />}
        {activeTab === "set-salary" && <SetSalary  employee={employee} />}
        {activeTab === "leave"      && <Leave       employee={employee} />}
        {activeTab === "pay-slip"   && <PaySlip     employee={employee} />}
        {/* {activeTab === "profile"         && <Profile        employee={employee} />} */}
        {/* {activeTab === "remaining-leave" && <RemainingLeave  employee={employee} />} */}
        {/* {activeTab === "geo-location"    && <GeoLocation     employee={employee} />} */}
      </div>
    </div>
  );
}