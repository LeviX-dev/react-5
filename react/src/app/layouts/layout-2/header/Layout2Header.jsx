import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";

import useHeader from "./useHeader";
import MegaMenu from "app/layouts/shared/MegaMenu";
import api from "app/services/api";

import { userLoggedOut } from "app/redux/auth/authSlice";

import { SHORTCUT_MENUS } from "./data";
import GeoFenceNotificationBell from "app/components/GeoFenceNotificationBell";

export default function Layout2Header() {
  const dispatch = useDispatch();
  const { handleMenuClick, toggleFullScreen, handleSearchBoxOpen } =
    useHeader();
  const handleLogout = async () => {
    try {
      // 🔥 Call backend logout to revoke refresh token
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    // Redux clear
    dispatch(userLoggedOut());

    // LocalStorage clear
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    // 🎯 AuthGuard will detect isAuthenticated=false and redirect to /sessions/signin
  };
  return (
    <div className="main-header">
      <div className="logo">
        <img src="/assets/images/logo.png" alt="Logo" />
      </div>

      <div className="menu-toggle" onClick={handleMenuClick}>
        <div />
        <div />
        <div />
      </div>

      <div className="d-none d-lg-flex align-items-center gap-3">
        {/* MEGA MENU BUTTON */}
        <Dropdown>
          <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
            Mega Menu
          </Dropdown.Toggle>

          <div className="mega-menu">
            <Dropdown.Menu className="mt-3">
              <MegaMenu />
            </Dropdown.Menu>
          </div>
        </Dropdown>

        {/* SEARCH BOX INPUT */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            onFocus={handleSearchBoxOpen}
          />
          <i className="search-icon text-muted i-Magnifi-Glass1" />
        </div>
      </div>

      <div className="m-auto" />

      <div className="header-part-right">
        {/* FULLSCREEN HANDLER */}
        <i
          datafullscreen="true"
          onClick={toggleFullScreen}
          className="i-Full-Screen header-icon d-none d-sm-inline-block"
        />

        {/* APPS MENU BAR */}
        <Dropdown>
          <Dropdown.Toggle as="span" className="toggle-hidden">
            <i className="i-Safe-Box text-muted header-icon" role="button" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="mt-3">
            <div className="menu-icon-grid">
              {SHORTCUT_MENUS.map((menu) => (
                <Link key={menu.text} to={menu.link}>
                  <i className={menu.icon} /> {menu.text}
                </Link>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* NOTIFICATION MENU BAR — Geo-Fence Alerts */}
        <GeoFenceNotificationBell />

        {/* USER PROFILE MENU BAR */}
        <div className="user col px-3">
          <Dropdown>
            <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
              <img
                src="/assets/images/faces/1.jpg"
                id="userDropdown"
                alt="User Profile"
              />
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-3">
              <Dropdown.Item>
                <i className="i-Lock-User me-1" /> Timothy Carlson
              </Dropdown.Item>

              <Dropdown.Item as={Link} to="/">
                <i className="i-Data-Settings me-1" /> Account settings
              </Dropdown.Item>

              <Dropdown.Item as={Link} to="/">
                <i className="i-Billing me-1" /> Billing history
              </Dropdown.Item>

              <Dropdown.Item onClick={handleLogout}>
                <i className="i-Lock-2 me-1" /> Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
