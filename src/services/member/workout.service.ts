import { supabase } from '@/lib/supabase';
import { WorkoutLog, CreateWorkoutLogInput } from '@/types';

/**
 * 회원의 마지막 운동 기록 조회 (이전 세트 불러오기)
 */
export async function getPreviousWorkoutLog(
  exerciseId: string,
  memberId: string
): Promise<WorkoutLog | null> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('member_id', memberId)
    .order('logged_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to get previous workout log:', error);
    return null;
  }

  return data;
}

/**
 * 회원의 운동 기록 생성
 */
export async function createWorkoutLog(
  memberId: string,
  input: CreateWorkoutLogInput
): Promise<WorkoutLog | null> {
  // 총 부하 계산 (weight * reps * sets)
  const totalVolume = input.weight_per_set.reduce((sum, weight, idx) => {
    return sum + weight * input.reps_per_set[idx];
  }, 0);

  const { data, error } = await supabase
    .from('workout_logs')
    .insert([
      {
        member_id: memberId,
        exercise_id: input.exercise_id,
        logged_date: input.logged_date,
        sets_completed: input.sets_completed,
        reps_per_set: input.reps_per_set,
        weight_per_set: input.weight_per_set,
        rpe_per_set: input.rpe_per_set,
        total_volume: totalVolume,
        difficulty_feedback: input.difficulty_feedback,
        notes: input.notes,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Failed to create workout log:', error);
    return null;
  }

  return data;
}

/**
 * 운동 기록 업데이트
 */
export async function updateWorkoutLog(
  logId: string,
  input: Partial<CreateWorkoutLogInput>
): Promise<WorkoutLog | null> {
  const { data, error } = await supabase
    .from('workout_logs')
    .update(input)
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update workout log:', error);
    return null;
  }

  return data;
}

/**
 * 특정 날짜의 운동 기록 조회
 */
export async function getWorkoutLogsByDate(
  memberId: string,
  date: string
) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select(
      `
      *,
      workout_exercises:exercise_id(
        id,
        exercise_name,
        sets_planned,
        reps_planned,
        weight_preset,
        rest_seconds,
        rpe_target
      )
    `
    )
    .eq('member_id', memberId)
    .eq('logged_date', date)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get workout logs:', error);
    return [];
  }

  return data;
}

/**
 * 주간 운동 통계
 */
export async function getWeeklyWorkoutStats(
  memberId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('member_id', memberId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate);

  if (error) {
    console.error('Failed to get weekly stats:', error);
    return null;
  }

  // 통계 계산
  const stats = {
    totalLogsCount: data?.length || 0,
    totalVolume: data?.reduce((sum, log) => sum + (log.total_volume || 0), 0) || 0,
    averageRPE:
      data && data.length > 0
        ? Math.round(
            (data.reduce((sum, log) => {
              const rpeArray = log.rpe_per_set || [];
              const avgRpe = rpeArray.length > 0
                ? rpeArray.reduce((a: number, b: number) => a + b, 0) / rpeArray.length
                : 0;
              return sum + avgRpe;
            }, 0) / data.length) * 10
          ) / 10
        : 0,
    byday: (data || []).reduce(
      (acc, log) => {
        const day = new Date(log.logged_date).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    ),
  };

  return stats;
}

/**
 * 운동 기록 삭제
 */
export async function deleteWorkoutLog(logId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Failed to delete workout log:', error);
    return false;
  }

  return true;
}
