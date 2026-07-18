"use client";

import Tracker from "@/components/tracker";
import Space from "@/components/space";
import Option from "@/components/option";
import DateStrip from "@/components/datestrip";
import DayLogs from "@/components/daylogs";
import SpendsTotal from "@/components/spends-total";
import { useState } from "react";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useProtectedRoute();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (loading) {
    return null;
  }
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <Space size={16} />
      <Tracker date={selectedDate} />
      <Space size={10} />
      <Option buttons={1} text1="Spends" href1="/spends" icon1={<SpendsTotal />} />

      <Space size={24} />
    </div>
  );
}
