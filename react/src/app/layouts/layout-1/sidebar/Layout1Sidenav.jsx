import { NavLink } from "react-router-dom";
import ScrollBar from "react-perfect-scrollbar";
import clsx from "clsx";

import DropDownMenu from "app/components/DropDownMenu";
import useNavigations from "app/hooks/useNavigations";
import useSidebar from "./useSidebar";

export default function Layout1Sidenav() {
  const navigations = useNavigations();
  const { open, state, secondaryNavOpen, closeSecSidenav, onMainItemMouseEnter } =
    useSidebar(navigations);
  const { sub } = state.selectedItem || {};

  return (
    <div className="side-content-wrap">
      {/* PRIMARY SIDEBAR NAVIGATION */}
      <ScrollBar className={clsx("sidebar-left o-hidden rtl-ps-none", { open })}>
        <ul className="navigation-left">
          {navigations.map((item, i) => (
            <li
              key={i}
              onMouseEnter={() => onMainItemMouseEnter(item)}
              className={clsx("nav-item", { active: state.selectedItem === item })}>
              {item.path && item.type !== "extLink" && (
                <NavLink className="nav-item-hold" to={item.path}>
                  <i className={`nav-icon ${item.icon}`} />
                  <span className="nav-text">{item.name}</span>
                </NavLink>
              )}

              {item.path && item.type === "extLink" && (
                <a className="nav-item-hold" href={item.path}>
                  <i className={`nav-icon ${item.icon}`} />
                  <span className="nav-text">{item.name}</span>
                </a>
              )}

              {!item.path && (
                <div className="nav-item-hold">
                  <i className={`nav-icon ${item.icon}`} />
                  <span className="nav-text">{item.name}</span>
                </div>
              )}

              <div className="triangle" />
            </li>
          ))}
        </ul>
      </ScrollBar>

      {/* SECONDARY SIDEBAR NAVIGATION */}
      <ScrollBar
        className={clsx("sidebar-left-secondary o-hidden rtl-ps-none", { open: secondaryNavOpen })}>
        {sub && <DropDownMenu menu={sub} closeSecSidenav={closeSecSidenav} />}

        <span />
      </ScrollBar>

      {/* SIDEBAR OVERLAY FOR HANDING SECONDARY SIDEBAR HIDE */}
      <div
        onMouseEnter={closeSecSidenav}
        className={clsx("sidebar-overlay", { open: secondaryNavOpen })}
      />
    </div>
  );
}
