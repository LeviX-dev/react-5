import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function SuccessAlert() {
  const [show, setShow] = useState(true);

  return show ? (
    <Alert show={show} variant="success">
      <Alert.Heading>How's it going?!</Alert.Heading>
      <p>
        Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec
        elit. Cras mattis consectetur purus sit amet fermentum.
      </p>
      <hr className="my-3" />
      <div className="d-flex justify-content-end">
        <Button onClick={() => setShow(false)} variant="outline-success">
          Close me ya'll!
        </Button>
      </div>
    </Alert>
  ) : (
    <Button onClick={() => setShow(true)}>Show Alert</Button>
  );
}
