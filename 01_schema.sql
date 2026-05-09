-- ============================================
-- HABIX Fitness SaaS - Database Schema
-- Supabase (PostgreSQL) SQL Script
-- ============================================

-- ============================================
-- 1. PROFILES 테이블 (유저 프로필)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('trainer', 'member')),
  
  -- Trainer 추가 정보
  bio TEXT,
  specialization TEXT[], -- ['strength', 'cardio', 'flexibility', ...]
  years_of_experience INTEGER,
  
  -- Member 추가 정보
  age INTEGER,
  gender TEXT CHECK (gender IS NULL OR gender IN ('M', 'F', 'Other')),
  goal TEXT, -- 'weight_loss', 'muscle_gain', 'maintenance', ...
  current_weight DECIMAL(5,2), -- kg
  target_weight DECIMAL(5,2), -- kg
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TRAINER_MEMBER_LINKS 테이블 (1:N 관계)
-- ============================================
CREATE TABLE trainer_member_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT, -- 트레이너의 회원별 메모
  
  UNIQUE(trainer_id, member_id),
  CONSTRAINT different_users CHECK (trainer_id != member_id)
);

-- ============================================
-- 3. DIET_GUIDES 테이블 (트레이너 → 회원 식단 가이드)
-- ============================================
CREATE TABLE diet_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES trainer_member_links(id) ON DELETE CASCADE,
  
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- trainer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- 기간 설정
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 영양 목표
  daily_calories INTEGER,
  daily_protein DECIMAL(5,1), -- g
  daily_carbs DECIMAL(5,1), -- g
  daily_fat DECIMAL(5,1) -- g
);

-- ============================================
-- 4. DIET_GUIDE_MEALS 테이블 (타임슬롯 기반 식단 항목)
-- ============================================
CREATE TABLE diet_guide_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_guide_id UUID NOT NULL REFERENCES diet_guides(id) ON DELETE CASCADE,
  
  -- 타임슬롯 정보
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  slot_order INTEGER NOT NULL, -- 같은 슬롯 내에서 순서
  
  -- 추천 식품
  recommended_foods TEXT[], -- ['닭가슴살', '현미', ...]
  calories_target DECIMAL(5,1),
  protein_target DECIMAL(5,1),
  carbs_target DECIMAL(5,1),
  fat_target DECIMAL(5,1),
  
  notes TEXT, -- "고탄수 저지방 권장", "소화 시간 고려"
  
  UNIQUE(diet_guide_id, meal_slot, slot_order)
);

-- ============================================
-- 5. DIET_LOGS 테이블 (회원의 실제 식단 기록)
-- ============================================
CREATE TABLE diet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES trainer_member_links(id) ON DELETE CASCADE,
  
  logged_date DATE NOT NULL,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 주요 정보
  description TEXT NOT NULL, -- "닭가슴살 200g, 현미밥 1공기"
  calories DECIMAL(5,1),
  protein DECIMAL(5,1),
  carbs DECIMAL(5,1),
  fat DECIMAL(5,1),
  
  mood INTEGER CHECK (mood >= 0 AND mood <= 10), -- 식사 후 만족도 0-10
  notes TEXT,
  
  UNIQUE(member_id, logged_date, meal_slot)
);

-- ============================================
-- 6. DIET_LOG_PHOTOS 테이블 (식단 로그 사진)
-- ============================================
CREATE TABLE diet_log_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_log_id UUID NOT NULL REFERENCES diet_logs(id) ON DELETE CASCADE,
  
  storage_path TEXT NOT NULL UNIQUE, -- Supabase Storage: users/{member_id}/diet/{date}/{filename}
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  mime_type TEXT,
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 메타데이터
  width INTEGER,
  height INTEGER,
  is_compressed BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 7. WORKOUT_PROGRAMS 테이블 (트레이너 → 회원 운동 프로그램)
-- ============================================
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES trainer_member_links(id) ON DELETE CASCADE,
  
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- trainer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- 기간 설정
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 목표
  goal TEXT, -- 'strength', 'endurance', 'hypertrophy', 'flexibility'
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- ============================================
-- 8. WORKOUT_SESSIONS 테이블 (프로그램 내 세션 - 요일별)
-- ============================================
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  
  session_name TEXT NOT NULL, -- "Back & Biceps Day"
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
  session_order INTEGER NOT NULL, -- 프로그램 내 순서 (1, 2, 3...)
  
  duration_minutes INTEGER, -- 예상 시간
  rest_between_exercises INTEGER, -- 운동 간 휴식 (초)
  notes TEXT,
  
  UNIQUE(workout_program_id, session_order)
);

