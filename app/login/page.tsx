'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: '' });

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/sisun.png"
            alt="시선 로고"
            width={48}
            height={48}
            className="rounded-notion-lg object-contain ring-1 ring-notion-hairline shadow-[var(--shadow-notion-soft)] mb-4"
            unoptimized
          />
          <h1 className="text-[26px] font-bold text-notion-ink tracking-[-0.625px]">시선입시학원</h1>
          <p className="text-sm text-notion-ink-muted mt-1">학생 성적 관리 시스템</p>
        </div>

        <div className="bg-notion-canvas rounded-notion-xl border border-notion-hairline shadow-[var(--shadow-notion-elevated)] p-8">
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-notion-ink">아이디</label>
              <Input name="id" placeholder="아이디를 입력하세요" required autoFocus />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-notion-ink">비밀번호</label>
              <Input name="pw" type="password" placeholder="비밀번호를 입력하세요" required />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-notion-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {state.error}
              </div>
            )}

            <Button type="submit" disabled={pending} className="w-full mt-2">
              {pending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
