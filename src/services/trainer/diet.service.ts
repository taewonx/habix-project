import { supabase } from '@/lib/supabase';
import { DietGuide, CreateDietGuideInput } from '@/types';

/**
 * 트레이너의 식단 가이드 목록 조회
 */
export async function getDietGuidesByTrainer(trainerId: string) {
  const { data, error } = await supabase
    .from('diet_guides')
    .select(
      `
      *,
      trainer_member_links:link_id(
        member_id,
        profiles:member_id(
          id,
          username,
          full_name
        )
      )
    `
    )
    .eq('created_by', trainerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get diet guides:', error);
    return [];
  }

  return data;
}

/**
 * 특정 회원을 위한 식단 가이드 조회
 */
export async function getDietGuideForMemberByTrainer(
  trainerId: string,
  memberId: string
) {
  // trainer_member_links 확인
  const { data: linkData } = await supabase
    .from('trainer_member_links')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('member_id', memberId)
    .single();

  if (!linkData) return null;

  // 식단 가이드 조회
  const { data, error } = await supabase
    .from('diet_guides')
    .select(
      `
      *,
      diet_guide_meals:id(
        *
      )
    `
    )
    .eq('link_id', linkData.id)
    .eq('created_by', trainerId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Failed to get diet guide:', error);
    return null;
  }

  return data;
}

/**
 * 식단 가이드 생성
 */
export async function createDietGuide(
  trainerId: string,
  input: CreateDietGuideInput
): Promise<DietGuide | null> {
  // trainer_member_links ID 조회
  const { data: linkData } = await supabase
    .from('trainer_member_links')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('member_id', input.member_id)
    .single();

  if (!linkData) {
    console.error('Trainer-member link not found');
    return null;
  }

  // 1. DietGuide 생성
  const { data: guideData, error: guideError } = await supabase
    .from('diet_guides')
    .insert([
      {
        link_id: linkData.id,
        created_by: trainerId,
        title: input.title,
        description: input.description,
        start_date: input.start_date,
        end_date: input.end_date,
        daily_calories: input.daily_calories,
        daily_protein: input.daily_protein,
        daily_carbs: input.daily_carbs,
        daily_fat: input.daily_fat,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (guideError || !guideData) {
    console.error('Failed to create diet guide:', guideError);
    return null;
  }

  // 2. DietGuideMeals 일괄 생성
  const meals = input.meals.map((meal) => ({
    diet_guide_id: guideData.id,
    meal_slot: meal.meal_slot,
    slot_order: meal.slot_order,
    recommended_foods: meal.recommended_foods,
    calories_target: meal.calories_target,
    protein_target: meal.protein_target,
    carbs_target: meal.carbs_target,
    fat_target: meal.fat_target,
    notes: meal.notes,
  }));

  const { error: mealsError } = await supabase
    .from('diet_guide_meals')
    .insert(meals);

  if (mealsError) {
    console.error('Failed to create diet guide meals:', mealsError);
    // Guide는 생성되었으므로 일부 실패
    return guideData;
  }

  return guideData;
}

/**
 * 식단 가이드 업데이트
 */
export async function updateDietGuide(
  guideId: string,
  trainerId: string,
  input: Partial<CreateDietGuideInput>
): Promise<DietGuide | null> {
  const { data, error } = await supabase
    .from('diet_guides')
    .update(input)
    .eq('id', guideId)
    .eq('created_by', trainerId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update diet guide:', error);
    return null;
  }

  return data;
}

/**
 * 식단 가이드 비활성화 (삭제 대신 논리적 삭제)
 */
export async function deactivateDietGuide(
  guideId: string,
  trainerId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('diet_guides')
    .update({ is_active: false })
    .eq('id', guideId)
    .eq('created_by', trainerId);

  if (error) {
    console.error('Failed to deactivate diet guide:', error);
    return false;
  }

  return true;
}

/**
 * 식단 가이드 식사 항목 업데이트
 */
export async function updateDietGuideMeal(
  mealId: string,
  guideId: string,
  update: {
    recommended_foods?: string[];
    calories_target?: number;
    protein_target?: number;
    carbs_target?: number;
    fat_target?: number;
    notes?: string;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('diet_guide_meals')
    .update(update)
    .eq('id', mealId)
    .eq('diet_guide_id', guideId);

  if (error) {
    console.error('Failed to update diet guide meal:', error);
    return false;
  }

  return true;
}
