"use client";

import React, { useState, useEffect } from "react";
import { MatchRecord } from "@/types/game";
import { useAuth } from "@/context/AuthContext";
import { fetchUserMatches } from "@/lib/matchService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  Search,
  Cloud,
  Eye,
  ArrowLeft,
  Lock,
  LogIn
} from "lucide-react";
import Link from "next/link";

export function MatchHistoryView() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    async function loadMatches() {
      if (!user) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const cloudMatches = await fetchUserMatches(user.id);
      setMatches(cloudMatches);
      setLoading(false);
    }

    if (!authLoading) {
      loadMatches();
    }
  }, [user, authLoading]);

  // If Auth state is still loading
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Đang kiểm tra trạng thái tài khoản...</p>
      </div>
    );
  }

  // If NOT logged in: require login screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-pop">
        <Card className="p-8 text-center space-y-5 border-slate-200/90 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tính năng xem và quản lý lịch sử ván đấu yêu cầu tài khoản để đồng bộ dữ liệu đám mây (Supabase).
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-sky-600/20"
              onClick={openAuthModal}
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập / Đăng ký ngay
            </Button>

            <Link href="/" className="block">
              <Button variant="ghost" size="md" className="w-full text-xs text-slate-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const filteredMatches = matches.filter((m) => {
    const matchTitle = m.title.toLowerCase();
    const playerNames = m.players.map((p) => p.name.toLowerCase()).join(" ");
    const winnerName = (m.winnerName || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      matchTitle.includes(query) ||
      playerNames.includes(query) ||
      winnerName.includes(query)
    );
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-pop">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Lịch sử các ván đấu
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            Dữ liệu được lưu trữ và đồng bộ an toàn trên tài khoản của bạn ({user.email})
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên trận đấu hoặc người chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải lịch sử ván đấu từ Supabase...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            {searchQuery ? "Không tìm thấy trận đấu phù hợp" : "Chưa có lịch sử ván đấu nào"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "Hãy thử tìm với từ khóa khác như tên người chơi hoặc tên ván đấu."
              : "Hãy bắt đầu một ván đấu mới để lưu lại kết quả vào tài khoản của bạn nhé!"}
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary" size="md">
                Tạo ván đấu mới
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredMatches.map((match) => (
            <Card
              key={match.id}
              className="hover:shadow-md transition-shadow border-slate-200/90 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate" title={match.title}>
                      {match.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(match.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span title="Đã lưu Cloud">
                      <Cloud className="w-4 h-4 text-sky-500" />
                    </span>
                    <Badge variant={match.status === "completed" ? "success" : "default"}>
                      {match.status === "completed" ? "Hoàn thành" : "Đang chơi"}
                    </Badge>
                  </div>
                </div>

                {/* Winner Banner */}
                {match.winnerName && (
                  <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs text-amber-900">
                        Thắng: <b>{match.winnerName}</b>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800">
                      {match.totalRounds} hiệp
                    </span>
                  </div>
                )}

                {/* Player Scores Summary */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Điểm số ({match.players.length} người chơi)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {match.players.map((p, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex items-center justify-between"
                      >
                        <span className="truncate text-slate-700 font-medium">{p.name}</span>
                        <span className="font-black text-slate-900 ml-1">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Mục tiêu: {match.targetScore} điểm</span>
                <button
                  type="button"
                  onClick={() => setSelectedMatch(match)}
                  className="text-sky-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi tiết
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title={selectedMatch.title}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(selectedMatch.createdAt)}
              </span>
              <span>Mốc điểm thắng: <b>{selectedMatch.targetScore}</b></span>
            </div>

            {selectedMatch.winnerName && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1">
                <Trophy className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedMatch.winnerName}
                </h4>
                <p className="text-xs text-amber-800">
                  Giành chiến thắng sau tổng cộng {selectedMatch.totalRounds} hiệp đấu
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 uppercase">
                Bảng điểm tổng kết
              </div>
              <div className="space-y-1.5">
                {[...selectedMatch.players]
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{p.score} điểm</span>
                    </div>
                  ))}
              </div>
            </div>

            {selectedMatch.rounds && selectedMatch.rounds.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  Diễn biến từng hiệp
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {selectedMatch.rounds.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60 text-xs"
                    >
                      <span className="font-bold text-slate-500">Hiệp {r.roundNumber}</span>
                      <span className="text-slate-700">
                        <b>{r.winnerPlayerName}</b> ghi điểm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setSelectedMatch(null)}
            >
              Đóng
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
