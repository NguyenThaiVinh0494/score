"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/game";
import { Trophy, RotateCcw, Plus, Save, CheckCircle2 } from "lucide-react";

interface VictoryModalProps {
  isOpen: boolean;
  winner: Player | null;
  players: Player[];
  targetScore: number;
  totalRounds: number;
  isSaved?: boolean;
  saving?: boolean;
  onSaveToCloud?: () => void;
  onPlayAgain: () => void;
  onNewMatch: () => void;
}

export function VictoryModal({
  isOpen,
  winner,
  players,
  targetScore,
  totalRounds,
  isSaved,
  saving,
  onSaveToCloud,
  onPlayAgain,
  onNewMatch,
}: VictoryModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger burst confetti
      const end = Date.now() + 2.5 * 1000;
      const colors = ["#0284c7", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  // Sort players by score desc
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} maxWidth="md">
      <div className="text-center space-y-6">
        {/* Trophy icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-400/30 mx-auto animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="space-y-1">
          <Badge variant="success" className="px-3 py-1 text-xs">
            Chiến thắng chung cuộc
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {winner.name} 🎉
          </h2>
          <p className="text-sm text-slate-500">
            Đã hoàn thành mốc {targetScore} điểm sau {totalRounds} hiệp đấu kịch tính!
          </p>
        </div>

        {/* Score Summary Table */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            Bảng tổng kết điểm số
          </div>
          <div className="space-y-1.5">
            {sortedPlayers.map((player, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                    isFirst ? "bg-amber-100/70 border border-amber-300/80 font-bold" : "bg-white border border-slate-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm text-slate-800">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {player.score}
                    </span>
                    <span className="text-xs text-slate-500">điểm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {onSaveToCloud && (
            <Button
              variant={isSaved ? "secondary" : "success"}
              className="w-full"
              size="lg"
              disabled={isSaved || saving}
              onClick={onSaveToCloud}
            >
              {saving ? (
                "Đang lưu..."
              ) : isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã lưu vào Lịch sử tài khoản
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu kết quả lên Đám mây (Supabase)
                </>
              )}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onPlayAgain}
              className="w-full text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onNewMatch}
              className="w-full text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Tạo trận mới
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
