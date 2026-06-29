import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopMenu from "../employees/tabs/TopMenu"; // reuse same
import UserGeneral from "../user/tabs/UserGeneral";
import UserProfile from "../user/tabs/UserProfile";
import api from "app/services/api";

export default function UserDetail() {
  const { id, tab } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(tab || "general");

  const tabs = [
    { key: "general", label: "General" },
    { key: "profile", label: "Profile" },
    // { key: "permissions", label: "Permissions" },
  ];

  // ✅ Fetch user by ID
  useEffect(() => {
    if (!id) return;

    api
      .get(`/api/users/${id}`)
      .then((res) => {
        setUser(res.data.data);
        console.log("Fetched User:", res.data.data);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
      });
  }, [id]);

  // ✅ Default tab redirect
  useEffect(() => {
    if (!tab) {
      navigate(`/users/${id}/general`, { replace: true });
    } else {
      setActiveTab(tab);
    }
  }, [tab, id, navigate]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`/users/${id}/${tabName}`);
  };

  const handlePhotoUpdate = (updatedEmployee) => {
    console.log("Photo updated for user:", updatedEmployee);  
    if (!updatedEmployee?.photo) return;

    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, photo: updatedEmployee.photo };
    });
  };

  // ✅ Loading state
  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>{user.username || "User"}</h2>

      <TopMenu activeTab={activeTab} onTabClick={handleTabClick} tabs={tabs} />

      <div style={{ marginTop: "16px" }}>
        {activeTab === "general" && <UserGeneral user={user} />}
        {activeTab === "profile" && (
          <UserProfile user={user} onPhotoUpdate={handlePhotoUpdate} />
        )}
      </div>
    </div>
  );
}
