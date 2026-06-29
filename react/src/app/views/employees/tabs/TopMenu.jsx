import React from "react";

export default function TopMenu({ tabs = [], activeTab, onTabClick }) {
  if (!tabs.length) return null;

  // Internal CSS styles
  const navStyle = {
    display: "flex",
    borderBottom: "2px solid #ddd",
    marginBottom: "16px",
    flexWrap: "wrap",
  };

  const itemStyle = {
    marginRight: "70px",
  };

  const linkStyle = (isActive) => ({
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#663399" : "#663399",
    borderBottom: isActive ? "2px solid #663399" : "2px solid transparent",
    textDecoration: "none",
  });

  return (
    <nav style={navStyle}>
      {tabs.map((tab) => (
        <div key={tab.key} style={itemStyle}>
          <span
            style={linkStyle(activeTab === tab.key)}
            onClick={() => onTabClick(tab.key)}
          >
            {tab.label}
          </span>
        </div>
      ))}
    </nav>
  );
}
