/**
 * Remembers in this browser that someone just registered, so the home page can greet them once
 * with a few first steps. The API does not say which sign-in is the first, so this is the signal.
 * Storage can be blocked (private mode, site data off); then the welcome simply never shows.
 */
const WELCOME_KEY = "pendingWelcome";

export function markWelcomePending() {
  try {
    window.localStorage.setItem(WELCOME_KEY, "1");
  } catch {
    // Storage is unavailable; the welcome card is optional.
  }
}

export function isWelcomePending() {
  try {
    return window.localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearWelcome() {
  try {
    window.localStorage.removeItem(WELCOME_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
