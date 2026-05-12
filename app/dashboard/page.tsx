'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';

type LoadState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'ready'; role: UserRole; userId: string };

async function getMyRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;
  return (data?.role as UserRole | undefined) ?? null;
}

/** 로그인 이후 진입점: role에 따라 trainer/member 영역으로 라우팅 */
export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const roleHome = useMemo(() => {
    if (state.status !== 'ready') return null;
    return state.role === 'trainer' ? '/trainer/dashboard' : '/member/dashboard';
  }, [state]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        if (mounted) setState({ status: 'unauthenticated' });
        return;
      }

      const role = await getMyRole(session.user.id);
      if (!role) {
        // profiles가 비어있으면 로그인/회원가입 흐름에서 ensureUserProfile이 실패한 케이스
        if (mounted) setState({ status: 'unauthenticated' });
        return;
      }

      if (mounted) setState({ status: 'ready', role, userId: session.user.id });
    };

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      boot();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.status === 'ready') {
      router.replace(state.role === 'trainer' ? '/trainer/dashboard' : '/member/dashboard');
    }
  }, [router, state]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">세션 확인 중...</div>
      </div>
    );
  }

  if (state.status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/40">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">HABIX</h1>
          <p className="text-muted-foreground text-sm">
            로그인이 필요합니다.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">회원가입</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ready 상태면 곧바로 replace 되지만, fallback UI를 둠
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-sm text-muted-foreground">
        이동 중... {roleHome}
      </div>
    </div>
  );
}
