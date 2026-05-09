# 🏋️ HABIX - 트레이너-회원 분리형 피트니스 관리 SaaS

**프로젝트 버전**: MVP v1.0  
**작성일**: 2026년 5월  
**개발 기간**: 3개월 (예상)  
**목표**: 트레이너와 회원을 위한 통합 피트니스 관리 플랫폼

---

## 📌 프로젝트 개요

### 1.1 서비스 미션
HABIX는 **피트니스 트레이너**와 **회원(클라이언트)**을 위한 SaaS 플랫폼으로, 
- 트레이너의 회원 관리 효율화
- 회원의 운동/식단 관리 자동화
- 데이터 기반 성과 추적 및 분석
을 통해 피트니스 관리를 **과학적이고 체계적**으로 만드는 것을 목표합니다.

### 1.2 핵심 가치 제안
| 대상 | 주요 가치 |
|-----|---------|
| **Trainer** | 불필요한 엑셀/카톡 관리 제거 → 회원 분석에 집중 |
| **Member** | 일관된 데이터 기록 → 객관적 성과 추적 및 동기 부여 |

### 1.3 확장 계획
- **Phase 1 (MVP)**: Web SaaS (Next.js)
- **Phase 2**: Capacitor → 하이브리드 앱 (iOS/Android)
- **Phase 3**: 그룹 운동 기능, AI 코칭, 푸시 알림 등

---

## 🎯 핵심 요구사항

### 2.1 유저 역할 및 권한 (RBAC)

#### Trainer (트레이너)
**대시보드**
- 등록된 회원 목록 (가입일, 활성화 상태)
- 회원별 현황 카드 (최근 운동/식단 제출률, 진행 중인 프로그램)
- 주간/월간 분석 대시보드

**회원 관리**
- 회원 초대/수락 시스템 (QR코드 또는 초대 링크)
- 회원별 상세 정보 관리
  - 신체 정보 (나이, 성별, 현재/목표 체중)
  - 목표 설정
  - 이전 기록 조회 가능
- 회원과의 메모/소통 기능 (선택 사항)

**운동 프로그램 관리**
- 프로그램 생성 (제목, 기간, 난이도)
- 요일별 세션 설정 (월수금 = Back, 화목 = Leg, etc)
- 운동 정의
  - 운동명, 세트/횟수, 휴식 시간, 설정 중량
  - RPE(Rate of Perceived Exertion) 가이드
  - 운동 영상 링크 추가 가능
- 프로그램 배포 (회원 그룹 또는 개인)
- 기존 프로그램 템플릿 🎯 **MVP에서는 생략 가능**

**식단 가이드 관리**
- 회원별 식단 가이드 생성
- **시간대별 타임슬롯** 기반 구조:
  - 아침(Breakfast), 점심(Lunch), 저녁(Dinner), 간식(Snack)
  - Pre-Workout, Post-Workout (선택)
- 각 타임슬롯별 가이드:
  - 추천 음식 (checkbox list)
  - 목표 영양소 (칼로리, 단백질, 탄수화물, 지방)
  - 가이드 메모
- 회원의 실제 식단 기록과 비교 분석

**성과 리포트 분석**
- 주간 성과 요약
  - 운동 완료율 (계획 대비 실제 이행률)
  - 식단 제출률
  - 평균 RPE 추이
  - 총 부하량(Total Volume) 진행도
- Recharts 기반 차트
  - 주간 운동 완료도 (Bar Chart)
  - 운동 강도 추이 (Line Chart)
  - 식단 제출 현황 (Pie Chart)
- 개인별 리포트 PDF 생성 (선택)

#### Member (회원)
**대시보드**
- 할당된 운동 프로그램 현황
- 이번주 운동 일정 (다음 3일)
- 식단 제출 현황 (이번주 몇 끼 중 몇 끼 제출)
- 주간 성과 스냅샷 (완료율, 평균 강도)

