"use client";

import React, { useEffect, useState } from "react";
import { Player, RoundLog } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Undo2,
  RotateCcw,
  Target,
  Trophy,
  History,
  ChevronDown,
  ChevronUp,
  Flame,
  Plus
} from "lucide-react";

interface LiveScoreboardProps {
  title: string;
  targetScore: number;
  players: Player[];
  rounds: RoundLog[];
  onScore: (playerId: string) => void;
  onUndo: () => void;
  onReset: () => void;
  onEndMatch: () => void;
}

const PLAYER_THEME_COLORS = [
  { border: "border-sky-500", bg: "bg-sky-50", badge: "bg-sky-500 text-white", ring: "ring-sky-400" },
  { border: "border-emerald-500", bg: "bg-emerald-50", badge: "bg-emerald-500 text-white", ring: "ring-emerald-400" },
  { border: "border-amber-500", bg: "bg-amber-50", badge: "bg-amber-500 text-white", ring: "ring-amber-400" },
  { border: "border-rose-500", bg: "bg-rose-50", badge: "bg-rose-500 text-white", ring: "ring-rose-400" },
  { border: "border-indigo-500", bg: "bg-indigo-50", badge: "bg-indigo-500 text-white", ring: "ring-indigo-400" },
  { border: "border-teal-500", bg: "bg-teal-50", badge: "bg-teal-500 text-white", ring: "ring-teal-400" },
  { border: "border-violet-500", bg: "bg-violet-50", badge: "bg-violet-500 text-white", ring: "ring-violet-400" },
  { border: "border-pink-500", bg: "bg-pink-50", badge: "bg-pink-500 text-white", ring: "ring-pink-400" },
];

export function LiveScoreboard({
  title,
  targetScore,
  players,
  rounds,
  onScore,
  onUndo,
  onReset,
  onEndMatch,
}: LiveScoreboardProps) {
  const [showHistoryLogs, setShowHistoryLogs] = useState(false);
  const [lastScoredId, setLastScoredId] = useState<string | null>(null);

  // Highest current score
  const maxScore = Math.max(...players.map((p) => p.score));

  const handlePlayerScore = React.useCallback((playerId: string) => {
    setLastScoredId(playerId);
    onScore(playerId);
    setTimeout(() => {
      setLastScoredId(null);
    }, 400);
  }, [onScore]);

  // Desktop keyboard shortcuts (1, 2, 3...)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= players.length) {
        const targetPlayer = players[num - 1];
        if (targetPlayer) {
          handlePlayerScore(targetPlayer.id);
        }
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        // Ctrl+Z for Undo
        e.preventDefault();
        if (rounds.length > 0) {
          onUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [players, rounds, onUndo, handlePlayerScore]);

  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  return (
    <div className="w-full max-w-2xl mx-auto py-3 px-3 sm:px-0 space-y-4 animate-pop select-none">
      {/* Top Match Info Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {title}
            </h1>
            <Badge variant="purple" className="shrink-0 text-[11px]">
              Hiệp {rounds.length + 1}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Target className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Mục tiêu thắng: <b>{targetScore}</b> điểm (+1 / round)</span>
          </p>
        </div>

        {/* Global Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={rounds.length === 0}
            className="h-9 px-2.5 text-xs text-slate-700 disabled:opacity-30"
            title="Hoàn tác điểm số vừa ghi (Ctrl + Z)"
          >
            <Undo2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2 text-xs text-slate-500 hover:text-rose-600"
            title="Đặt lại điểm số"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Players Live Cards Grid */}
      <div
        className={`grid gap-3 ${
          players.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : players.length <= 4
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {players.map((player, index) => {
          const color = PLAYER_THEME_COLORS[index % PLAYER_THEME_COLORS.length];
          const isLeader = maxScore > 0 && player.score === maxScore;
          const isJustScored = lastScoredId === player.id;
          const remainingToWin = targetScore - player.score;

          return (
            <Card
              key={player.id}
              className={`relative overflow-hidden transition-all duration-200 border-2 ${
                isLeader
                  ? "border-amber-400/90 shadow-md shadow-amber-100 ring-2 ring-amber-300/40"
                  : "border-slate-200/90 hover:border-slate-300"
              }`}
            >
              {/* Leader Ribbon */}
              {isLeader && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  <Flame className="w-3 h-3 fill-current text-amber-900" />
                  <span>Dẫn đầu</span>
                </div>
              )}

              <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
                {/* Player Name and Avatar Key */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${color.badge}`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800 truncate" title={player.name}>
                      {player.name}
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
                    [Phím {index + 1}]
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="py-1">
                  <div
                    className={`text-5xl sm:text-6xl font-black text-slate-900 tracking-tight transition-transform ${
                      isJustScored ? "animate-score-bounce text-sky-600 scale-125" : ""
                    }`}
                  >
                    {player.score}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 mt-1">
                    {remainingToWin <= 0 ? (
                      <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> Đã chiến thắng!
                      </span>
                    ) : (
                      `Còn ${remainingToWin} điểm để thắng`
                    )}
                  </div>
                </div>

                {/* 1-Touch Score Button */}
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => handlePlayerScore(player.id)}
                  className={`w-full h-14 sm:h-16 text-lg font-bold rounded-2xl shadow-md transition-all active:scale-95 ${
                    index === 0
                      ? "bg-sky-600 hover:bg-sky-700"
                      : index === 1
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>+1 Điểm</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mini Round History Accordion */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowHistoryLogs(!showHistoryLogs)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <span>Diễn biến từng hiệp ({rounds.length} hiệp)</span>
            {lastRound && !showHistoryLogs && (
              <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                • Gần nhất: <b>{lastRound.winnerPlayerName}</b> (+1)
              </span>
            )}
          </div>
          {showHistoryLogs ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showHistoryLogs && (
          <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50 max-h-56 overflow-y-auto space-y-1.5">
            {rounds.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-3">
                Chưa có hiệp nào được ghi nhận. Bấm &quot;+1 Điểm&quot; cho người thắng hiệp đầu tiên!
              </div>
            ) : (
              [...rounds].reverse().map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Hiệp #{round.roundNumber}</span>
                    <span className="text-slate-800">
                      <b>{round.winnerPlayerName}</b> giành điểm
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(round.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* End Match Early button */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onEndMatch}
          className="text-xs text-slate-400 hover:text-slate-600 hover:underline transition"
        >
          Kết thúc ván đấu sớm
        </button>
      </div>
    </div>
  );
}
