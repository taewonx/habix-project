'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function MemberLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const nav = useMemo(
    () => [
      { href: '/member/dashboard', label: '대시보드' },
      { href: '/member/routines', label: '운동' },
      { href: '/member/diet', label: '식단' },
      { href: '/member/settings', label: '설정' },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role !== 'member') {
        router.replace('/dashboard');
        return;
      }

      if (!mounted) return;
      setUserEmail(profile.email ?? session.user.email ?? null);
      setReady(true);
    };

    boot();
    const { data: sub } = supabase.auth.onAuthStateChange(() => boot());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/member/dashboard" className="font-bold">
              HABIX Member
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'px-3 py-2 rounded-md text-sm',
                      active ? 'bg-muted font-semibold' : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {userEmail && <span className="hidden sm:inline text-xs text-muted-foreground">{userEmail}</span>}
            <Button variant="outline" size="sm" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

