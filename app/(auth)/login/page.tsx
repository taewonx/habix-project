'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/ensureProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        const ensured = await ensureUserProfile(data.user, email.trim());
        if (!ensured.ok) {
          setError(
            `프로필을 준비하지 못했습니다: ${ensured.message}. Supabase RLS·profiles 테이블을 확인해 주세요.`
          );
          return;
        }
      }

      router.push('/dashboard');
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-2">HABIX</h1>
      <p className="text-muted-foreground mb-8">
        피트니스 관리 SaaS에 로그인하세요
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <p className="text-center text-sm mt-6">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
