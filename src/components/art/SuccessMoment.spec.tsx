import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SuccessMoment } from "./SuccessMoment";

describe("SuccessMoment", () => {
  const renderMoment = (onAction = vi.fn()) => render(
    <SuccessMoment art="bell" title="Песента ти е при нас!" actionLabel="Предложи още една" onAction={onAction}>
      Чака одобрение.
    </SuccessMoment>,
  );

  it("announces the message and moves focus to it, because the form has gone", () => {
    renderMoment();
    expect(screen.getByRole("status")).toHaveTextContent("Чака одобрение.");
    expect(screen.getByRole("heading", { name: "Песента ти е при нас!" })).toHaveFocus();
  });

  it("offers the next step", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMoment(onAction);
    await user.click(screen.getByRole("button", { name: "Предложи още една" }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