**운동 기록**
- 할당된 세션별 운동 목록 조회
- **운동 기록 입력 폼**:
  - 이전 세트 데이터 **자동 불러오기** (마지막 기록)
  - 각 세트별 입력
    - ✅ 실제 중량 (kg)
    - ✅ 실제 횟수 (reps)
    - ✅ RPE (1-10)
    - ✅ 피드백 (너무 쉬움, 적당함, 너무 어려움)
  - 메모 입력
- 기록 완료 시 자동 저장 + 체크 표시

**식단 기록**
- **일일 식단 기록** (시간슬롯 기반):
  - 아침/점심/저녁/간식 각각 기록
  - 각 식사별:
    - 📸 사진 업로드 (선택)
    - 📝 식사 내용 텍스트
    - 영양소 정보 (수동 입력 또는 추정치)
    - 포만감/만족도 (1-10)
    - 메모 (알레르기, 특이사항)
- **타임슬롯 기반 트레이너 권장사항 표시**
  - "아침 식사: 고단백(30g), 저지방 권장"
  - 실제 제출 데이터와 비교
- 이전 날짜 식단 조회 가능

**성과 보기**
- 주간 완료율
- 주간 운동 강도 추이
- 주간 식단 제출 현황
- 최근 8주 추이 (선택)

**프로필 및 설정**
- 개인 정보 관리
- 트레이너 변경/추가 (선택)
- 알림 설정 (선택)

---

### 2.2 시간대별 식단 관리 (Time-Slot System)

이것이 HABIX의 **차별점**입니다!

#### 구조
```
Diet Guide (트레이너 작성)
├── Breakfast Slot
│   ├── 목표 영양소: 칼로리 500kcal, 단백질 30g, 탄수화물 50g, 지방 15g
│   ├── 추천 음식: [닭가슴살, 계란, 현미밥, ...]
│   └── 가이드 메모: "고단백 아침으로 신진대사 촉진"
├── Lunch Slot
│   └── ...
├── Dinner Slot
│   └── ...
└── Snack Slot
    └── ...

Diet Log (회원 제출)
├── 2026-05-10 Breakfast
│   ├── 사진: IMG_12345.jpg (압축됨)
│   ├── 내용: "달걀 3개, 현미밥 1공기, 시금치"
│   ├── 영양소: 칼로리 480kcal, 단백질 28g, ...
│   └── 만족도: 8/10
├── 2026-05-10 Lunch
│   └── ...
└── ...
```

#### 데이터베이스 구조
- `diet_guides` (1개 = 회원 1명을 위한 전체 식단 프로그램)
- `diet_guide_meals` (각 타임슬롯별 가이드 - 다대다 매핑 용도)
- `diet_logs` (회원의 일일 기록)
- `diet_log_photos` (식단 사진 - Supabase Storage 링크)

---

### 2.3 데이터 기반 운동 루틴 추적

각 운동 세트마다 기록하는 정보:

```typescript
WorkoutLog {
  exerciseName: "Barbell Squat"
  setsCompleted: 3,
  repsPerSet: [8, 8, 7],      // 각 세트의 반복 횟수
  weightPerSet: [100, 100, 100], // 각 세트의 중량 (kg)
  rpePerSet: [8, 8, 9],        // 각 세트의 RPE (지각된 운동 강도)
  totalVolume: 2400,           // 100 * 8 * 3 = 2400 kg
  difficultyFeedback: "just_right",
  notes: "마지막 세트 힘들었음"
}
```

**이전 세트 데이터 자동 불러오기**
- 회원이 "Barbell Squat" 기록 시작 → 시스템이 마지막 기록 자동 조회
- UI에 그레이아웃으로 표시: "지난주: 100kg × 8 × 3"
- 회원이 한 번의 클릭/탭으로 이전 값 적용 가능

---

## 🏗️ 기술 스택

### 3.1 Frontend
| 기술 | 사용 목적 |
|-----|---------|
| **Next.js 14+** | App Router, Server Components, Server Actions |
| **TypeScript** | 타입 안정성 |
| **Tailwind CSS** | Mobile-First Responsive 디자인 |
| **shadcn/ui** | 일관된 UI 컴포넌트 (Radix UI 기반) |
| **TanStack Query v5** | 서버 상태 관리, 캐싱, 좋아하기 |
| **React Hook Form** | 폼 상태 관리 (경량, 성능 중시) |
| **Zod** | 런타임 스키마 검증 |
| **Recharts** | 차트/그래프 시각화 |
| **SWR / Axios** | HTTP 클라이언트 (Server Actions와 혼용) |

