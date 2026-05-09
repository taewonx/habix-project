// 사용자 역할
export type UserRole = 'trainer' | 'member';

// 운동 정보
export interface WorkoutProgram {
  id: string;
  link_id: string;
  created_by: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  goal: 'strength' | 'endurance' | 'hypertrophy' | 'flexibility';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  workout_program_id: string;
  session_name: string;
  day_of_week: number; // 0-6 (Monday-Sunday)
  session_order: number;
  duration_minutes?: number;
  rest_between_exercises?: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_name: string;
  exercise_category: 'compound' | 'isolation';
  sets_planned: number;
  reps_planned: number;
  weight_preset?: number;
  rest_seconds?: number;
  rpe_target?: number;
  notes?: string;
  demo_video_url?: string;
  exercise_order: number;
}

export interface WorkoutLog {
  id: string;
  member_id: string;
  exercise_id: string;
  logged_date: string;
  sets_completed?: number;
  reps_per_set?: number[];
  weight_per_set?: number[];
  rpe_per_set?: number[];
  total_volume?: number;
  difficulty_feedback?: 'too_easy' | 'just_right' | 'too_hard';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 식단 정보
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface DietGuide {
  id: string;
  link_id: string;
  created_by: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  daily_calories?: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  created_at: string;
  updated_at: string;
}

export interface DietGuideMeal {
  id: string;
  diet_guide_id: string;
  meal_slot: MealSlot;
  slot_order: number;
  recommended_foods?: string[];
  calories_target?: number;
  protein_target?: number;
  carbs_target?: number;
  fat_target?: number;
  notes?: string;
}

export interface DietLog {
  id: string;
  member_id: string;
  link_id: string;
  logged_date: string;
  meal_slot: MealSlot;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mood?: number; // 0-10
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DietLogPhoto {
  id: string;
  diet_log_id: string;
  storage_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  is_compressed: boolean;
  uploaded_at: string;
}

// 사용자 프로필
export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  
  // Trainer specific
  bio?: string;
  specialization?: string[];
  years_of_experience?: number;
  
  // Member specific
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  goal?: string;
  current_weight?: number;
  target_weight?: number;
  
  created_at: string;
  updated_at: string;
}

export interface TrainerMemberLink {
  id: string;
  trainer_id: string;
  member_id: string;
  joined_date: string;
  is_active: boolean;
  notes?: string;
}

export interface AchievementRecord {
  id: string;
  member_id: string;
  link_id: string;
  year_week: number;
  week_start_date: string;
  week_end_date: string;
  
  workout_sessions_planned: number;
  workout_sessions_completed: number;
  workout_completion_rate?: number;
  
  diet_logs_target: number;
  diet_logs_submitted: number;
  diet_submission_rate?: number;
  
  total_volume_lifted?: number;
  average_rpe?: number;
  
  created_at: string;
  updated_at: string;
}

// 폼 타입
export interface CreateWorkoutLogInput {
  exercise_id: string;
  logged_date: string;
  sets_completed: number;
  reps_per_set: number[];
  weight_per_set: number[];
  rpe_per_set: number[];
  difficulty_feedback?: 'too_easy' | 'just_right' | 'too_hard';
  notes?: string;
}

export interface CreateDietLogInput {
  logged_date: string;
  meal_slot: MealSlot;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mood?: number;
  notes?: string;
  photos?: File[];
}

export interface CreateDietGuideInput {
  member_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  daily_calories?: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  meals: Array<{
    meal_slot: MealSlot;
    slot_order: number;
    recommended_foods?: string[];
    calories_target?: number;
    protein_target?: number;
    carbs_target?: number;
    fat_target?: number;
    notes?: string;
  }>;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
