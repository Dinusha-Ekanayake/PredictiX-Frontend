import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const changeMyPassword = vi.fn<(current: string, next: string) => Promise<void>>();
const toastSuccess = vi.fn();

vi.mock("@/lib/api/userProfileApi", () => ({
  changeMyPassword: (current: string, next: string) => changeMyPassword(current, next),
}));
vi.mock("@/lib/customToast", () => ({ toast: { success: (...a: unknown[]) => toastSuccess(...a) } }));

import ChangePasswordCard from "./ChangePasswordCard";

function fill(current: string, next: string, confirm: string) {
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: /change password/i }));
}

describe("ChangePasswordCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<ChangePasswordCard />);
  });

  it.each([
    ["no current password", "", "longenough1", "longenough1", "Enter your current password."],
    ["a short password", "old-pass", "short", "short", "Use at least 8 characters."],
    ["surrounding spaces", "old-pass", " spaced-out ", " spaced-out ", "Passwords cannot start or end with spaces."],
    ["digits only", "old-pass", "12345678", "12345678", "Use letters as well as numbers."],
    ["the same password", "same-pass1", "same-pass1", "same-pass1", "Choose a password different from the current one."],
    ["a mismatched confirmation", "old-pass", "new-pass-1", "new-pass-2", "The new passwords do not match."],
  ])("blocks %s without calling the API", (_name, current, next, confirm, message) => {
    fill(current, next, confirm);
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(changeMyPassword).not.toHaveBeenCalled();
  });

  it("submits a valid change, clears the form and confirms", async () => {
    changeMyPassword.mockResolvedValue();
    fill("old-pass", "brand-new-pass", "brand-new-pass");

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Password changed", expect.anything()));
    expect(changeMyPassword).toHaveBeenCalledWith("old-pass", "brand-new-pass");
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    expect(screen.getByLabelText("New password")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the server's reason when the change is refused", async () => {
    changeMyPassword.mockRejectedValue(new Error("Current password is incorrect."));
    fill("wrong-pass", "brand-new-pass", "brand-new-pass");

    expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect.");
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.getByLabelText("New password")).toHaveValue("brand-new-pass");
  });
});
