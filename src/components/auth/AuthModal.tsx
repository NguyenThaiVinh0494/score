"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { LogIn, UserPlus, AlertCircle, CheckCircle, Mail } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setNeedsEmailConfirm(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        closeAuthModal();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || splitEmail(email),
            },
          },
        });
        if (error) throw error;

        if (data?.session) {
          // Tự động đăng nhập thành công (khi đã tắt xác thực email)
          setMessage("Đăng ký và đăng nhập thành công!");
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        } else if (data?.user) {
          // Supabase yêu cầu xác thực email
          setNeedsEmailConfirm(true);
          setMessage("Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.");
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Đã xảy ra lỗi khi xác thực.");
    } finally {
      setLoading(false);
    }
  };

  const splitEmail = (str: string) => str.split("@")[0] || "User";

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isLogin ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {isLogin
            ? "Đăng nhập để tự động đồng bộ và lưu lịch sử các ván đấu của bạn lên đám mây."
            : "Đăng ký nhanh để lưu lại ván đấu vào tài khoản của bạn."}
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            {needsEmailConfirm && (
              <p className="text-slate-600 pl-6 text-[11px] leading-relaxed">
                Hệ thống đã gửi email xác nhận đến <b>{email}</b>. Bạn chỉ cần nhấn vào liên kết trong email để hoàn tất.
              </p>
            )}
          </div>
        )}

        {needsEmailConfirm ? (
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsLogin(true);
                setNeedsEmailConfirm(false);
                setMessage(null);
              }}
            >
              Chuyển sang màn hình Đăng nhập
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3.5">
            {!isLogin && (
              <Input
                label="Họ và tên hoặc Biệt danh"
                placeholder="Ví dụ: vinh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Đang xử lý..."
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Đăng ký
                </>
              )}
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          {isLogin ? (
            <span>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setMessage(null);
                }}
                className="text-sky-600 font-semibold hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setMessage(null);
                }}
                className="text-sky-600 font-semibold hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
