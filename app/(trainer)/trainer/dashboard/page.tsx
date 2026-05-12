'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MemberRow = {
  id: string;
  member_id: string;
  profiles?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null;
};

export default function TrainerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);

  const memberCount = members.length;

  const recentMembers = useMemo(() => members.slice(0, 5), [members]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trainer_member_links')
        .select(
          `
          id,
          member_id,
          profiles:member_id(
            id,
            full_name,
            username,
            email
          )
        `
        )
        .eq('trainer_id', userId)
        .eq('is_active', true)
        .order('joined_date', { ascending: false });

      if (!error && data) setMembers(data as unknown as MemberRow[]);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">트레이너 대시보드</h1>
          <p className="text-sm text-muted-foreground">
            회원 현황과 리포트를 빠르게 확인하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/trainer/members">회원 관리</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/trainer/reports">리포트 보기</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">활성 회원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '—' : memberCount}</div>
            <p className="text-xs text-muted-foreground mt-1">trainer_member_links 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">다음 할 일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">
              - 회원 연결이 안 되어 있으면, 먼저 회원을 연결하세요.
            </div>
            <div className="text-muted-foreground">
              - 연결 후 식단 가이드/운동 프로그램을 작성하면 Member 화면이 채워집니다.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">바로가기</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="secondary" asChild>
              <Link href="/trainer/members">회원 목록</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/trainer/reports">주간 리포트</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 회원</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중...</div>
          ) : recentMembers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              아직 연결된 회원이 없습니다. <Link className="underline" href="/trainer/members">회원 관리</Link>에서 연결하세요.
            </div>
          ) : (
            <ul className="divide-y">
              {recentMembers.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {m.profiles?.full_name || m.profiles?.username || m.profiles?.email || m.member_id}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{m.member_id}</div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/trainer/reports?memberId=${encodeURIComponent(m.member_id)}`}>리포트</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

