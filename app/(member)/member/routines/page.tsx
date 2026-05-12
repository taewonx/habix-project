'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDateISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutExercise, WorkoutSession } from '@/types';
import { WorkoutForm } from '@/components/member/WorkoutForm';

type LinkRow = { id: string };

type SessionRow = WorkoutSession & { workout_exercises?: WorkoutExercise[] };

export default function MemberRoutinesPage() {
  const today = useMemo(() => formatDateISO(new Date()), []);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [link, setLink] = useState<LinkRow | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flattenedExercises = useMemo(() => {
    const out: Array<{ session: WorkoutSession; exercise: WorkoutExercise }> = [];
    for (const s of sessions) {
      for (const e of s.workout_exercises ?? []) out.push({ session: s, exercise: e });
    }
    return out;
  }, [sessions]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedExercise(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      setMemberId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: linkData } = await supabase
        .from('trainer_member_links')
        .select('id')
        .eq('member_id', uid)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const linkRow = (linkData as LinkRow | null) ?? null;
      setLink(linkRow);
      if (!linkRow) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // link_id로 연결된 program → sessions → exercises 조회
      const { data: programs, error: progErr } = await supabase
        .from('workout_programs')
        .select(
          `
          id,
          workout_sessions:id(
            id,
            workout_program_id,
            session_name,
            day_of_week,
            session_order,
            duration_minutes,
            rest_between_exercises,
            notes,
            workout_exercises:id(
              *
            )
          )
        `
        )
        .eq('link_id', linkRow.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (progErr) {
        setError(progErr.message);
        setSessions([]);
        setLoading(false);
        return;
      }

      const allSessions: SessionRow[] =
        (programs?.[0]?.workout_sessions as unknown as SessionRow[] | undefined) ?? [];

      setSessions(allSessions);
      setLoading(false);
    };

    load();
  }, [today]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">운동 기록</h1>
        <p className="text-sm text-muted-foreground">오늘({today}) 운동을 기록합니다.</p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      ) : !memberId ? (
        <div className="text-sm text-muted-foreground">로그인이 필요합니다.</div>
      ) : !link ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">트레이너 연결이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            트레이너가 회원 ID로 연결하고 운동 프로그램을 배포하면, 여기에서 운동을 기록할 수 있습니다.
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">배포된 운동 프로그램이 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            트레이너 계정에서 운동 프로그램(프로그램→세션→운동)을 생성/배포한 뒤 다시 확인해 주세요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">운동 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {flattenedExercises.map(({ session, exercise }) => {
                  const selected = selectedExercise?.id === exercise.id;
                  return (
                    <Button
                      key={exercise.id}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedExercise(exercise)}
                      className="max-w-full"
                    >
                      {session.session_name}: {exercise.exercise_name}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                선택한 운동에 대해 “이전 세트 자동 불러오기”와 기록 저장을 테스트할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          {selectedExercise ? (
            <WorkoutForm
              exercise={selectedExercise}
              memberId={memberId}
              loggedDate={today}
              onError={(msg) => setError(msg)}
            />
          ) : (
            <div className="text-sm text-muted-foreground">운동을 선택해 주세요.</div>
          )}
        </div>
      )}
    </div>
  );
}

