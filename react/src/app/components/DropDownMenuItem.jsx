import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function DropDownMenuItem({ children, item }) {
  const elementRef = useRef();
  const [collapsed, setCollapsed] = useState(false);
  const [componentHeight, setComponentHeight] = useState(0);

  const calculateHeight = useCallback((node) => {
    if (node.name !== "child") {
      for (let child of node.children) {
        calculateHeight(child);
      }
    }

    setComponentHeight((state) => state + node.clientHeight);
    return;
  }, []);

  useEffect(() => {
    if (elementRef.current) calculateHeight(elementRef.current);
  }, [calculateHeight]);

  const onItemClick = () => {
    setCollapsed((state) => !state);
  };

  return (
    <li className={clsx("nav-item dropdown-sidemenu", { open: collapsed })}>
      <div onClick={onItemClick}>
        <i className={`nav-icon ${item.icon}`}></i>
        <span className="item-name">{item.name}</span>
        <i className="dd-arrow i-Arrow-Down" />
      </div>

      <ul
        ref={elementRef}
        className="submenu"
        style={{ maxHeight: collapsed ? `${componentHeight}px` : "0px" }}>
        {children}
      </ul>
    </li>
  );
}
