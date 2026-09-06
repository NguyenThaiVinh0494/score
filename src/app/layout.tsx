import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import "./globals.css";
import { ClientOnly } from "@/components/common/ClientOnly";

export const metadata: Metadata = {
  title: "ScoreMaster — Web Tính Điểm Đa Nền Tảng",
  description: "Ứng dụng web tính điểm gọn nhẹ, trực quan, hỗ trợ thiết bị di động và máy tính với cơ chế Thắng +1, Thua +0, Undo và lưu lịch sử ván đấu.",
  keywords: ["tính điểm", "scoreboard", "scoremaster", "board game", "đếm điểm", "trận đấu"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  }).observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClientOnly>
            {children}
          </ClientOnly>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
