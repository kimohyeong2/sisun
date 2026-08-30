'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  // 사용 중인 상태: error, pending (ActionState)
  const [state, action, pending] = useActionState(login, { error: '' });

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full bg-[#f6f5f4] p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-[26px] font-bold text-black mb-8 text-center tracking-[-0.625px]">로그인</h1>
        
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">아이디</label>
            <Input 
              name="id" 
              placeholder="아이디를 입력하세요" 
              required 
              className="rounded-[4px] p-[6px] w-full" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">비밀번호</label>
            <Input 
              name="pw" 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              required 
              className="rounded-[4px] p-[6px] w-full" 
            />
          </div>
          
          {state?.error && (
            <p className="text-sm text-red-600 font-medium">
              {state.error}
            </p>
          )}
          
          <Button 
            type="submit" 
            disabled={pending} 
            className="w-full rounded-full bg-[#0075de] hover:bg-[#005bab] text-white py-2 font-medium transition-colors mt-4"
          >
            {pending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
