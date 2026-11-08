import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CookieConsent from "./CookieConsent";
import { getLatestPrivacyPolicyVersion, recordConsent } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getLatestPrivacyPolicyVersion: vi.fn(),
  recordConsent: vi.fn(),
}));

const renderBanner = async () => {
  render(<MemoryRouter><CookieConsent /></MemoryRouter>);
  return screen.findByRole("region", { name: "Бисквитки" });
};

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.mocked(getLatestPrivacyPolicyVersion).mockResolvedValue("2026-09-23");
    vi.mocked(recordConsent).mockReset();
    vi.mocked(recordConsent).mockResolvedValue(undefined as never);
    document.cookie = "cookieConsent=; Max-Age=0; Path=/";
  });

  it("says there are no analytics cookies and keeps the details closed at first", async () => {
    await renderBanner();
    expect(screen.getByText(/Нямаме бисквитки за аналитика/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "За какво са бисквитките?" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("heading", { name: "Какво ползваме" })).not.toBeInTheDocument();
  });

  it("explains the cookies, and mentions the page view count, when asked", async () => {
    const user = userEvent.setup();
    await renderBanner();
    await user.click(screen.getByRole("button", { name: "За какво са бисквитките?" }));

    expect(screen.getByRole("heading", { name: "Какво ползваме" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Какво не ползваме" })).toBeInTheDocument();
    expect(screen.getByText(/Броим прегледите на страниците/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Политика за поверителност" })).toHaveAttribute("href", "/privacy-policy");

    await user.click(screen.getByRole("button", { name: "За какво са бисквитките?" }));
    expect(screen.queryByRole("heading", { name: "Какво ползваме" })).not.toBeInTheDocument();
  });

  it.each([
    ["Само необходимите", "INFORMED"],
    ["Отказвам", "REJECTED"],
    ["Приемам", "ACCEPTED"],
  ])("keeps the %s choice and records it as %s, also with the details open", async (name, status) => {
    const user = userEvent.setup();
    await renderBanner();
    await user.click(screen.getByRole("button", { name: "За какво са бисквитките?" }));
    await user.click(screen.getByRole("button", { name }));

    await waitFor(() => expect(recordConsent).toHaveBeenCalledWith({ consent_status: status, policy_version: "2026-09-23" }));
    expect(screen.queryByRole("region", { name: "Бисквитки" })).not.toBeInTheDocument();
  });

  it("does not offer the details when the policy could not be loaded", async () => {
    vi.mocked(getLatestPrivacyPolicyVersion).mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await renderBanner();
    expect(screen.queryByRole("button", { name: "За какво са бисквитките?" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Опитайте отново" })).toBeInTheDocument();
  });
});
