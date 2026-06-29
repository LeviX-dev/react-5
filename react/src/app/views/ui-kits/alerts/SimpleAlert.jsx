import { Fragment, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function SimpleAlert() {
  const [showCustomAlert, setShowCustomAlert] = useState(true);
  const [variantList, setVariantList] = useState([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark"
  ]);

  const handleClose = (index) => {
    setVariantList((state) => state.filter((_, i) => i !== index));
  };

  const closeCustomAlert = () => {
    setShowCustomAlert(false);
  };

  return (
    <Fragment>
      {showCustomAlert ? (
        <Alert dismissible variant="warning" className="alert-card" onClose={closeCustomAlert}>
          <div className="d-flex align-items-center justify-content-center gap-3">
            Gull makes development life easier!
            <Button variant="warning" className="btn-rounded">
              Buy Now
            </Button>
          </div>
        </Alert>
      ) : null}

      {variantList.map((variant, idx) => (
        <Alert key={idx} variant={variant} dismissible onClose={() => handleClose(idx)}>
          This is a {variant} alert—check it out!
        </Alert>
      ))}
    </Fragment>
  );
}
