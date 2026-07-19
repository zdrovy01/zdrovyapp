//   "slide" — iOS-style push (slides in from the side)
//   "fade"  — gentle opacity fade
//   "scale" — zoom in
//   "none"  — no animation (instant)

export type TransitionKind = "slide" | "fade" | "scale" | "up" | "none";

// Exact-path overrides. Any route not listed uses DEFAULT_TRANSITION ("up").
// The main tab / entry pages keep their own transitions; everything else
// (the ToolbarWin detail/modal pages) rises from the bottom.
export const TRANSITIONS: Record<string, TransitionKind> = {
  "/": "fade",
  "/recipe": "slide",
  "/myprofile": "slide",
  "/auth": "fade",
  "/search": "fade",
};

// Prefix overrides (checked if no exact match). First match wins.
export const TRANSITION_PREFIXES: [string, TransitionKind][] = [];

export const DEFAULT_TRANSITION: TransitionKind = "up";

// Animation duration in seconds.
export const TRANSITION_DURATION = 0.22;

export function getTransition(pathname: string): TransitionKind {
  if (pathname in TRANSITIONS) return TRANSITIONS[pathname];
  for (const [prefix, kind] of TRANSITION_PREFIXES) {
    if (pathname.startsWith(prefix)) return kind;
  }
  return DEFAULT_TRANSITION;
}
