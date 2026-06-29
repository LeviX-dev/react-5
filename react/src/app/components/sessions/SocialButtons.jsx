import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function SocialButtons({ googleHandler, facebookHandler, routeUrl, isLogin }) {
  return (
    <>
      <Link
        to={routeUrl}
        className="btn btn-rounded btn-outline-primary btn-outline-email w-100 my-1 btn-icon-text">
        <i className="i-Mail-with-At-Sign" /> Sign {isLogin ? "in" : "up"} with Email
      </Link>

      <Button
        onClick={googleHandler}
        className="btn btn-rounded btn-outline-google w-100 my-1 btn-icon-text">
        <i className="i-Google-Plus" /> Sign up with Google
      </Button>

      <Button
        onClick={facebookHandler}
        className="btn btn-rounded w-100 my-1 btn-icon-text btn-outline-facebook">
        <i className="i-Facebook-2" /> Sign up with Facebook
      </Button>
    </>
  );
}
