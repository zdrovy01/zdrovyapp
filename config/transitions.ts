//   "slide" — iOS-style push (slides in from the side)
//   "fade"  — gentle opacity fade
//   "scale" — zoom in
//   "none"  — no animation (instant)

export type TransitionKind = "slide" | "fade" | "scale" | "none";

// Exact-path overrides. Any route not listed uses DEFAULT_TRANSITION.
export const TRANSITIONS: Record<string, TransitionKind> = {
  "/": "fade",
  "/recipe": "slide",
  "/log": "slide",
  "/more": "slide",
  "/settings": "slide",
  "/accountsettings": "slide",
  "/moreoptions": "slide",
  "/qr": "scale",
  "/auth": "fade",
  "/add": "slide",
  "/addmanual": "slide",
  "/createrecipe": "slide",
  "/saves": "slide",
  "/search": "fade",
  "/notifications": "slide",
  "/friends": "slide",
  "/shops": "slide",
};

// Prefix overrides (checked if no exact match). First match wins.
export const TRANSITION_PREFIXES: [string, TransitionKind][] = [
  ["/recipe/", "slide"],
  ["/profile/", "slide"],
  ["/followers/", "slide"],
  ["/following/", "slide"],
];

export const DEFAULT_TRANSITION: TransitionKind = "slide";

// Animation duration in seconds.
export const TRANSITION_DURATION = 0.22;

export function getTransition(pathname: string): TransitionKind {
  if (pathname in TRANSITIONS) return TRANSITIONS[pathname];
  for (const [prefix, kind] of TRANSITION_PREFIXES) {
    if (pathname.startsWith(prefix)) return kind;
  }
  return DEFAULT_TRANSITION;
}
