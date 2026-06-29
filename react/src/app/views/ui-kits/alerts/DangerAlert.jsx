import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function DangerAlert() {
  const [showAlert, setShowAlert] = useState(true);

  return showAlert ? (
    <Alert variant="danger" dismissible onClose={() => setShowAlert(false)}>
      <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
      <p>
        Change this and that and try again. Duis mollis, est non commodo luctus, nisi erat porttitor
        ligula, eget lacinia odio sem nec elit. Cras mattis consectetur purus sit amet fermentum.
      </p>
    </Alert>
  ) : (
    <Button variant="danger" onClick={() => setShowAlert(true)}>
      Show Alert
    </Button>
  );
}
