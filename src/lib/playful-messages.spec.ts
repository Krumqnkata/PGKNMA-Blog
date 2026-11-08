import { afterEach, describe, expect, it, vi } from "vitest";

import { pickRandom } from "./playful-messages";

describe("pickRandom", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("can reach both ends of the list and never runs past it", () => {
    const items = ["а", "б", "в"];
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pickRandom(items)).toBe("а");
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(pickRandom(items)).toBe("в");
  });
});
