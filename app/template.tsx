"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { getTransition } from "@/config/transitions";
import { initNavDirection, consumeBack } from "@/config/nav-direction";

// Next.js re-mounts this template on every navigation, so the CSS animation
// replays each time. Animations end at `transform: none`, so they don't break
// position:fixed descendants once finished. Back-navigation plays the reverse.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Capture the navigation direction once, when this template mounts.
  const [isBack] = useState(() => {
    initNavDirection();
    return consumeBack();
  });

  const kind = getTransition(pathname);
  const className =
    kind === "none"
      ? undefined
      : `page-anim-${kind}${isBack ? "-back" : ""}`;

  return <div className={className}>{children}</div>;
}
