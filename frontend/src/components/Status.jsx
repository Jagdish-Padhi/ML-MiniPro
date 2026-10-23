export function Loading({ what }) {
  return (
    <p className="status" role="status">
      Loading {what}…
    </p>
  );
}

export function ErrorNotice({ error }) {
  return (
    <p className="notice error" role="alert">
      {error.message}
    </p>
  );
}
