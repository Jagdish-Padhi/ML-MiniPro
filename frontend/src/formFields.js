/** Turn the backend's JSON schema into form field descriptions, so the form never
 *  hardcodes feature names, options or limits. */
export function buildFields(schema) {
  return Object.entries(schema.properties).map(([name, property]) => ({
    name,
    label: property.title,
    kind: property.enum ? "select" : "number",
    options: property.enum ?? [],
    min: property.minimum,
    max: property.maximum,
    integer: property.type === "integer",
  }));
}

/** Quick checks so obvious mistakes are caught before a request is sent.
 *  The backend remains the authority and repeats every check. */
export function validateValues(fields, values) {
  const errors = {};
  for (const field of fields) {
    const raw = values[field.name];
    if (raw === undefined || raw === "") {
      errors[field.name] = "Required";
    } else if (field.kind === "number") {
      const number = Number(raw);
      if (Number.isNaN(number)) errors[field.name] = "Enter a number";
      else if (field.integer && !Number.isInteger(number)) errors[field.name] = "Enter a whole number";
      else if (number < field.min || number > field.max)
        errors[field.name] = `Enter a value from ${field.min} to ${field.max}`;
    }
  }
  return errors;
}

export function toRequestBody(fields, values) {
  return Object.fromEntries(
    fields.map((f) => [f.name, f.kind === "number" ? Number(values[f.name]) : values[f.name]])
  );
}