### 3.2 Backend / Database
| 기술 | 사용 목적 |
|-----|---------|
| **Supabase** | PostgreSQL DB + Auth + Storage + Realtime |
| **PostgreSQL** | RLS를 통한 자동 데이터 격리 |
| **Row Level Security** | Trainer는 회원만, Member는 자신 데이터만 |

### 3.3 배포 & 호스팅
| 기술 | 사용 목적 |
|-----|---------|
| **Vercel** | Next.js 배포 (자동 CI/CD) |
| **Supabase** | 데이터베이스 호스팅 |

### 3.4 모바일 전환 (Phase 2)
| 기술 | 사용 목적 |
|-----|---------|
| **Capacitor** | React Web → iOS/Android 하이브리드 앱 |
| **Camera Plugin** | 카메라 접근 (식단 사진) |
| **ImageResizer** | 네이티브 이미지 압축 |

---

## 📂 프로젝트 구조 (App Router)

```
habix-fitness/
├── app/
│   ├── layout.tsx                      # Root Layout (Providers)
│   ├── page.tsx                        # Landing / Auto Redirect
│   ├── (auth)/                         # Auth Page Group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (trainer)/                      # Trainer Dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── members/page.tsx
│   │   ├── members/[memberId]/page.tsx
│   │   ├── diet-guides/page.tsx
│   │   ├── diet-guides/new/page.tsx
│   │   ├── diet-guides/[guideId]/page.tsx
│   │   ├── workout-programs/page.tsx
│   │   ├── workout-programs/new/page.tsx
│   │   ├── workout-programs/[programId]/page.tsx
│   │   └── reports/[memberId]/page.tsx
│   ├── (member)/                       # Member Dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── routines/page.tsx
│   │   ├── routines/[sessionId]/workout.tsx
│   │   ├── diet/page.tsx
│   │   ├── diet/[date]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── achievements/page.tsx
│   └── api/                            # Legacy API Routes (필요시)
│       ├── auth/
│       └── upload/
│
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navigation.tsx
│   │   │   ├── SafeArea.tsx           # Capacitor 대응
│   │   │   └── ...
│   │   ├── trainer/                   # Trainer-specific
│   │   │   ├── DietGuideForm.tsx
│   │   │   ├── MealSlotSelector.tsx
│   │   │   ├── WeeklyReportChart.tsx
│   │   │   └── ...
│   │   ├── member/                    # Member-specific
│   │   │   ├── WorkoutForm.tsx
│   │   │   ├── PreviousSetLoader.tsx
│   │   │   ├── DietLogForm.tsx
│   │   │   ├── MealPhotoUploader.tsx
│   │   │   └── ...
│   │   └── ui/                        # shadcn/ui + custom
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Client initialization
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── constants.ts              # Enum, constants
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── services/                     # 비즈니스 로직 레이어
│   │   ├── trainer/
│   │   │   ├── diet.service.ts
│   │   │   ├── program.service.ts
│   │   │   └── report.service.ts
│   │   ├── member/
│   │   │   ├── workout.service.ts
│   │   │   ├── diet.service.ts
│   │   │   └── progress.service.ts
│   │   ├── shared/
│   │   │   ├── image.service.ts      # 이미지 압축 & 업로드
│   │   │   └── storage.service.ts
│   │   └── auth.service.ts
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useMemberList.ts          # TanStack Query
│   │   ├── useWorkoutLog.ts
│   │   ├── useDietLog.ts
│   │   └── useImageUpload.ts
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   │
│   ├── middleware.ts                 # Auth redirects
│   └── styles/
│       └── globals.css               # Tailwind + custom
│
├── public/
├── .env.local                        # 환경 변수
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── eslintrc.json
```

---

## 🎬 Core Features Implementation

### 4.1 Trainer: 식단 가이드 생성

