'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';

const MENU_ITEMS = [
  { href: '/students', label: '학생 관리' },
  { href: '/tests', label: '시험지 관리' },
];

interface TopNavigationProps {
  userId: string | null;
}

export default function TopNavigation({ userId }: TopNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="h-14 border-b border-[#e6e6e6] bg-white flex items-center justify-between px-6 shrink-0 z-50 no-print">
      <div className="flex items-center">
        <div className="flex items-center space-x-2 mr-8">
            <span className="font-semibold text-sm tracking-tight text-black">시선입시학원</span>
        </div>
        
        <div className="flex space-x-1">
            {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
                
            return (
                <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors duration-100 ${
                    isActive
                    ? 'bg-[#f6f5f4] text-black font-medium'
                    : 'text-[#615d59] hover:bg-[#f6f5f4] hover:text-black'
                }`}
                >
                {item.label}
                </Link>
            );
            })}
        </div>
      </div>

      {userId && (
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-black">
            {userId}
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-[#615d59] hover:text-black font-medium">
              로그아웃
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
