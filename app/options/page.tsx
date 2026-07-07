"use client";

import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import Option2 from "@/components/option2";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function OptionsPage() {
  useProtectedRoute();

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="More" />
      <Space size={10} />

      <Option2 text="Friends" href="/friends" />
      <Option2 text="Saved recipes" href="/saves" />
      <Option2 text="My QR code" href="/qr" />
      <Option2 text="Settings" href="/settings" />
    </>
  );
}
