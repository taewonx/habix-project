'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LinkRow = { id: string; trainer_id: string; is_active: boolean };

export default function MemberDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<LinkRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const memberId = sessionData.session?.user.id;
      if (!memberId) {
        setLink(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trainer_member_links')
        .select('id, trainer_id, is_active')
        .eq('member_id', memberId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!error) setLink((data as LinkRow | null) ?? null);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">회원 대시보드</h1>
          <p className="text-sm text-muted-foreground">
            오늘의 운동/식단을 기록하고 주간 성과를 확인하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/member/routines">운동 기록</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/member/diet">식단 기록</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">트레이너 연결</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">확인 중...</div>
            ) : link ? (
              <div className="space-y-2">
                <div className="text-sm">연결됨</div>
                <div className="text-xs text-muted-foreground break-all">link_id: {link.id}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                아직 트레이너와 연결되지 않았습니다. 트레이너가 회원 ID로 연결하면 기능이 활성화됩니다.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">바로가기</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="secondary" asChild>
              <Link href="/member/routines">운동</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/member/diet">식단</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/member/settings">설정</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">안내</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>- 운동/식단 기록은 Supabase에 저장됩니다.</div>
            <div>- 사진 업로드는 Storage 버킷 `habix-content` 설정이 필요합니다.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

