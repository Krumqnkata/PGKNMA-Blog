import { afterEach, describe, expect, it, vi } from "vitest";

import { greetingFor, pickRandom } from "./playful-messages";

describe("greetingFor", () => {
  it.each([
    [4, "Още будуваш", "moon"],
    [5, "Добро утро", "sun"],
    [10, "Добро утро", "sun"],
    [11, "Добър ден", "sun"],
    [17, "Добър ден", "sun"],
    [18, "Добър вечер", "moon"],
    [21, "Добър вечер", "moon"],
    [22, "Още будуваш", "moon"],
    [0, "Още будуваш", "moon"],
  ])("at %i:00 says %s with the %s", (hour, text, art) => {
    expect(greetingFor(hour)).toEqual({ text, art });
  });
});

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
