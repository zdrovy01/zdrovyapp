"use client";

import { usePathname } from "next/navigation";
import TabBar from "@/components/tabbar";

// The tab bar only shows on the three main tab destinations.
// Every other page (windowed pages, profiles like /[username], etc.) hides it.
const TABBAR_ON = ["/", "/recipe", "/myprofile"];

export default function Footer() {
  const pathname = usePathname();
  if (!TABBAR_ON.includes(pathname)) return null;
  return (
    <footer>
      <TabBar />
    </footer>
  );
}
