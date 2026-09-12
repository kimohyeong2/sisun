import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import TopNavigation from "@/components/TopNavigation";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/actions/user";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "시선 (Sisun) - 학생 성적 관리 시스템",
  description: "학원 선생님을 위한 스마트하고 안전한 학생 성적 관리 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUser();

  return (
    <html lang="ko">
      <body
        className={`${noto.variable} font-sans min-h-screen bg-[#f6f5f4] text-black antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <TopNavigation userId={userId} />

          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
