import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { installFetch } from "./fakeBackend";

const fillValidForm = async (user) => {
  await user.type(await screen.findByLabelText("Age (years)"), "30");
  await user.selectOptions(screen.getByLabelText("Gender"), "female");
  await user.selectOptions(screen.getByLabelText("Loan purpose"), "EDUCATION");
};

describe("overview", () => {
  it("shows a loading state, then dataset facts and the model table from the backend", async () => {
    installFetch();
    render(<App />);
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);

    expect(await screen.findByText("990")).toBeInTheDocument();
    expect(await screen.findByText("Model B (selected)")).toBeInTheDocument();
    const row = screen.getByText("Model A").closest("tr");
    expect(within(row).getByText("0.700")).toBeInTheDocument();
  });

  it("explains how to start the backend when it is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    render(<App />);
    const alerts = await screen.findAllByRole("alert");
    expect(alerts[0]).toHaveTextContent(/Cannot reach the backend/);
    expect(alerts[0]).toHaveTextContent(/uvicorn/);
  });
});

describe("prediction form", () => {
  it("sends valid input and shows the predicted outcome with the disclaimer", async () => {
    const { calls } = installFetch();
    const user = userEvent.setup();
    render(<App />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Predict" }));

    expect(await screen.findByText("approved")).toBeInTheDocument();
    expect(screen.getByText(/Classroom demonstration only/)).toBeInTheDocument();
    const post = calls.find((c) => c.url.endsWith("/api/predict"));
    expect(JSON.parse(post.options.body)).toEqual({ person_age: 30, person_gender: "female", loan_intent: "EDUCATION" });
  });

  it("blocks invalid input without calling the backend", async () => {
    const { calls } = installFetch();
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText("Age (years)"), "5");
    await user.click(screen.getByRole("button", { name: "Predict" }));

    expect(await screen.findByText(/from 20 to 100/)).toBeInTheDocument();
    expect(screen.getAllByText("Required").length).toBe(2);
    expect(calls.some((c) => c.url.endsWith("/api/predict"))).toBe(false);
  });

  it("shows backend validation messages next to the field", async () => {
    installFetch({
      predictResponse: () =>
        Promise.resolve({
          ok: false, status: 422,
          json: () => Promise.resolve({ detail: "Some inputs are invalid.", errors: [{ field: "person_age", message: "Rejected by server" }] }),
        }),
    });
    const user = userEvent.setup();
    render(<App />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Predict" }));
    expect(await screen.findByText("Rejected by server")).toBeInTheDocument();
  });

  it("disables the button while predicting", async () => {
    let release;
    installFetch({
      predictResponse: () => new Promise((resolve) => { release = resolve; }),
    });
    const user = userEvent.setup();
    render(<App />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Predict" }));
    expect(await screen.findByRole("button", { name: "Predicting…" })).toBeDisabled();
    release({ ok: true, status: 200, json: () => Promise.resolve({
      predicted_class: 0, predicted_label: "rejected", approval_score: 0.1, model_name: "Model B", disclaimer: "x" }) });
    expect(await screen.findByText("rejected")).toBeInTheDocument();
  });

  it("fills example values and clears the form", async () => {
    installFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByLabelText("Age (years)");
    await user.click(screen.getByRole("button", { name: "Fill example values" }));
    await waitFor(() => expect(screen.getByLabelText("Age (years)")).toHaveValue(30));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Age (years)")).toHaveValue(null);
  });
});
