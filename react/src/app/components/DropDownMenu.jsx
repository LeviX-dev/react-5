import { NavLink } from "react-router-dom";
import DropDownMenuItem from "./DropDownMenuItem";

export default function DropDownMenu({ closeSecSidenav, menu }) {
  const renderLevels = (items) => {
    return items.map((item, i) => {
      if (item.sub) {
        return (
          <DropDownMenuItem key={i} item={item}>
            {renderLevels(item.sub)}
          </DropDownMenuItem>
        );
      }

      return (
        <li key={i} className="nav-item" onClick={closeSecSidenav}>
          <NavLink to={item.path} className={({ isActive }) => (isActive ? "selected" : "")}>
            <i className={`nav-icon ${item.icon}`} />
            <span className="item-name">{item.name}</span>
          </NavLink>
        </li>
      );
    });
  };

  return <ul className="childNav">{renderLevels(menu)}</ul>;
}
