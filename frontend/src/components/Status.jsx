export function Loading({ what }) {
  return (
    <div className="status-loader" role="status">
      <div className="spinner" aria-hidden="true" />
      <span className="status-text">Loading {what}…</span>
    </div>
  );
}

export function ErrorNotice({ error }) {
  return (
    <p className="notice error" role="alert">
      {error.message}
    </p>
  );
}
