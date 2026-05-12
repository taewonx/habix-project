'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProfileRow = {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role: 'trainer' | 'member';
};

export default function MemberSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      setProfile((data as ProfileRow | null) ?? null);
      setLoading(false);
    };

    load();
  }, []);

  const copyMemberId = async () => {
    if (!profile?.id) return;
    await navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">프로필 정보와 연결에 필요한 ID를 확인합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중...</div>
          ) : !profile ? (
            <div className="text-sm text-muted-foreground">프로필을 찾을 수 없습니다.</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-muted-foreground">이메일</div>
                <div className="font-medium">{profile.email}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">이름</div>
                <div className="font-medium">{profile.full_name || '-'}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">회원 ID (트레이너 연결용)</div>
                <div className="font-mono text-xs break-all">{profile.id}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyMemberId} variant="outline">
                  {copied ? '복사됨' : 'ID 복사'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

