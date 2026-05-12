'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getYearWeek, formatDateISO } from '@/lib/utils';
import { DAY_LABELS, MEAL_SLOT_LABELS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyReportChart } from '@/components/trainer/WeeklyReportChart';
import * as reportService from '@/services/trainer/report.service';

type MemberRow = {
  id: string;
  member_id: string;
  profiles?: { id: string; full_name?: string | null; username?: string | null; email?: string | null } | null;
};

function weekRangeFromYearWeek(yearWeek: number) {
  const year = Math.floor(yearWeek / 100);
  const weekNum = yearWeek % 100;
  const jan1 = new Date(year, 0, 1);
  const daysToAdd = (weekNum - 1) * 7;
  const firstDay = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  const weekStart = new Date(firstDay);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  return {
    start: formatDateISO(weekStart),
    end: formatDateISO(weekEnd),
  };
}

export default function TrainerReportsPage() {
  const params = useSearchParams();
  const preselectedMemberId = params.get('memberId');

  const week = useMemo(() => getYearWeek(), []);
  const range = useMemo(() => weekRangeFromYearWeek(week), [week]);

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(preselectedMemberId);

  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chart, setChart] = useState<{
    workoutData: Array<{ day: string; completed: number; planned: number }>;
    intensityData: Array<{ date: string; averageRpe: number }>;
    dietData: Array<{ name: string; value: number }>;
    volumeData: Array<{ date: string; volume: number }>;
    completionRate: number;
    submissionRate: number;
  } | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const trainerId = sessionData.session?.user.id;
      if (!trainerId) {
        setMembers([]);
        setLoadingMembers(false);
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
        .eq('trainer_id', trainerId)
        .eq('is_active', true)
        .order('joined_date', { ascending: false });

      if (!error && data) setMembers(data as unknown as MemberRow[]);
      setLoadingMembers(false);
    };

    loadMembers();
  }, []);

  const loadReport = async () => {
    if (!selectedMemberId) return;
    setLoadingReport(true);
    setError(null);
    setChart(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const trainerId = sessionData.session?.user.id;
      if (!trainerId) return;

      const completion = await reportService.calculateWorkoutCompletionRate(
        selectedMemberId,
        trainerId,
        week
      );

      const submission = await reportService.calculateDietSubmissionRate(
        selectedMemberId,
        week
      );

      const intensityData = await reportService.getWorkoutIntensityTrend(
        selectedMemberId,
        range.start,
        range.end
      );

      const volumeData = await reportService.getTotalVolumeTrend(
        selectedMemberId,
        range.start,
        range.end
      );

      const dietBySlot = await reportService.getDietSubmissionBySlot(
        selectedMemberId,
        range.start,
        range.end
      );

      const dietData = Object.entries(dietBySlot).map(([slot, value]) => ({
        name: MEAL_SLOT_LABELS[slot] ?? slot,
        value,
      }));

      // workoutData (planned vs completed) - MVP에서는 session day_of_week 기반으로 planned count를 대략 계산
      const { data: linkData } = await supabase
        .from('trainer_member_links')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('member_id', selectedMemberId)
        .limit(1)
        .maybeSingle();

      const linkId = (linkData as { id: string } | null)?.id;

      const plannedByDay: Record<number, number> = {};
      if (linkId) {
        const { data: programs } = await supabase
          .from('workout_programs')
          .select(
            `
            id,
            workout_sessions:id(
              day_of_week
            )
          `
          )
          .eq('link_id', linkId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        const sessions = (programs?.[0]?.workout_sessions as unknown as Array<{ day_of_week: number }> | undefined) ?? [];
        for (const s of sessions) plannedByDay[s.day_of_week] = (plannedByDay[s.day_of_week] || 0) + 1;
      }

      // completedByDay: 해당 주간 workout_logs를 요일로 집계
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('logged_date')
        .eq('member_id', selectedMemberId)
        .gte('logged_date', range.start)
        .lte('logged_date', range.end);

      const completedByDay: Record<number, number> = {};
      for (const l of logs ?? []) {
        const d = new Date(l.logged_date).getDay(); // 0=Sun ... 6=Sat
        const monday0 = d === 0 ? 6 : d - 1; // 0=Mon ... 6=Sun
        completedByDay[monday0] = (completedByDay[monday0] || 0) + 1;
      }

      const workoutData = DAY_LABELS.map((label, idx) => ({
        day: label,
        planned: plannedByDay[idx] || 0,
        completed: completedByDay[idx] || 0,
      }));

      setChart({
        workoutData,
        intensityData,
        dietData,
        volumeData,
        completionRate: completion?.rate ?? 0,
        submissionRate: submission?.rate ?? 0,
      });
    } catch (e) {
      setError('리포트를 불러오지 못했습니다.');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">주간 리포트</h1>
          <p className="text-sm text-muted-foreground">
            {week} 주 ({range.start} ~ {range.end})
          </p>
        </div>
        <Button onClick={loadReport} disabled={!selectedMemberId || loadingReport}>
          {loadingReport ? '불러오는 중...' : '리포트 불러오기'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">회원 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingMembers ? (
            <div className="text-sm text-muted-foreground">회원 목록 불러오는 중...</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground">연결된 회원이 없습니다.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const label =
                  m.profiles?.full_name || m.profiles?.username || m.profiles?.email || m.member_id;
                const selected = selectedMemberId === m.member_id;
                return (
                  <Button
                    key={m.id}
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => setSelectedMemberId(m.member_id)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            MVP에서는 DB에 데이터가 없으면 일부 차트가 비어 보일 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {chart && (
        <WeeklyReportChart
          workoutData={chart.workoutData}
          intensityData={chart.intensityData}
          dietData={chart.dietData}
          volumeData={chart.volumeData}
          completionRate={chart.completionRate}
          submissionRate={chart.submissionRate}
        />
      )}
    </div>
  );
}

