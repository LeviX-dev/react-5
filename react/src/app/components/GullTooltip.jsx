import { Tooltip, OverlayTrigger } from "react-bootstrap";

export default function GullTooltip({ position = "bottom", children, title }) {
  return (
    <OverlayTrigger key={position} placement={position} overlay={<Tooltip>{title}</Tooltip>}>
      {children}
    </OverlayTrigger>
  );
}
