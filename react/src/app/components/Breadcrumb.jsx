import { NavLink } from "react-router-dom";

export default function Breadcrumb({ routeSegments }) {
  const lastIndex = routeSegments.length - 1;

  return (
    <div className="breadcrumb">
      <h1>{routeSegments[lastIndex]["name"]}</h1>

      <ul>
        {routeSegments.map((route, index) => (
          <li key={index}>
            {index !== lastIndex ? (
              <NavLink to={route.path} className="capitalize text-muted">
                {route.name}
              </NavLink>
            ) : (
              <span className="capitalize text-muted">{route.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
