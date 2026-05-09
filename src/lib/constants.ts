// HABIX 상수
export const APP_NAME = 'HABIX';
export const APP_DESCRIPTION = '트레이너-회원 분리형 피트니스 관리 SaaS';

// User Roles
export const USER_ROLES = {
  TRAINER: 'trainer' as const,
  MEMBER: 'member' as const,
};

// 운동 관련 상수
export const WORKOUT_GOALS = {
  STRENGTH: 'strength',
  ENDURANCE: 'endurance',
  HYPERTROPHY: 'hypertrophy',
  FLEXIBILITY: 'flexibility',
} as const;

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const EXERCISE_CATEGORIES = {
  COMPOUND: 'compound',
  ISOLATION: 'isolation',
} as const;

export const DIFFICULTY_FEEDBACK = {
  TOO_EASY: 'too_easy',
  JUST_RIGHT: 'just_right',
  TOO_HARD: 'too_hard',
} as const;

// 시간대별 식단 타임슬롯
export const MEAL_SLOTS = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
  PRE_WORKOUT: 'pre_workout',
  POST_WORKOUT: 'post_workout',
} as const;

export const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: '🌅 아침',
  lunch: '☀️ 점심',
  dinner: '🌙 저녁',
  snack: '🍎 간식',
  pre_workout: '💪 운동전',
  post_workout: '💪 운동후',
};

export const MEAL_SLOTS_ARRAY = Object.entries(MEAL_SLOTS).map(([key, value]) => ({
  key,
  value,
  label: MEAL_SLOT_LABELS[value],
}));

// 요일 (0=월요일, 6=일요일)
export const DAYS_OF_WEEK = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
} as const;

export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// RPE (Rate of Perceived Exertion) Scale
export const RPE_SCALE = [
  { value: 1, label: '1 - 아주 쉬움' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 - 중간 정도' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10 - 최대 강도' },
];

// 성별
export const GENDERS = {
  MALE: 'M',
  FEMALE: 'F',
  OTHER: 'Other',
} as const;

export const GENDER_LABELS: Record<string, string> = {
  M: '남성',
  F: '여성',
  Other: '기타',
};

// 회원 목표
export const MEMBER_GOALS = {
  WEIGHT_LOSS: 'weight_loss',
  MUSCLE_GAIN: 'muscle_gain',
  MAINTENANCE: 'maintenance',
  STRENGTH_GAIN: 'strength_gain',
  ENDURANCE: 'endurance',
} as const;

export const MEMBER_GOAL_LABELS: Record<string, string> = {
  weight_loss: '체중 감량',
  muscle_gain: '근육 증가',
  maintenance: '현상 유지',
  strength_gain: '근력 증가',
  endurance: '지구력 증가',
};

// 페이지 경로
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  
  // Trainer
  TRAINER_DASHBOARD: '/dashboard',
  TRAINER_MEMBERS: '/members',
  TRAINER_MEMBER_DETAIL: (id: string) => `/members/${id}`,
  TRAINER_DIET_GUIDES: '/diet-guides',
  TRAINER_DIET_GUIDE_NEW: '/diet-guides/new',
  TRAINER_DIET_GUIDE_DETAIL: (id: string) => `/diet-guides/${id}`,
  TRAINER_PROGRAMS: '/workout-programs',
  TRAINER_PROGRAM_NEW: '/workout-programs/new',
  TRAINER_PROGRAM_DETAIL: (id: string) => `/workout-programs/${id}`,
  TRAINER_REPORTS: (memberId?: string) => 
    memberId ? `/reports/${memberId}` : '/reports',
  
  // Member
  MEMBER_DASHBOARD: '/dashboard',
  MEMBER_ROUTINES: '/routines',
  MEMBER_ROUTINE_WORKOUT: (sessionId: string) => `/routines/${sessionId}/workout`,
  MEMBER_DIET: '/diet',
  MEMBER_DIET_TODAY: (date: string) => `/diet/${date}`,
  MEMBER_ACHIEVEMENTS: '/achievements',
  MEMBER_SETTINGS: '/settings',
} as const;

// API Routes
export const API_ROUTES = {
  DIET_GUIDES: '/api/diet-guides',
  WORKOUT_LOGS: '/api/workout-logs',
  DIET_LOGS: '/api/diet-logs',
  UPLOAD: '/api/upload',
} as const;

// 이미지 업로드 설정
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.7,
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  TARGET_FORMAT: 'webp' as const,
};

// Supabase Storage
export const STORAGE_BUCKETS = {
  CONTENT: 'habix-content',
  AVATARS: 'avatars',
} as const;

export const STORAGE_PATHS = {
  DIET_PHOTOS: (userId: string, date: string) => 
    `users/${userId}/diet/${date}`,
  AVATARS: (userId: string) => 
    `avatars/${userId}`,
} as const;

// 페이지 크기 (Pagination)
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MEMBERS_LIST_PAGE_SIZE: 10,
  WORKOUT_LOGS_PAGE_SIZE: 50,
  DIET_LOGS_PAGE_SIZE: 30,
} as const;

// 캐시 시간 (React Query staleTime, ms)
export const CACHE_TIME = {
  PROFILE: 1000 * 60 * 10, // 10분
  MEMBERS_LIST: 1000 * 60 * 5, // 5분
  WORKOUT_PROGRAMS: 1000 * 60 * 5, // 5분
  DIET_GUIDES: 1000 * 60 * 5, // 5분
  WORKOUT_LOGS: 1000 * 60 * 3, // 3분
  DIET_LOGS: 1000 * 60 * 3, // 3분
  ACHIEVEMENTS: 1000 * 60 * 10, // 10분
} as const;

// Toasts / Notifications
export const TOAST_MESSAGES = {
  COPIED: '복사되었습니다',
  SAVED: '저장되었습니다',
  DELETED: '삭제되었습니다',
  ERROR: '오류가 발생했습니다',
  UNAUTHORIZED: '권한이 없습니다',
  LOADING: '로딩 중...',
} as const;
