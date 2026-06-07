"use client";

import { usePathname } from "next/navigation";
import TabBar from "@/components/tabbar";
import HIDE_TABBAR_ON from "@/config/hide-tabbar";

export default function Footer() {
  const pathname = usePathname();
  if (HIDE_TABBAR_ON.includes(pathname)) return null;
  return (
    <footer>
      <TabBar />
    </footer>
  );
}