-- ============================================
-- 9. WORKOUT_EXERCISES 테이블 (세션 내 각 운동)
-- ============================================
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  
  exercise_name TEXT NOT NULL, -- "Barbell Squat", "Bench Press"
  exercise_category TEXT, -- 'compound', 'isolation'
  
  sets_planned INTEGER NOT NULL,
  reps_planned INTEGER NOT NULL,
  weight_preset DECIMAL(6,2), -- kg, 이전 기록에서 불러올 기본값
  
  rest_seconds INTEGER, -- 세트 간 휴식
  rpe_target INTEGER CHECK (rpe_target >= 0 AND rpe_target <= 10), -- Rate of Perceived Exertion
  
  notes TEXT,
  demo_video_url TEXT, -- 운동 설명 영상 링크
  
  exercise_order INTEGER NOT NULL,
  UNIQUE(session_id, exercise_order)
);

-- ============================================
-- 10. WORKOUT_LOGS 테이블 (회원의 실제 운동 기록)
-- ============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  
  logged_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 실제 수행 데이터
  sets_completed INTEGER,
  reps_per_set INTEGER[], -- [8, 8, 7] 형식
  weight_per_set DECIMAL(6,2)[], -- [100, 100, 100] kg
  rpe_per_set INTEGER[], -- [8, 8, 9]
  
  total_volume DECIMAL(8,2), -- weight * reps * sets (총 부하)
  difficulty_feedback TEXT, -- 'too_easy', 'just_right', 'too_hard'
  
  notes TEXT,
  
  UNIQUE(member_id, exercise_id, logged_date)
);

-- ============================================
-- 11. ACHIEVEMENT_RECORDS 테이블 (주간 성과 기록)
-- ============================================
CREATE TABLE achievement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES trainer_member_links(id) ON DELETE CASCADE,
  
  -- 주간 데이터
  year_week INTEGER NOT NULL, -- ~202501 형식
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- 운동 목표
  workout_sessions_planned INTEGER,
  workout_sessions_completed INTEGER,
  workout_completion_rate DECIMAL(3,1), -- percentage
  
  -- 식단 목표
  diet_logs_target INTEGER,
  diet_logs_submitted INTEGER,
  diet_submission_rate DECIMAL(3,1), -- percentage
  
  -- 통계
  total_volume_lifted DECIMAL(10,2), -- 전체 중량 합게
  average_rpe DECIMAL(3,1),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(member_id, year_week)
);

-- ============================================
-- Indexes (성능 최적화)
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_trainer_member_links_trainer ON trainer_member_links(trainer_id);
CREATE INDEX idx_trainer_member_links_member ON trainer_member_links(member_id);
CREATE INDEX idx_trainer_member_links_active ON trainer_member_links(is_active, trainer_id);

CREATE INDEX idx_diet_guides_link ON diet_guides(link_id);
CREATE INDEX idx_diet_guides_created_by ON diet_guides(created_by);
CREATE INDEX idx_diet_guides_active ON diet_guides(is_active);

CREATE INDEX idx_diet_guide_meals_guide ON diet_guide_meals(diet_guide_id);
CREATE INDEX idx_diet_guide_meals_slot ON diet_guide_meals(meal_slot);

CREATE INDEX idx_diet_logs_member ON diet_logs(member_id);
CREATE INDEX idx_diet_logs_link ON diet_logs(link_id);
CREATE INDEX idx_diet_logs_date ON diet_logs(logged_date);
CREATE INDEX idx_diet_logs_slot ON diet_logs(meal_slot);

CREATE INDEX idx_diet_log_photos_diet_log ON diet_log_photos(diet_log_id);

CREATE INDEX idx_workout_programs_link ON workout_programs(link_id);
CREATE INDEX idx_workout_programs_created_by ON workout_programs(created_by);
CREATE INDEX idx_workout_programs_active ON workout_programs(is_active);

CREATE INDEX idx_workout_sessions_program ON workout_sessions(workout_program_id);
CREATE INDEX idx_workout_sessions_dow ON workout_sessions(day_of_week);

CREATE INDEX idx_workout_exercises_session ON workout_exercises(session_id);

CREATE INDEX idx_workout_logs_member ON workout_logs(member_id);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(logged_date);

CREATE INDEX idx_achievement_records_member ON achievement_records(member_id);
CREATE INDEX idx_achievement_records_link ON achievement_records(link_id);
CREATE INDEX idx_achievement_records_week ON achievement_records(year_week);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_member_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_guide_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_log_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_records ENABLE ROW LEVEL SECURITY;
