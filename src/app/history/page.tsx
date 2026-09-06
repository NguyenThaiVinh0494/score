import React from "react";
import { MatchHistoryView } from "@/components/history/MatchHistoryView";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "Lịch sử trận đấu | ScoreMaster",
  description: "Xem lại toàn bộ lịch sử điểm số và diễn biến các ván đấu trên ScoreMaster.",
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <MatchHistoryView />
      </main>
    </div>
  );
}
