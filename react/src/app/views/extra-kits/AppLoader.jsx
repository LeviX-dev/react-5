import Card from "react-bootstrap/Card";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppLoader() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Extra Kits", path: "/extra-kits" },
          { name: "Loader" }
        ]}
      />

      <Card body className="mb-4">
        <Card.Title>Ripple Spinners</Card.Title>

        <div className="p-3">
          <span className="spinner-glow spinner-glow-primary me-5" />
          <span className="spinner-glow spinner-glow-secondary me-5" />
          <span className="spinner-glow spinner-glow-warning me-5" />
          <span className="spinner-glow spinner-glow-danger me-5" />
          <span className="spinner-glow spinner-glow-success me-5" />
          <span className="spinner-glow spinner-glow-info me-5" />
          <span className="spinner-glow spinner-glow-light me-5" />
          <span className="spinner-glow spinner-glow-dark me-5" />
        </div>
      </Card>

      <Card body className="mb-4">
        <Card.Title>Ripple Spinners</Card.Title>

        <div className="p-3">
          <div className="spinner spinner-primary me-3" />
          <div className="spinner spinner-secondary me-3" />
          <div className="spinner spinner-warning me-3" />
          <div className="spinner spinner-danger me-3" />
          <div className="spinner spinner-success me-3" />
          <div className="spinner spinner-info me-3" />
          <div className="spinner spinner-light me-3" />
          <div className="spinner spinner-dark me-3" />
        </div>
      </Card>

      <Card body className="mb-4">
        <Card.Title>Bubble Spinners</Card.Title>

        <div className="spinner-bubble spinner-bubble-primary m-5" />
        <div className="spinner-bubble spinner-bubble-secondary m-5" />
        <div className="spinner-bubble spinner-bubble-warning m-5" />
        <div className="spinner-bubble spinner-bubble-danger m-5" />
        <div className="spinner-bubble spinner-bubble-success m-5" />
        <div className="spinner-bubble spinner-bubble-info m-5" />
        <div className="spinner-bubble spinner-bubble-light m-5" />
        <div className="spinner-bubble spinner-bubble-dark m-5" />
      </Card>

      <Card body className="mb-4">
        <Card.Title>Bubble Spinners</Card.Title>

        <div className="loader-bubble loader-bubble-primary m-5" />
        <div className="loader-bubble loader-bubble-secondary m-5" />
        <div className="loader-bubble loader-bubble-success m-5" />
        <div className="loader-bubble loader-bubble-warning m-5" />
        <div className="loader-bubble loader-bubble-danger m-5" />
        <div className="loader-bubble loader-bubble-info m-5" />
        <div className="loader-bubble loader-bubble-light m-5" />
        <div className="loader-bubble loader-bubble-dark m-5" />
      </Card>
    </div>
  );
}
