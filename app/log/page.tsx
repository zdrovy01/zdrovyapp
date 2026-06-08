"use client";

import Space from "@/components/space";
import Option from "@/components/option";
import DayLogs from "@/components/daylogs";
import DateStrip from "@/components/datestrip";
import { useState } from "react";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import ToolbarWin from "@/components/toolbarwin";

export default function LogPage() {
  useProtectedRoute();
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div>
      <Space size={40} />
      <ToolbarWin title="Log History" />
      <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
      <Space size={10} />
      <DayLogs date={selectedDate} />
    </div>
  );
}
