"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatchConfig } from "@/types/game";
import { Users, Target, Plus, Trash2, Play, Sparkles } from "lucide-react";

interface MatchSetupProps {
  onStartMatch: (config: MatchConfig) => void;
}

const PRESET_SCORES = [3, 5, 7, 10, 21];

const DEFAULT_NAMES = ["Người chơi 1", "Người chơi 2", "Người chơi 3", "Người chơi 4"];

export function MatchSetup({ onStartMatch }: MatchSetupProps) {
  const [title, setTitle] = useState("Trận đấu mới");
  const [players, setPlayers] = useState<string[]>(["Người chơi 1", "Người chơi 2"]);
  const [targetScore, setTargetScore] = useState<number>(5);
  const [isCustomScore, setIsCustomScore] = useState(false);
  const [customScoreInput, setCustomScoreInput] = useState("5");

  const handleAddPlayer = () => {
    if (players.length >= 8) return;
    const nextIdx = players.length;
    const defaultName = DEFAULT_NAMES[nextIdx] || `Người chơi ${nextIdx + 1}`;
    setPlayers([...players, defaultName]);
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handlePlayerNameChange = (index: number, newName: string) => {
    const updated = [...players];
    updated[index] = newName;
    setPlayers(updated);
  };

  const handleSelectPresetScore = (score: number) => {
    setTargetScore(score);
    setIsCustomScore(false);
  };

  const handleCustomScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomScoreInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setTargetScore(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlayers = players.map((p, i) => (p.trim() ? p.trim() : `Người chơi ${i + 1}`));
    onStartMatch({
      title: title.trim() || "Trận đấu mới",
      targetScore: targetScore > 0 ? targetScore : 5,
      players: cleanPlayers,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-4 sm:px-0 animate-pop">
      <Card className="border-slate-200/90 shadow-lg shadow-slate-200/50">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-indigo-50/50 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Thiết lập trận đấu</h2>
              <p className="text-xs text-slate-500">Tùy chỉnh số người chơi, tên và mốc điểm chiến thắng</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Match Title */}
            <div>
              <Input
                label="Tên trận đấu / Sự kiện"
                placeholder="Ví dụ: Kèo Bi lắc Chủ nhật, Uno gia đình..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Target Score Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  Mốc điểm chiến thắng (Target Score)
                </label>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                  Mục tiêu: {targetScore} điểm
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {PRESET_SCORES.map((score) => {
                  const isActive = !isCustomScore && targetScore === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleSelectPresetScore(score)}
                      className={`h-11 rounded-xl font-bold text-sm transition-all border ${
                        isActive
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/30 scale-[1.02]"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                      }`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomScore(true);
                    setCustomScoreInput(targetScore.toString());
                  }}
                  className={`text-xs font-medium hover:underline ${
                    isCustomScore ? "text-sky-700 font-bold" : "text-slate-500"
                  }`}
                >
                  + Tùy chỉnh mốc điểm khác
                </button>
                {isCustomScore && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      placeholder="Nhập số điểm cần đạt (ví dụ: 15)"
                      value={customScoreInput}
                      onChange={handleCustomScoreChange}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Players Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  Danh sách người chơi ({players.length})
                </label>
                {players.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPlayer}
                    className="text-xs h-7 px-2.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm người</span>
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {players.map((playerName, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={playerName}
                      placeholder={`Người chơi ${index + 1}`}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="flex-1 h-10 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    {players.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Xóa người chơi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              type="submit"
              size="xl"
              className="w-full shadow-md shadow-sky-600/20 hover:shadow-lg text-base font-bold"
            >
              <Play className="w-5 h-5 fill-current" />
              Bắt đầu tính điểm ngay
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
