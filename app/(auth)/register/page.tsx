'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/lib/ensureProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const trimmedEmail = email.trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            role,
            full_name: displayName.trim() || undefined,
          },
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // 이메일 확인이 꺼져 있으면 바로 세션이 오는 경우가 많음
      if (!data.session) {
        setInfo(
          '가입 메일을 보냈습니다. 메일의 링크를 눌러 인증한 뒤 로그인해 주세요. (개발 중에는 Supabase 대시보드에서 이메일 확인을 끌 수 있습니다.)'
        );
        return;
      }

      if (!data.user) {
        setError('사용자 정보를 가져오지 못했습니다. 다시 시도해 주세요.');
        return;
      }

      const ensured = await ensureUserProfile(data.user, trimmedEmail, role);
      if (!ensured.ok) {
        console.error('ensureUserProfile:', ensured.message);
        setError(
          `계정은 만들어졌지만 프로필 저장에 실패했습니다: ${ensured.message}. Supabase의 profiles 테이블·RLS 정책을 확인해 주세요.`
        );
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-2">회원가입</h1>
      <p className="text-muted-foreground mb-8">HABIX 계정을 만듭니다</p>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
            {info}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">역할</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={loading}
          >
            <option value="member">회원</option>
            <option value="trainer">트레이너</option>
          </select>
        </div>

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
          <label className="block text-sm font-medium mb-1">
            이름 (선택)
          </label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시 이름"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            disabled={loading}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 다시 입력"
            disabled={loading}
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <p className="text-center text-sm mt-6">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
