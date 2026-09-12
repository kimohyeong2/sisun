'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import { Users, FileText, CalendarRange, LogOut } from 'lucide-react';

const MENU_ITEMS = [
  { href: '/students', label: '학생', icon: Users },
  { href: '/tests', label: '시험지', icon: FileText },
  { href: '/curriculum', label: '커리큘럼', icon: CalendarRange },
];

interface TopNavigationProps {
  userId: string | null;
}

export default function TopNavigation({ userId }: TopNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="h-16 border-b border-notion-hairline bg-white/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 md:px-10 shrink-0 sticky top-0 z-50 no-print">
      <div className="flex items-center">
        <Link href="/students" className="flex items-center gap-2.5 mr-4 sm:mr-10 shrink-0">
          <Image
            src="/sisun.png"
            alt="시선 로고"
            width={30}
            height={30}
            className="rounded-notion-md object-contain ring-1 ring-notion-hairline"
            priority
            unoptimized
          />
          <span className="font-bold text-[15px] tracking-tight text-notion-ink whitespace-nowrap">시선입시학원</span>
        </Link>

        <div className="flex items-center gap-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-notion-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-notion-ink bg-notion-canvas-soft'
                    : 'text-notion-ink-muted hover:text-notion-ink hover:bg-notion-canvas-soft'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-notion-blue' : 'text-notion-ink-faint'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {userId && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-notion-hairline">
            <div className="h-7 w-7 rounded-full bg-notion-blue/10 text-notion-blue flex items-center justify-center text-xs font-semibold">
              {userId.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-notion-ink">{userId}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-notion-ink-muted hover:text-notion-ink font-medium px-2 py-1.5 rounded-notion-md hover:bg-notion-canvas-soft transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
