-- ============================================
-- HABIX RLS (Row Level Security) Policies
-- Supabase에서 모든 테이블의 데이터 접근 제어
-- ============================================

-- ============================================
-- 1. PROFILES RLS Policies
-- ============================================

-- 모든 사용자: 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 모든 사용자: 자신의 프로필만 업데이트 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 로그인/회원가입 직후 클라이언트(ensureUserProfile)가 자신의 행만 INSERT 가능
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trainer: 자신의 회원 목록 조회
-- (trainer_member_links를 통해 trainer_id = auth.uid()인 member 프로필 조회)
CREATE POLICY "Trainers can view their members' profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND member_id = id
        AND is_active = TRUE
    )
  );

-- ============================================
-- 2. TRAINER_MEMBER_LINKS RLS Policies
-- ============================================

-- 트레이너: 자신이 만든 링크 조회
CREATE POLICY "Trainers can view their member links"
  ON trainer_member_links FOR SELECT
  USING (trainer_id = auth.uid());

-- 회원: 자신의 트레이너 링크 조회
CREATE POLICY "Members can view their trainer links"
  ON trainer_member_links FOR SELECT
  USING (member_id = auth.uid());

-- 트레이너: 자신이 만든 링크만 업데이트
CREATE POLICY "Trainers can update their member links"
  ON trainer_member_links FOR UPDATE
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- ============================================
-- 3. DIET_GUIDES RLS Policies
-- ============================================

-- 트레이너: 자신이 생성한 가이드 조회
CREATE POLICY "Trainers can view their diet guides"
  ON diet_guides FOR SELECT
  USING (
    created_by = auth.uid()
  );

-- 회원: 자신에게 할당된 가이드 조회
CREATE POLICY "Members can view their assigned diet guides"
  ON diet_guides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_member_links.id = diet_guides.link_id
        AND member_id = auth.uid()
    )
  );

-- 트레이너: 자신의 식단 가이드만 생성 가능
CREATE POLICY "Trainers can create diet guides"
  ON diet_guides FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND trainer_member_links.id = diet_guides.link_id
    )
  );

-- 트레이너: 자신의 가이드만 수정
CREATE POLICY "Trainers can update their diet guides"
  ON diet_guides FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- 4. DIET_GUIDE_MEALS RLS Policies
-- ============================================

-- 트레이너/회원: 식단 가이드에 속한 식사 항목 조회
CREATE POLICY "Users can view diet guide meals"
  ON diet_guide_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diet_guides
      WHERE id = diet_guide_id
        AND (
          created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM trainer_member_links
            WHERE trainer_member_links.id = diet_guides.link_id
              AND member_id = auth.uid()
          )
        )
    )
  );

-- 트레이너: 자신의 가이드에만 식사 항목 추가
CREATE POLICY "Trainers can create diet guide meals"
  ON diet_guide_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diet_guides
      WHERE id = diet_guide_id
        AND created_by = auth.uid()
    )
  );

-- ============================================
-- 5. DIET_LOGS RLS Policies
-- ============================================

-- 회원: 자신의 식단 로그만 조회/생성/수정
CREATE POLICY "Members can manage their diet logs"
  ON diet_logs FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Members can create diet logs"
  ON diet_logs FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE id = link_id
        AND member_id = auth.uid()
        AND is_active = TRUE
    )
  );

CREATE POLICY "Members can update their diet logs"
  ON diet_logs FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- 트레이너: 자신의 회원의 식단 로그 조회 (분석용)
CREATE POLICY "Trainers can view their members' diet logs"
  ON diet_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND member_id = diet_logs.member_id
        AND is_active = TRUE
    )
  );

-- ============================================
-- 6. DIET_LOG_PHOTOS RLS Policies
-- ============================================

-- 회원: 자신의 식단 사진 업로드/조회
CREATE POLICY "Members can manage their diet photos"
  ON diet_log_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diet_logs
      WHERE id = diet_log_id
        AND member_id = auth.uid()
    )
  );

CREATE POLICY "Members can upload diet photos"
  ON diet_log_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diet_logs
      WHERE id = diet_log_id
        AND member_id = auth.uid()
    )
  );

