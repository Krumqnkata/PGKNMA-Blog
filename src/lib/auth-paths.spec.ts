import { describe, expect, it } from "vitest";

import { getSafeNextPath, loginPath, registerPath } from "./auth-paths";

describe("getSafeNextPath", () => {
  it("keeps a page on this site with its query and hash", () => {
    expect(getSafeNextPath("/post/5?from=news#comments")).toBe("/post/5?from=news#comments");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "evil.example",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("sends %s home instead of following it", (next) => {
    expect(getSafeNextPath(next)).toBe("/");
  });

  it.each(["/login", "/register", "/login?next=/news", "/register#top"])("does not return to the sign-in pages from %s", (next) => {
    expect(getSafeNextPath(next)).toBe("/");
  });
});

describe("loginPath and registerPath", () => {
  it("carries the return page in the URL", () => {
    expect(loginPath("/post/5?from=news")).toBe("/login?next=%2Fpost%2F5%3Ffrom%3Dnews");
    expect(registerPath("/games/code")).toBe("/register?next=%2Fgames%2Fcode");
  });

  it("stays clean when there is nothing to return to", () => {
    expect(loginPath("/")).toBe("/login");
    expect(loginPath()).toBe("/login");
    expect(registerPath("//evil.example")).toBe("/register");
  });
});
