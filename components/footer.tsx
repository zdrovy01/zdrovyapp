"use client";

import { usePathname } from "next/navigation";
import TabBar from "@/components/tabbar";
import HIDE_TABBAR_ON from "@/config/hide-tabbar";

export default function Footer() {
  const pathname = usePathname();
  // Hide on exact matches and on recipe detail pages (/recipe/<id>)
  if (HIDE_TABBAR_ON.includes(pathname) || /^\/recipe\/.+/.test(pathname))
    return null;
  return (
    <footer>
      <TabBar />
    </footer>
  );
}
