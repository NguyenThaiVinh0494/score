"use client";

import React, { useEffect, useState } from "react";
import { Player, RoundLog } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Undo2,
  RotateCcw,
  Target,
  Trophy,
  History,
  ChevronDown,
  ChevronUp,
  Plus,
  Crown,
  Swords,
  TrendingUp,
  Scale
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

import { getPlayerColor } from "@/lib/colors";

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

  // Highest and Lowest current score
  const scores = players.map((p) => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const leadersCount = players.filter((p) => p.score === maxScore).length;
  const isScoreDiverged = maxScore > minScore;
  const isTwoPlayers = players.length === 2;

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
            className="h-9 px-2.5 text-xs text-slate-700 disabled:opacity-30 cursor-pointer"
            title="Hoàn tác điểm số vừa ghi (Ctrl + Z)"
          >
            <Undo2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2 text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
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
          const color = getPlayerColor(player.colorKey, index);
          const isJustScored = lastScoredId === player.id;
          const remainingToWin = targetScore - player.score;

          // 1. Chỉ 1 người dẫn đầu độc tôn
          const isSoloLeader = maxScore > 0 && player.score === maxScore && leadersCount === 1;

          // 2. Hòa điểm khi chỉ có đúng 2 người chơi
          const isTwoPlayerTie = isTwoPlayers && maxScore > 0 && player.score === maxScore && !isScoreDiverged;

          // 3. Đồng dẫn đầu khi có từ 3 người chơi trở lên
          const isMultiPlayerTie = !isTwoPlayers && maxScore > 0 && player.score === maxScore && leadersCount > 1;

          // 4. Người xếp cuối cùng (khi đã có sự phân hóa điểm)
          const isLastPlace = isScoreDiverged && player.score === minScore;

          return (
            <Card
              key={player.id}
              className={`relative overflow-hidden transition-all duration-200 border-2 ${
                isSoloLeader
                  ? "border-amber-400 shadow-md shadow-amber-100 ring-2 ring-amber-300/50 bg-gradient-to-b from-amber-50/20 to-white"
                  : isTwoPlayerTie
                  ? "border-sky-300 shadow-sm shadow-sky-50 ring-2 ring-sky-200/50 bg-gradient-to-b from-sky-50/15 to-white"
                  : isMultiPlayerTie
                  ? "border-indigo-400 shadow-sm shadow-indigo-100 ring-2 ring-indigo-200/50 bg-gradient-to-b from-indigo-50/20 to-white"
                  : isLastPlace
                  ? "border-slate-200/90 hover:border-slate-300 bg-slate-50/30"
                  : "border-slate-200/90 hover:border-slate-300 bg-white"
              }`}
            >
              {/* Dynamic Status Badges */}
              {isSoloLeader && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>Dẫn đầu</span>
                </div>
              )}

              {isTwoPlayerTie && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Scale className="w-3 h-3 text-sky-600" />
                  <span>Đang hòa ⚖️</span>
                </div>
              )}

              {isMultiPlayerTie && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                  <Swords className="w-3 h-3" />
                  <span>Đồng hạng nhất</span>
                </div>
              )}

              {isLastPlace && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                  <TrendingUp className="w-3 h-3 text-sky-500" />
                  <span>Bám đuổi 💪</span>
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

                {/* 1-Touch Score Button (Color matches Player Number Avatar) */}
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => handlePlayerScore(player.id)}
                  className={cn(
                    "w-full h-14 sm:h-16 text-lg font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-white",
                    color.btn
                  )}
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
          className="text-xs text-slate-400 hover:text-slate-600 hover:underline transition cursor-pointer"
        >
          Kết thúc ván đấu sớm
        </button>
      </div>
    </div>
  );
}
