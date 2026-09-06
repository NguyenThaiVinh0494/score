"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Trophy, History, LogIn, LogOut, User as UserIcon, Plus } from "lucide-react";

interface NavbarProps {
  onNewGame?: () => void;
  isGameActive?: boolean;
}

export function Navbar({ onNewGame, isGameActive }: NavbarProps) {
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-600/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1">
              ScoreMaster
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium leading-none block">
              Bộ tính điểm ván đấu
            </span>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isGameActive && onNewGame && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewGame}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ván mới</span>
            </Button>
          )}

          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-slate-700">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Lịch sử</span>
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-700 max-w-[140px] truncate">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                title="Đăng xuất"
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={openAuthModal}
              className="text-xs font-medium"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
