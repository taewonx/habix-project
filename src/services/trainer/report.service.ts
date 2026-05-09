import { supabase } from '@/lib/supabase';
import { getYearWeek } from '@/lib/utils';

/**
 * 주간 성과 기록 조회 (차트용)
 */
export async function getWeeklyAchievement(
  memberId: string,
  week: number
) {
  const { data, error } = await supabase
    .from('achievement_records')
    .select('*')
    .eq('member_id', memberId)
    .eq('year_week', week)
    .single();

  if (error) {
    console.error('Failed to get achievement:', error);
    return null;
  }

  return data;
}

/**
 * 회원의 최근 8주 성과 데이터 (차트용)
 */
export async function getRecentWeeksAchievements(
  memberId: string,
  weeksCount: number = 8
) {
  // 최근 주간 번호 계산
  const currentWeek = getYearWeek();
  const weeks = [];

  for (let i = weeksCount - 1; i >= 0; i--) {
    weeks.push(currentWeek - i);
  }

  const { data, error } = await supabase
    .from('achievement_records')
    .select('*')
    .eq('member_id', memberId)
    .in('year_week', weeks)
    .order('year_week', { ascending: true });

  if (error) {
    console.error('Failed to get recent achievements:', error);
    return [];
  }

  return data || [];
}

/**
 * 회원의 주간 운동 완료도 계산
 */
export async function calculateWorkoutCompletionRate(
  memberId: string,
  trainerId: string,
  week: number
) {
  // 주간 시작/종료 날짜 계산
  const year = Math.floor(week / 100);
  const weekNum = week % 100;
  const jan1 = new Date(year, 0, 1);
  const daysToAdd = (weekNum - 1) * 7;
  const firstDay = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  const weekStart = new Date(firstDay);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  const startDateStr = weekStart.toISOString().split('T')[0];
  const endDateStr = weekEnd.toISOString().split('T')[0];

  // 계획된 세션 수 조회
  const { data: sessions, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('id')
    .in(
      'workout_program_id',
      await supabase
        .from('workout_programs')
        .select('id')
        .eq('link_id', 
          await supabase
            .from('trainer_member_links')
            .select('id')
            .eq('trainer_id', trainerId)
            .eq('member_id', memberId)
            .then(({ data }) => data?.[0]?.id)
        )
        .then(({ data }) => data?.map((p: { id: string }) => p.id) ?? [])
    );

  if (sessionError) {
    console.error('Failed to get sessions:', sessionError);
    return null;
  }

  // 실제 완료한 로그 수 조회
  const { data: logs, error: logsError } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('member_id', memberId)
    .gte('logged_date', startDateStr)
    .lte('logged_date', endDateStr);

  if (logsError) {
    console.error('Failed to get logs:', logsError);
    return null;
  }

  const plannedCount = sessions?.length || 0;
  const completedCount = logs?.length || 0;
  const rate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100 * 10) / 10 : 0;

  return {
    plannedCount,
    completedCount,
    rate,
  };
}

/**
 * 회원의 주간 식단 제출률 계산
 */
export async function calculateDietSubmissionRate(
  memberId: string,
  week: number
) {
  // 주간 시작/종료 날짜 계산
  const year = Math.floor(week / 100);
  const weekNum = week % 100;
  const jan1 = new Date(year, 0, 1);
  const daysToAdd = (weekNum - 1) * 7;
  const firstDay = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  const weekStart = new Date(firstDay);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startDateStr = weekStart.toISOString().split('T')[0];
  const endDateStr = weekEnd.toISOString().split('T')[0];

  // 제출한 로그 수 조회
  const { data: logs, error } = await supabase
    .from('diet_logs')
    .select('id')
    .eq('member_id', memberId)
    .gte('logged_date', startDateStr)
    .lte('logged_date', endDateStr);

  if (error) {
    console.error('Failed to get diet logs:', error);
    return null;
  }

  // 목표: 일주일 x 3끼 = 21끼
  const target = 7 * 3;
  const submitted = logs?.length || 0;
  const rate = Math.round((submitted / target) * 100 * 10) / 10;

  return {
    target,
    submitted,
    rate,
  };
}

/**
 * 회원의 운동 강도 추이 데이터 (RPE)
 */
export async function getWorkoutIntensityTrend(
  memberId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('logged_date, rpe_per_set')
    .eq('member_id', memberId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
    .order('logged_date', { ascending: true });

  if (error) {
    console.error('Failed to get intensity data:', error);
    return [];
  }

  // 날짜별 평균 RPE 계산
  const trend = (data || []).reduce(
    (acc, log) => {
      const date = log.logged_date;
      const rpeArray = log.rpe_per_set || [];
      const avgRpe = rpeArray.length > 0
        ? Math.round((rpeArray.reduce((a: number, b: number) => a + b, 0) / rpeArray.length) * 10) / 10
        : 0;

      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.rpeValues.push(avgRpe);
      } else {
        acc.push({
          date,
          rpeValues: [avgRpe],
        });
      }
      return acc;
    },
    [] as Array<{ date: string; rpeValues: number[] }>
  );

  // 날짜별 평균 계산
  return trend.map((item) => ({
    date: item.date,
    averageRpe: Math.round(
      (item.rpeValues.reduce((a, b) => a + b, 0) / item.rpeValues.length) * 10
    ) / 10,
  }));
}

/**
 * 회원의 부하량(Total Volume) 추이 데이터
 */
export async function getTotalVolumeTrend(
  memberId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('logged_date, total_volume')
    .eq('member_id', memberId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
    .order('logged_date', { ascending: true });

  if (error) {
    console.error('Failed to get volume data:', error);
    return [];
  }

  // 날짜별 총 부하량
  return (data || []).map((log) => ({
    date: log.logged_date,
    volume: log.total_volume || 0,
  }));
}

/**
 * 회원의 식단 제출 현황 데이터 (타임슬롯별)
 */
export async function getDietSubmissionBySlot(
  memberId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('diet_logs')
    .select('meal_slot')
    .eq('member_id', memberId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate);

  if (error) {
    console.error('Failed to get diet slot data:', error);
    return {};
  }

  // 타임슬롯별 집계
  return (data || []).reduce(
    (acc, log) => {
      acc[log.meal_slot] = (acc[log.meal_slot] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
