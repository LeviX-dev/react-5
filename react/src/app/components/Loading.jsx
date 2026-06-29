const styles = {
  position: "fixed",
  left: 0,
  right: 0,
  top: "calc(50% - 20px)",
  margin: "auto",
  height: "40px",
  width: "40px",
  zIndex: 324324324
};

export default function Loading() {
  return (
    <div style={styles}>
      <div className="spinner spinner-bubble spinner-bubble-primary" />
    </div>
  );
}
