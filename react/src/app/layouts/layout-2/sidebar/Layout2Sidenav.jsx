import { NavLink } from "react-router-dom";
import Srcollbar from "react-perfect-scrollbar";
import clsx from "clsx";

import useSidebar from "./useSidebar";
import DropDownMenu from "app/components/DropDownMenu";

export default function Layout2Sidenav() {
  const { closeSecSidenav, onMainItemMouseEnter, open, secondaryNavOpen, state, navigations } = useSidebar();
  const { name, description, sub } = state.selectedItem || {};

  console.log("Layout2Sidenav rendering with navigations:", navigations);

  return (
    <div className="side-content-wrap">
      <Srcollbar className={clsx("sidebar-left o-hidden rtl-ps-none", { open })}>
        <ul className="navigation-left">
          {navigations.map((item, i) => (
            <li
              key={i}
              onMouseEnter={() => onMainItemMouseEnter(item)}
              className={clsx("nav-item", { active: item.name === name })}>
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
              <div className="triangle"></div>
            </li>
          ))}
        </ul>
      </Srcollbar>

      <Srcollbar
        className={clsx("sidebar-left-secondary o-hidden rtl-ps-none", { open: secondaryNavOpen })}>
        <i className="sidebar-close i-Close" onClick={closeSecSidenav} />

        <div className="logo m-4 mt-3">
          <img src="/assets/images/logo-text.png" alt="logo" />
        </div>

        <div className="header m-4 mb-0">
          <h5 className="font-weight-bold mb-1">{name}</h5>
          <p>{description}</p>
        </div>

        {sub && <DropDownMenu menu={sub} closeSecSidenav={closeSecSidenav} />}
      </Srcollbar>

      <div className={clsx("sidebar-overlay", { open: secondaryNavOpen })} />
    </div>
  );
}
