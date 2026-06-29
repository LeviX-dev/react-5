import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export default function LoadingButton({
  children,
  animation,
  className,
  buttonSize,
  spinnerSize,
  loading = false,
  variant = "primary"
}) {
  return (
    <Button
      variant={variant}
      size={buttonSize}
      className={`d-flex flex-row align-items-center gap-2 ${className}`}>
      {loading ? <Spinner className="mr-2" animation={animation} size={spinnerSize} /> : null}
      {children}
    </Button>
  );
}
