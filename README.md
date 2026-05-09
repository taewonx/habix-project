# HABIX - 트레이너-회원 분리형 피트니스 관리 SaaS

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# Supabase 프로젝트 생성
# 1. https://supabase.com 에서 프로젝트 생성
# 2. 프로젝트 Settings → API 정보 복사

# 환경 변수 설정
cp .env.example .env.local

# .env.local 파일 편집:
# - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY: Anon Key
# - SUPABASE_SERVICE_ROLE_KEY: Service Role Key (선택사항)
```

### 2. 데이터베이스 스키마 적용

```bash
# Supabase 콘솔에서:
# 1. SQL Editor 열기
# 2. 01_schema.sql 파일 내용 복사 & 실행
# 3. 02_rls_policies.sql 파일 내용 복사 & 실행
```

### 3. 프로젝트 초기화

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 에서 열기
```

### 4. Storage 설정 (이미지 업로드)

```bash
# Supabase 콘솔에서:
# 1. Storage → Create new bucket
# 2. Bucket name: "habix-content"
# 3. Public 여부: Private (RLS로 관리)
# 4. Policies 탭에서 RLS 정책 설정

# 정책 예시 (Member 이미지 업로드):
# SELECT: users/{id}/* (본인만 조회)
# INSERT: users/{id}/* (본인만 업로드)
# UPDATE: users/{id}/* (본인만 수정)
# DELETE: users/{id}/* (본인만 삭제)
```

---

## 📂 프로젝트 구조

```
habix-fitness/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # 로그인/회원가입
│   ├── (trainer)/         # 트레이너 대시보드
│   ├── (member)/          # 회원 대시보드
│   └── layout.tsx         # Root Layout
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── shared/       # 공유 컴포넌트
│   │   ├── trainer/      # 트레이너 전용
│   │   ├── member/       # 회원 전용
│   │   └── ui/           # shadcn/ui
│   ├── lib/              # 유틸 함수, 상수
│   ├── services/         # 비즈니스 로직
│   ├── hooks/            # Custom React Hooks
│   ├── types/            # TypeScript 타입
│   └── styles/           # 글로벌 CSS
├── public/               # 정적 파일
├── 01_schema.sql         # DB 스키마
├── 02_rls_policies.sql   # RLS 정책
├── HABIX_기획서.md        # 프로젝트 기획서
└── package.json
```

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript** (타입 안정성)
- **Tailwind CSS** (Mobile-First 디자인)
- **shadcn/ui** (컴포넌트 라이브러리)
- **TanStack Query** (서버 상태 관리)
- **React Hook Form** (폼 관리)
- **Recharts** (차트 시각화)

### Backend / Database
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Row Level Security** (RLS - 데이터 격리)

---

## 📊 핵심 기능

### Trainer (트레이너)
- ✅ 회원 대시보드 관리
- ✅ 운동 프로그램 작성 및 배포
- ✅ 시간대별 식단 가이드 생성
- ✅ 주간 성과 리포트 분석 (차트)
- ✅ 회원별 개별 통계

### Member (회원)
- ✅ 할당된 운동 프로그램 조회
- ✅ 운동 기록 입력 (이전 세트 자동 불러오기)
- ✅ 일일 식단 기록 (사진 업로드 포함)
- ✅ 주간 성과 보기
- ✅ 개인 정보 관리

---

## 🔐 보안

### Row Level Security (RLS)
모든 데이터는 사용자 역할에 따라 **자동으로 필터링**됩니다:
- **Trainer**: 자신의 회원 데이터만 접근 가능
- **Member**: 자신의 데이터만 접근 가능

### 인증
- Supabase Auth (Email/Password)
- Session 자동 관리
- 환경에 따른 권한 검증

---

## 📱 모바일/Capacitor 준비

이 프로젝트는 **Capacitor 전환**을 염두에 두고 설계되었습니다:

### 대응 사항
1. **Safe Area** 인셋 (notch/홈 버튼 처리)
2. **모바일 우선** 반응형 디자인
3. **클라이언트 측 이미지 압축** (데이터 절감)
4. **네이티브 카메라/갤러리 통합** (Capacitor API 준비)

### Phase 2 계획
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

---

## 🧪 테스트 & 배포

### 로컬 테스트
```bash
npm run dev           # 개발 서버
npm run build         # Production 빌드
npm run start         # Production 서버
npm run lint          # 린트 검사
npm run type-check    # 타입 검사
```

### Vercel 배포
```bash
# 방법 1: GitHub 연동 (자동 배포)
# https://vercel.com 에서 GitHub 저장소 연동

# 방법 2: CLI 배포
npm install -g vercel
vercel
```

---

## 📚 문서

- [기획서](./HABIX_기획서.md) - 전체 프로젝트 기획 및 요구사항
- [DB 스키마](./01_schema.sql) - 데이터베이스 구조
- [RLS 정책](./02_rls_policies.sql) - 행 수준 보안 정책
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 🤝 개발 워크플로우

### Feature 추가 절차
1. **Branch 생성**: `git checkout -b feature/feature-name`
2. **코드 작성**: 기능 구현 및 테스트
3. **커밋**: `git commit -m "feat: 기능 설명"`
4. **Push**: `git push origin feature/feature-name`
5. **PR 생성**: Pull Request 작성
6. **Merge**: 리뷰 후 메인 브랜치에 병합

### 코드 스타일
- TypeScript strict mode
- ESLint 규칙 준수
- Prettier 포맷팅
- 컴포넌트 명명: PascalCase
- 유틸 함수: camelCase
- 상수: UPPER_SNAKE_CASE

---

## 🐛 트러블슈팅

### Supabase 연결 실패
```
Error: Missing Supabase environment variables
→ .env.local 파일에서 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 확인
```

### RLS 권한 거부
```
Error: 403 Forbidden
→ Supabase 콘솔에서 RLS 정책 확인 (02_rls_policies.sql 재실행)
```

### 이미지 업로드 실패
```
Error: Storage bucket not found
→ Supabase Storage에서 "habix-content" 버킷 생성 확인
```

---

## 📈 다음 단계 (Roadmap)

### MVP (v1.0) ✅
- 회원/트레이너 회가입
- 운동 프로그램 관리
- 식단 기록 관리
- 기본 차트

### Phase 2 - 하이브리드 앱
- Capacitor 통합
- iOS/Android 앱 배포
- Push 알림
- 오프라인 모드

### Phase 3 - 고급 기능
- AI 코칭 (ChatGPT 연동)
- 그룹 운동 기능
- 리더보드 (회원 간 비교)
- 고급 분석 리포트

---

**작성**: 10년 차 풀스택 개발자  
**최종 업데이트**: 2026년 5월  
**License**: MIT
