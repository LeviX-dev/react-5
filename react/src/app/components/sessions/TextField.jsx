export default function TextField({ label, error, helperText, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{label}</label>
      <input className="form-control form-control-rounded" {...props} />
      {error && <div className="text-danger mt-1 ms-2">{helperText}</div>}
    </div>
  );
}