**플로우**
```
1. Trainer Dashboard → "식단 가이드 만들기"
2. 회원 선택
3. 기간 설정 (시작일, 종료일)
4. 각 타임슬롯별 입력
   - 아침: 칼로리 500kcal, 단백질 30g, ...
   - 점심: 칼로리 700kcal, ...
   - ...
5. 저장 → 회원에게 자동 반영
```

**Server Action** (또는 API Route)
```typescript
// app/trainer/diet-guides/actions.ts
export async function createDietGuide(
  memberId: string,
  guideData: CreateDietGuideInput
) {
  // 1. 권한 검증: auth.uid() = trainer_id
  // 2. trainer_member_links 확인
  // 3. diet_guides 생성
  // 4. diet_guide_meals 일괄 생성 (6개 슬롯)
  // 5. 결과 반환
}
```

### 4.2 Member: 운동 기록 (이전 세트 불러오기)

**컴포넌트 흐름**
```
WorkoutForm
├── SessionSelector (어떤 세션?)
├── ExerciseList (이 세션의 운동들)
│   └── ExerciseCard (각 운동)
│       ├── PreviousSetLoader (지난번 기록 보여주기)
│       │   └── "지난주: 100kg × 8 × 3" (클릭하면 자동 입력)
│       └── SetInputForm
│           ├── WeightInput (kg)
│           ├── RepsInput (횟수)
│           ├── RPEInput (1-10)
│           └── FeedbackSelect (too_easy / just_right / too_hard)
└── SubmitButton
```

**TanStack Query Hook**
```typescript
// src/hooks/useWorkoutLog.ts
export function useWorkoutLog(exerciseId: string) {
  // 1. 이전 기록 조회 (캐시: 5분)
  const previousLog = useQuery({
    queryKey: ['workoutLog', exerciseId],
    queryFn: () => workoutService.getPreviousLog(exerciseId),
  });

  // 2. 새 기록 생성 (Optimistic Update)
  const mutation = useMutation({
    mutationFn: (logData) => workoutService.createLog(logData),
    onMutate: (newLog) => {
      // Optimistic UI Update
    },
  });

  return { previousLog, mutation };
}
```

### 4.3 Member: 식단 기록

**플로우**
```
1. Member Dashboard → "오늘의 식단"
2. 시간슬롯 탭 선택 (아침/점심/저녁/간식)
3. 트레이너 권장사항 표시
   "아침: 고단백(30g), 저지방"
4. 각 필드 입력
   - 사진 업로드 (실시간 압축)
   - 식사 내용 텍스트
   - 만족도 (1-10)
5. 저장
```

**이미지 압축 로직** (서비스)
```typescript
// src/services/shared/image.service.ts
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.7
): Promise<Blob> {
  // 1. Canvas API로 압축
  // 2. WEBP 형식으로 변환 (더 작음)
  // 3. Blob 반환
}

export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // 1. 압축 수행
  // 2. Supabase Storage에 업로드
  // 3. Public URL 반환
}
```

### 4.4 Trainer: 주간 성과 리포트 (Recharts)

**차트 구성**
```typescript
// src/components/trainer/WeeklyReportChart.tsx
export function WeeklyReportChart({ memberId, week }) {
  const { data: achievements } = useQuery({
    queryKey: ['achievements', memberId, week],
    queryFn: () => reportService.getWeeklyAchievements(memberId, week),
  });

  return (
    <>
      {/* 운동 완료도 - Bar Chart */}
      <BarChart data={achievements.workoutData}>
        <Bar dataKey="completed" fill="#10b981" />
      </BarChart>

      {/* 운동 강도 추이 - Line Chart */}
      <LineChart data={achievements.rpeData}>
        <Line type="monotone" dataKey="averageRpe" stroke="#3b82f6" />
      </LineChart>

      {/* 식단 제출 현황 - Pie Chart */}
      <PieChart>
        <Pie data={achievements.dietData} />
      </PieChart>
    </>
  );
}
```

---

## 🔐 보안 및 권한 관리

### 5.1 Row Level Security (RLS) 정책

모든 데이터 접근이 **자동으로 필터링**됩니다:

