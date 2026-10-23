import { describe, expect, it } from "vitest";
import { buildFields, toRequestBody, validateValues } from "../formFields";
import { optionLabel } from "../format";
import { SCHEMA } from "./fakeBackend";

const fields = buildFields(SCHEMA);

describe("buildFields", () => {
  it("creates numeric and select fields from the backend schema", () => {
    expect(fields.map((f) => f.kind)).toEqual(["number", "select", "select"]);
    expect(fields[0]).toMatchObject({ min: 20, max: 100, integer: true });
  });
});

describe("validateValues", () => {
  it("flags empty fields", () => {
    expect(validateValues(fields, {})).toMatchObject({ person_age: "Required", person_gender: "Required" });
  });
  it("flags out-of-range and fractional ages", () => {
    expect(validateValues(fields, { person_age: "5" }).person_age).toMatch(/from 20 to 100/);
    expect(validateValues(fields, { person_age: "30.5" }).person_age).toMatch(/whole number/);
  });
  it("accepts a complete valid form", () => {
    const values = { person_age: "30", person_gender: "male", loan_intent: "EDUCATION" };
    expect(validateValues(fields, values)).toEqual({});
    expect(toRequestBody(fields, values)).toEqual({ person_age: 30, person_gender: "male", loan_intent: "EDUCATION" });
  });
});

describe("optionLabel", () => {
  it("makes dataset codes readable", () => {
    expect(optionLabel("RENT")).toBe("Rent");
    expect(optionLabel("HOMEIMPROVEMENT")).toBe("Home improvement");
    expect(optionLabel("female")).toBe("Female");
    expect(optionLabel("High School")).toBe("High School");
  });
});
