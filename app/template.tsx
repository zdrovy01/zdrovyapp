"use client";

import { usePathname } from "next/navigation";
import { getTransition } from "@/config/transitions";

// Next.js re-mounts this template on every navigation, so the CSS animation
// replays each time. Animations end at `transform: none`, so they don't break
// position:fixed descendants once finished.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const kind = getTransition(pathname);
  const className = kind === "none" ? undefined : `page-anim-${kind}`;

  return <div className={className}>{children}</div>;
}