```sql
-- Trainer는 자신의 회원 데이터만 조회 가능
CREATE POLICY "Trainers can view their members' logs"
  ON workout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_member_links
      WHERE trainer_id = auth.uid()
        AND member_id = workout_logs.member_id
    )
  );

-- Member는 자신의 데이터만 조회 가능
CREATE POLICY "Members can view own logs"
  ON workout_logs FOR SELECT
  USING (member_id = auth.uid());
```

### 5.2 Supabase Storage 규칙

```
Bucket: habix-content
├── /users/{user_id}/*       → 본인만 접근
├── /trainers/{trainer_id}/* → 트레이너만 접근
```

---

## 📊 주간 성과 분석 (Achievement Records)

### 6.1 데이터 수집

매일 자정(또는 주 단위)에 **집계 작업** 수행:

```typescript
// 예: Supabase Edge Function (또는 Cron)
export async function aggregateWeeklyAchievements(
  memberId: string,
  week: number
) {
  // 1. 이번주 workout_logs 집계
  //    - 운동 세션 계획 vs 완료
  //    - 평균 RPE
  //    - 총 부하 (Total Volume)

  // 2. 이번주 diet_logs 집계
  //    - 식단 로그 제출 수

  // 3. achievement_records 테이블에 저장
}
```

### 6.2 시각화

트레이너 대시보드에서:
- **주간 바차트**: 월, 화, 수, 목, 금 운동 완료도
- **강도 추이**: RPE 평균값 변화
- **식단 현황**: 아침/점심/저녁별 제출률
- **총 부하 진행도**: 선형 게이지 (목표 대비)

---

## 🚀 MVP vs Beyond

### 7.1 MVP (v1.0) - 필수 기능
- ✅ 회원/트레이너 회가입 및 로그인
- ✅ 운동 프로그램 생성 및 배포
- ✅ 운동 기록 입력 (이전 세트 불러오기)
- ✅ 식단 가이드 생성 (타임슬롯 기반)
- ✅ 식단 기록 입력 (사진 업로드)
- ✅ 주간 성과 대시보드 (기본 차트)
- ✅ RLS 기반 데이터 격리

### 7.2 Phase 2 - 하이브리드 앱
- 🔄 Capacitor 연동
- 📱 Native 카메라/갤러리 통합
- 📲 Push 알림
- 🔔 오프라인 모드 (로컬 캐싱)

### 7.3 Future - AI & Community
- 🤖 AI 코칭 (ChatGPT API)
- 👥 그룹 운동 기능
- 🏆 리더보드 (회원 간 비교 - 익명)
- 📈 고급 분석 리포트

---

## 📋 개발 체크리스트

### 환경 설정
- [ ] Supabase 프로젝트 생성
- [ ] DB 스키마 + RLS 적용
- [ ] Storage 버킷 생성 + 규칙 설정
- [ ] Auth Provider 설정 (Email)

### Frontend 개발
- [ ] Next.js 14 + TypeScript 초기화
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] TanStack Query 설정
- [ ] Authentication Layout
- [ ] Trainer Dashboard
- [ ] Member Dashboard
- [ ] 운동 기록 Form (PreviousSetLoader)
- [ ] 식단 기록 Form (이미지 업로드)
- [ ] 주간 성과 차트

### Backend / DB Logic
- [ ] Server Actions 구현
- [ ] RLS 정책 테스트
- [ ] 이미지 압축 & 업로드
- [ ] 주간 집계 로직

### Testing & QA
- [ ] E2E 테스트 (Playwright)
- [ ] 권한 체크 테스트
- [ ] 이미지 업로드 테스트

### 배포
- [ ] Vercel 배포 설정
- [ ] CI/CD 파이프라인
- [ ] 환경 변수 관리

---

## 📚 참고 링크

- **Supabase Docs**: https://supabase.com/docs
- **Next.js 14 App Router**: https://nextjs.org/docs/app
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **Capacitor Docs**: https://capacitorjs.com/docs

---

**작성**: 10년 차 풀스택 개발자  
**최종 업데이트**: 2026년 5월
