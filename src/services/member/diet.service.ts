import { supabase } from '@/lib/supabase';
import { DietLog, DietLogPhoto, CreateDietLogInput } from '@/types';
import { STORAGE_BUCKETS } from '@/lib/constants';

/**
 * 특정 날짜의 식단 가이드 조회 (시간슬롯 기반)
 */
export async function getDietGuideForMember(
  memberId: string,
  trainerId: string
) {
  // trainer_member_links에서 link_id 조회
  const { data: linkData } = await supabase
    .from('trainer_member_links')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('member_id', memberId)
    .single();

  if (!linkData) return null;

  // 활성화된 식단 가이드 조회
  const { data, error } = await supabase
    .from('diet_guides')
    .select(
      `
      *,
      diet_guide_meals:id(*)
    `
    )
    .eq('link_id', linkData.id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Failed to get diet guide:', error);
    return null;
  }

  return data;
}

/**
 * 특정 날짜의 식단 기록 조회 (시간슬롯별로 정렬)
 */
export async function getDietLogsByDate(
  memberId: string,
  date: string
) {
  const { data, error } = await supabase
    .from('diet_logs')
    .select(
      `
      *,
      diet_log_photos:id(*)
    `
    )
    .eq('member_id', memberId)
    .eq('logged_date', date)
    .order('meal_slot', { ascending: true });

  if (error) {
    console.error('Failed to get diet logs:', error);
    return [];
  }

  return data;
}

/**
 * 식단 기록 생성
 */
export async function createDietLog(
  memberId: string,
  linkId: string,
  input: CreateDietLogInput
): Promise<DietLog | null> {
  const { data, error } = await supabase
    .from('diet_logs')
    .insert([
      {
        member_id: memberId,
        link_id: linkId,
        logged_date: input.logged_date,
        meal_slot: input.meal_slot,
        description: input.description,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        mood: input.mood,
        notes: input.notes,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Failed to create diet log:', error);
    return null;
  }

  return data;
}

/**
 * 식단 기록 업데이트
 */
export async function updateDietLog(
  logId: string,
  input: Partial<CreateDietLogInput>
): Promise<DietLog | null> {
  const { data, error } = await supabase
    .from('diet_logs')
    .update(input)
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update diet log:', error);
    return null;
  }

  return data;
}

/**
 * 식단 로그에 사진 추가
 */
export async function addDietLogPhoto(
  dietLogId: string,
  storagePath: string,
  fileName: string,
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
  }
): Promise<DietLogPhoto | null> {
  const { data, error } = await supabase
    .from('diet_log_photos')
    .insert([
      {
        diet_log_id: dietLogId,
        storage_path: storagePath,
        file_name: fileName,
        file_size: metadata?.fileSize,
        mime_type: metadata?.mimeType,
        width: metadata?.width,
        height: metadata?.height,
        is_compressed: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Failed to add diet log photo:', error);
    return null;
  }

  return data;
}

/**
 * 주간 식단 통계
 */
export async function getWeeklyDietStats(
  memberId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('member_id', memberId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
    .order('logged_date', { ascending: true });

  if (error) {
    console.error('Failed to get weekly diet stats:', error);
    return null;
  }

  // 통계 계산
  const stats = {
    totalLogsCount: data?.length || 0,
    byMealSlot: (data || []).reduce(
      (acc, log) => {
        acc[log.meal_slot] = (acc[log.meal_slot] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byDay: (data || []).reduce(
      (acc, log) => {
        const date = log.logged_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    averageMood:
      data && data.length > 0
        ? Math.round(
            (data
              .filter((log) => log.mood !== null)
              .reduce((sum, log) => sum + log.mood, 0) /
              data.filter((log) => log.mood !== null).length) *
              10
          ) / 10
        : 0,
  };

  return stats;
}

/**
 * 식단 기록 삭제
 */
export async function deleteDietLog(logId: string): Promise<boolean> {
  const { error } = await supabase
    .from('diet_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Failed to delete diet log:', error);
    return false;
  }

  return true;
}

/**
 * 식단 로그 사진 삭제
 */
export async function deleteDietLogPhoto(
  photoId: string,
  storagePath: string
): Promise<boolean> {
  // DB에서 삭제
  const { error: dbError } = await supabase
    .from('diet_log_photos')
    .delete()
    .eq('id', photoId);

  if (dbError) {
    console.error('Failed to delete photo record:', dbError);
    return false;
  }

  // Storage에서 삭제
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKETS.CONTENT)
    .remove([storagePath]);

  if (storageError) {
    console.error('Failed to delete storage file:', storageError);
    return false;
  }

  return true;
}

/**
 * 사진의 public URL 생성 (이미 업로드되고 RLS 허용된 상태)
 */
export function getDietLogPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.CONTENT)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