-- 트레이너: 자신의 회원 사진 조회
CREATE POLICY "Trainers can view their members' diet photos"
  ON diet_log_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diet_logs
      JOIN trainer_member_links ON trainer_member_links.member_id = diet_logs.member_id
      WHERE diet_logs.id = diet_log_id
        AND trainer_member_links.trainer_id = auth.uid()
        AND trainer_member_links.is_active = TRUE
    )
  );

-- ============================================
-- 7. WORKOUT_PROGRAMS RLS Policies
-- ============================================

-- 트레이너: 자신의 프로그램만 조회
CREATE POLICY "Trainers can view their programs"
  ON workout_programs FOR SELECT
  USING (created_by = auth.uid());

-- 회원: 할당된 프로그램 조회
CREATE POLICY "Members can view their programs"
  ON workout_programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_member_links.id = workout_programs.link_id
        AND member_id = auth.uid()
        AND is_active = TRUE
    )
  );

-- 트레이너: 자신의 회원에게만 프로그램 할당
CREATE POLICY "Trainers can create programs"
  ON workout_programs FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND trainer_member_links.id = workout_programs.link_id
    )
  );

-- ============================================
-- 8. WORKOUT_SESSIONS RLS Policies
-- ============================================

-- 트레이너/회원: 프로그램에 속한 세션 조회
CREATE POLICY "Users can view workout sessions"
  ON workout_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = workout_program_id
        AND (
          created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM trainer_member_links
            WHERE trainer_member_links.id = workout_programs.link_id
              AND member_id = auth.uid()
              AND is_active = TRUE
          )
        )
    )
  );

-- ============================================
-- 9. WORKOUT_EXERCISES RLS Policies
-- ============================================

-- 트레이너/회원: 세션에 속한 운동 조회
CREATE POLICY "Users can view workout exercises"
  ON workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      JOIN workout_programs ON workout_programs.id = workout_sessions.workout_program_id
      WHERE workout_sessions.id = session_id
        AND (
          workout_programs.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM trainer_member_links
            WHERE trainer_member_links.id = workout_programs.link_id
              AND member_id = auth.uid()
              AND is_active = TRUE
          )
        )
    )
  );

-- ============================================
-- 10. WORKOUT_LOGS RLS Policies
-- ============================================

-- 회원: 자신의 운동 로그만 조회/생성/수정
CREATE POLICY "Members can manage their workout logs"
  ON workout_logs FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Members can create workout logs"
  ON workout_logs FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workout_sessions ON workout_sessions.id = workout_exercises.session_id
      JOIN workout_programs ON workout_programs.id = workout_sessions.workout_program_id
      JOIN trainer_member_links ON trainer_member_links.id = workout_programs.link_id
      WHERE workout_exercises.id = exercise_id
        AND trainer_member_links.member_id = auth.uid()
        AND trainer_member_links.is_active = TRUE
    )
  );

CREATE POLICY "Members can update their workout logs"
  ON workout_logs FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- 트레이너: 회원의 운동 로그 조회 (분석용)
CREATE POLICY "Trainers can view their members' workout logs"
  ON workout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND member_id = workout_logs.member_id
        AND is_active = TRUE
    )
  );

-- ============================================
-- 11. ACHIEVEMENT_RECORDS RLS Policies
-- ============================================

-- 회원: 자신의 성과 기록 조회
CREATE POLICY "Members can view their achievements"
  ON achievement_records FOR SELECT
  USING (member_id = auth.uid());

-- 트레이너: 회원의 성과 기록 조회
CREATE POLICY "Trainers can view their members' achievements"
  ON achievement_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND member_id = achievement_records.member_id
        AND is_active = TRUE
    )
  );

-- ============================================
-- Supabase Storage RLS Policies (추가)
-- ============================================
-- Note: Storage bucket 생성 후 따로 정책 설정 필요:
-- 1. Bucket name: habix-content
--    - Path: users/{member_id}/* (회원만 자신의 폴더 접근)
--    - Path: trainers/{trainer_id}/* (트레이너만 자신의 폴더 접근)
