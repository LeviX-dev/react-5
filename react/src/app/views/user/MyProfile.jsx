import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MyGeneral    from "./tabs/MyGeneral";           // read-only General
import MySetSalary  from "./tabs/MySetSalary";         // read-only SetSalary
import MyLeave      from "./tabs/MyLeave";             // read-only Leave
import MyPaySlip    from "./tabs/MyPaySlip";           // read-only PaySlip
// MyRemainingLeave removed — Remaining Leave tab hidden for users

import api from "app/services/api";
import { setUserData } from "app/redux/auth/authSlice";

// ── Responsive hook ────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ── Responsive Tab Bar ────────────────────────────────────────────────────
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

export default function MyProfile() {
  const { tab }    = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const authUser   = useSelector((state) => state.auth.user);
  const isMobile   = useIsMobile();

  // ── IDs ───────────────────────────────────────────────────────────────────
  const userId     = authUser?.user_id || authUser?.id;
  const employeeId = authUser?.employee_id; // logged-in user's linked employee id

  // ── state ─────────────────────────────────────────────────────────────────
  const [user,     setUser]     = useState(null);   // user record
  const [employee, setEmployee] = useState(null);   // employee record (for all other tabs)
  const [activeTab, setActiveTab] = useState(tab || "general");

  const tabs = [
    { key: "general",         label: "General" },
    { key: "set-salary",      label: "Salary" },
    { key: "leave",           label: "Leave" },
    { key: "pay-slip",        label: "Pay Slip" },
  ];

  // ── redirect to default tab ───────────────────────────────────────────────
  useEffect(() => {
    if (!tab || tab === "profile") {
      navigate("/account/settings/general", { replace: true });
    } else {
      setActiveTab(tab);
    }
  }, [tab, navigate]);

  // ── fetch user record ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    api
      .get(`/api/users/${userId}`)
      .then((res) => setUser(res.data?.data || null))
      .catch((err) => console.error("Fetch user error:", err));
  }, [userId]);

  // ── fetch employee record using employeeId from auth ──────────────────────
  useEffect(() => {
    if (!employeeId) return;

    api
      .get(`/api/employees/${employeeId}`)
      .then((res) => setEmployee(res.data?.data || null))
      .catch((err) => console.error("Fetch employee error:", err));
  }, [employeeId]);

  // ── tab navigation ────────────────────────────────────────────────────────
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`/account/settings/${tabName}`);
  };

  // ── guards ────────────────────────────────────────────────────────────────
  if (!userId)   return <div style={{ padding: "16px" }}>Unable to load profile.</div>;
  if (!user)     return <div style={{ padding: "16px" }}>Loading...</div>;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? "12px 10px" : "20px 24px" }}>
      
      {/* ── User header ── */}
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
          {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
        </div>

        <div>
          <h2 style={{
            margin:     0,
            fontSize:   isMobile ? 18 : 24,
            fontWeight: 700,
            color:      "#222",
            lineHeight: 1.2,
          }}>
            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || "User Profile"}
          </h2>
          {(employee?.designation || employee?.department) && (
            <p style={{ margin: "2px 0 0", fontSize: isMobile ? 12 : 13, color: "#888" }}>
              {[employee?.designation, employee?.department].filter(Boolean).join(" · ")}
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

      <div style={{ marginTop: isMobile ? 14 : 20 }}>

        {/* General tab now acts as the default profile view */}
        {activeTab === "general" && (
          employee
            ? <MyGeneral employee={employee} />
            : <div>Loading employee data...</div>
        )}

        {activeTab === "set-salary" && (
          employeeId
            ? <MySetSalary employeeId={employeeId} />
            : <div>No employee linked to your account.</div>
        )}

        {activeTab === "leave" && (
          employee
            ? <MyLeave employee={employee} />
            : <div>Loading employee data...</div>
        )}

        {activeTab === "pay-slip" && (
          employee
            ? <MyPaySlip employee={employee} />
            : <div>Loading employee data...</div>
        )}



      </div>
    </div>
  );
}