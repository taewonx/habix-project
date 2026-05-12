'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MemberRow = {
  id: string;
  member_id: string;
  is_active: boolean;
  joined_date: string;
  profiles?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null;
};

export default function TrainerMembersPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const trainerId = sessionData.session?.user.id;
    if (!trainerId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data, error: qErr } = await supabase
      .from('trainer_member_links')
      .select(
        `
        id,
        member_id,
        is_active,
        joined_date,
        profiles:member_id(
          id,
          full_name,
          username,
          email
        )
      `
      )
      .eq('trainer_id', trainerId)
      .order('joined_date', { ascending: false });

    if (qErr) setError(qErr.message);
    setMembers((data as unknown as MemberRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const connectMember = async () => {
    setError(null);
    setInfo(null);
    const trimmed = memberId.trim();
    if (!trimmed) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const trainerId = sessionData.session?.user.id;
    if (!trainerId) return;

    const { error: insErr } = await supabase.from('trainer_member_links').insert({
      trainer_id: trainerId,
      member_id: trimmed,
      is_active: true,
    });

    if (insErr) {
      setError(insErr.message);
      return;
    }

    setMemberId('');
    setInfo('회원이 연결되었습니다.');
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <p className="text-sm text-muted-foreground">
          회원의 Supabase user id(=profiles.id)를 입력해 연결할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">회원 연결</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              {info}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="member user id (uuid)"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <Button onClick={connectMember}>연결</Button>
            <Button variant="outline" onClick={load}>
              새로고침
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            실제 서비스에서는 초대 링크/QR로 대체하는 게 좋지만, MVP에선 연결 동작 확인을 위해 입력 방식으로 제공했습니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">회원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중...</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground">연결된 회원이 없습니다.</div>
          ) : (
            <ul className="divide-y">
              {members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {m.profiles?.full_name || m.profiles?.username || m.profiles?.email || m.member_id}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{m.member_id}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.is_active ? '활성' : '비활성'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

