'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  GraduationCap, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/students', label: '학생 관리', icon: Users },
  { href: '/tests', label: '시험지 관리', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white text-notion-ink md:hidden border-b border-notion-hairline">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-white border border-notion-hairline">
            <Image src="/sisun.png" alt="시선 로고" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-semibold text-sm tracking-tight">시선</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-notion-ink-muted hover:text-notion-ink focus:outline-none p-1.5 hover:bg-notion-canvas-soft rounded-md"
          aria-label="메뉴 열기/닫기"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-notion-canvas-soft text-notion-ink flex flex-col border-r border-notion-hairline transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen`}
      >
        {/* Header/Logo */}
        <div className="h-12 flex items-center px-4 space-x-2 shrink-0">
          <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-white border border-notion-hairline">
            <Image src="/sisun.png" alt="시선 로고" width={24} height={24} className="object-contain" />
          </div>
          <h1 className="font-semibold text-sm tracking-tight text-notion-ink">시선 성적관리</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold text-notion-ink-muted uppercase tracking-wider">
            학습 관리
          </div>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname === item.href || pathname.startsWith(item.href + '/');
              
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-colors duration-100 group ${
                  isActive
                    ? 'bg-white text-notion-ink shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-notion-hairline'
                    : 'text-notion-ink-secondary hover:bg-[#efefee]'
                }`}
              >
                <Icon className={`mr-2.5 h-4 w-4 shrink-0 ${
                  isActive ? 'text-notion-blue' : 'text-notion-ink-muted group-hover:text-notion-ink'
                }`} />
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info / Footer Section */}
        <div className="p-3 border-t border-notion-hairline shrink-0">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#efefee] transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded bg-notion-ink-muted flex items-center justify-center text-white font-medium text-xs">
              교
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-notion-ink truncate">홍길동 선생님</p>
              <p className="text-[11px] text-notion-ink-muted truncate">teacher@sisun.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-40 bg-black/5 md:hidden"
        />
      )}
    </>
  );
}
