// Runs the real UI against the real running backend and trained model.
// Start the backend first, then:  LIVE_API=1 npm test
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";

describe.skipIf(!process.env.LIVE_API)("live backend", () => {
  it("shows real results and returns a real prediction", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/\(selected\)/, {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await screen.findByText("Target classes")).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Fill example values" }));
    await user.click(screen.getByRole("button", { name: "Predict" }));

    expect(await screen.findByText(/Model score for approval/, {}, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText(/Predicted outcome/)).toBeInTheDocument();
    console.log(document.querySelector(".result").textContent);
    console.log(document.querySelector("tr.selected").textContent);
  });
});
