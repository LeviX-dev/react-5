import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="not-found-wrap text-center">
      <h1 className="text-60">Access Denied!</h1>
      <p className="text-36 subheading mb-3">Error!</p>
      <p className="mb-5 text-muted text-18">You do not have permission to acces this page.</p>

      <Link to="/" className="btn btn-lg btn-primary btn-rounded">
        Go back to home
      </Link>
    </div>
  );
}
