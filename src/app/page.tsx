"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MatchSetup } from "@/components/game/MatchSetup";
import { LiveScoreboard } from "@/components/game/LiveScoreboard";
import { VictoryModal } from "@/components/game/VictoryModal";
import { useAuth } from "@/context/AuthContext";
import { Player, RoundLog, MatchConfig, MatchRecord } from "@/types/game";
import { saveMatchToSupabase, saveMatchToLocal } from "@/lib/matchService";
import { Sparkles, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ACTIVE_MATCH_STORAGE_KEY = "scoremaster_active_match_state";

export default function HomePage() {
  const { user } = useAuth();

  // Match State
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("Trận đấu mới");
  const [targetScore, setTargetScore] = useState(5);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<RoundLog[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Restore active match on refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_MATCH_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.isPlaying && state.players?.length > 0) {
          // Wrap in queueMicrotask to avoid synchronous cascading renders
          queueMicrotask(() => {
            setIsPlaying(true);
            setTitle(state.title || "Trận đấu mới");
            setTargetScore(state.targetScore || 5);
            setPlayers(state.players);
            setRounds(state.rounds || []);
            if (state.winner) {
              setWinner(state.winner);
              setShowVictoryModal(true);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error restoring active match:", e);
    }
  }, []);

  // Save active state to localStorage whenever changed
  useEffect(() => {
    if (isPlaying) {
      const state = {
        isPlaying,
        title,
        targetScore,
        players,
        rounds,
        winner,
      };
      localStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
    }
  }, [isPlaying, title, targetScore, players, rounds, winner]);

  // 1. Start Match
  const handleStartMatch = (config: MatchConfig) => {
    const initializedPlayers: Player[] = config.players.map((name, index) => ({
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p_${index + 1}`,
      name,
      score: 0,
      order: index + 1,
    }));

    setTitle(config.title);
    setTargetScore(config.targetScore);
    setPlayers(initializedPlayers);
    setRounds([]);
    setWinner(null);
    setShowVictoryModal(false);
    setIsSaved(false);
    setIsPlaying(true);
  };

  // 2. Score +1 for Player
  const handleScore = (playerId: string) => {
    if (winner) return; // Game already concluded

    const scoringPlayer = players.find((p) => p.id === playerId);
    if (!scoringPlayer) return;

    const newScore = scoringPlayer.score + 1;
    const updatedPlayers = players.map((p) =>
      p.id === playerId ? { ...p, score: newScore } : p
    );

    const newRoundLog: RoundLog = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r_${rounds.length + 1}_${playerId}`,
      roundNumber: rounds.length + 1,
      winnerPlayerId: playerId,
      winnerPlayerName: scoringPlayer.name,
      timestamp: new Date().toISOString(),
    };

    const updatedRounds = [...rounds, newRoundLog];

    setPlayers(updatedPlayers);
    setRounds(updatedRounds);

    // Check Win Condition
    if (newScore >= targetScore) {
      const winningPlayer = { ...scoringPlayer, score: newScore };
      setWinner(winningPlayer);
      setShowVictoryModal(true);
      autoSaveMatch(updatedPlayers, updatedRounds, winningPlayer);
    }
  };

  // 3. Undo Last Round
  const handleUndo = () => {
    if (rounds.length === 0) return;

    const lastRound = rounds[rounds.length - 1];
    const updatedRounds = rounds.slice(0, -1);

    const updatedPlayers = players.map((p) => {
      if (p.id === lastRound.winnerPlayerId) {
        return { ...p, score: Math.max(0, p.score - 1) };
      }
      return p;
    });

    setRounds(updatedRounds);
    setPlayers(updatedPlayers);

    // If game was won and we undo, revoke win
    if (winner) {
      setWinner(null);
      setShowVictoryModal(false);
    }
  };

  // 4. Reset Match Scores
  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại điểm số của tất cả người chơi về 0?")) {
      const resetPlayers = players.map((p) => ({ ...p, score: 0 }));
      setPlayers(resetPlayers);
      setRounds([]);
      setWinner(null);
      setShowVictoryModal(false);
      setIsSaved(false);
    }
  };

  // 5. Play Again (Keep players and rules, reset scores)
  const handlePlayAgain = () => {
    const resetPlayers = players.map((p) => ({ ...p, score: 0 }));
    setPlayers(resetPlayers);
    setRounds([]);
    setWinner(null);
    setShowVictoryModal(false);
    setIsSaved(false);
  };

  // 6. New Match Setup
  const handleNewMatch = () => {
    if (
      isPlaying &&
      !winner &&
      rounds.length > 0 &&
      !window.confirm("Ván đấu đang diễn ra, bạn có muốn tạo trận mới?")
    ) {
      return;
    }
    setIsPlaying(false);
    setWinner(null);
    setShowVictoryModal(false);
    setPlayers([]);
    setRounds([]);
    localStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
  };

  // Auto save to local / Supabase
  const autoSaveMatch = async (
    currentPlayers: Player[],
    currentRounds: RoundLog[],
    winnerPlayer: Player
  ) => {
    const matchRecord: MatchRecord = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `match_${rounds.length}`,
      title,
      targetScore,
      status: "completed",
      winnerName: winnerPlayer.name,
      totalRounds: currentRounds.length,
      players: currentPlayers.map((p) => ({
        name: p.name,
        score: p.score,
        order: p.order,
      })),
      rounds: currentRounds.map((r) => ({
        roundNumber: r.roundNumber,
        winnerPlayerName: r.winnerPlayerName,
        createdAt: r.timestamp,
      })),
      createdAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      userId: user?.id,
    };

    // Save locally first
    saveMatchToLocal(matchRecord);

    // If logged in to Supabase, save to cloud
    if (user) {
      setSaving(true);
      const res = await saveMatchToSupabase(matchRecord, user.id);
      setSaving(false);
      if (res.success) {
        setIsSaved(true);
      }
    }
  };

  // Manual save trigger from Victory Modal
  const handleManualSaveToCloud = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu trận đấu lên đám mây.");
      return;
    }
    if (!winner) return;

    setSaving(true);
    const matchRecord: Omit<MatchRecord, "id"> = {
      title,
      targetScore,
      status: "completed",
      winnerName: winner.name,
      totalRounds: rounds.length,
      players: players.map((p) => ({
        name: p.name,
        score: p.score,
        order: p.order,
      })),
      rounds: rounds.map((r) => ({
        roundNumber: r.roundNumber,
        winnerPlayerName: r.winnerPlayerName,
        createdAt: r.timestamp,
      })),
      createdAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    };

    const res = await saveMatchToSupabase(matchRecord, user.id);
    setSaving(false);
    if (res.success) {
      setIsSaved(true);
    } else {
      alert("Lỗi khi lưu: " + res.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onNewGame={handleNewMatch} isGameActive={isPlaying} />

      <main className="flex-1 flex flex-col justify-center py-6 sm:py-10">
        {!isPlaying ? (
          <div className="space-y-6">
            {/* Hero Banner Header */}
            <div className="text-center px-4 max-w-lg mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100/70 border border-sky-200/80 rounded-full text-sky-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                ScoreMaster v1.0
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Bộ đếm điểm ván đấu tức thì
              </h1>
              <p className="text-sm text-slate-500">
                Thao tác 1 chạm siêu nhanh • Hỗ trợ hoàn tác Undo • Lưu trữ lịch sử ván đấu
              </p>
            </div>

            {/* Match Setup Component */}
            <MatchSetup onStartMatch={handleStartMatch} />

            {/* Quick Links */}
            <div className="text-center pt-2">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                  <History className="w-3.5 h-3.5" />
                  Xem lại lịch sử các ván đấu trước
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <LiveScoreboard
            title={title}
            targetScore={targetScore}
            players={players}
            rounds={rounds}
            onScore={handleScore}
            onUndo={handleUndo}
            onReset={handleReset}
            onEndMatch={() => {
              if (window.confirm("Bạn có muốn kết thúc ván đấu ngay bây giờ?")) {
                const maxScorePlayer = [...players].sort((a, b) => b.score - a.score)[0];
                setWinner(maxScorePlayer || players[0]);
                setShowVictoryModal(true);
              }
            }}
          />
        )}

        {/* Victory Modal */}
        <VictoryModal
          isOpen={showVictoryModal}
          winner={winner}
          players={players}
          targetScore={targetScore}
          totalRounds={rounds.length}
          isSaved={isSaved}
          saving={saving}
          onSaveToCloud={user ? handleManualSaveToCloud : undefined}
          onPlayAgain={handlePlayAgain}
          onNewMatch={handleNewMatch}
        />
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60">
        ScoreMaster • Ứng dụng tính điểm tinh gọn & thông minh
      </footer>
    </div>
  );
}
