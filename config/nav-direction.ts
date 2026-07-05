// Tracks whether the last navigation was a "back" (browser/router.back → popstate)
// vs a "forward" (Link / router.push, which does not fire popstate).

let back = false;
let initialized = false;

export function initNavDirection() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("popstate", () => {
    back = true;
  });
}

/** Returns whether the current navigation was a back-navigation, then resets. */
export function consumeBack(): boolean {
  const wasBack = back;
  back = false;
  return wasBack;
}
