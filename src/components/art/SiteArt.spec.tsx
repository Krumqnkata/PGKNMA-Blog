import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteArt } from "./SiteArt";

describe("SiteArt", () => {
  it("is decorative, so screen readers skip it", () => {
    const { container } = render(<SiteArt name="newspaper" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("passes on its size classes", () => {
    const { container } = render(<SiteArt name="trophy" className="h-14 w-14" />);
    expect(container.querySelector("svg")).toHaveClass("h-14", "w-14", "shrink-0");
  });
});
