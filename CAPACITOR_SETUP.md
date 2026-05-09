# 📱 Step 4: 모바일/Capacitor 준비 전략

## 🎯 개요

HABIX는 **Phase 1 (Web SaaS)** 이후 **Phase 2 (하이브리드 앱)**로 전환할 준비가 되어 있습니다.  
이 문서는 Capacitor 전환 시 필요한 모든 사항을 정리합니다.

---

## 🏗️ 현재 구조의 장점

### 1. Web Standards 준수
```typescript
// 모든 코드가 표준 Web API 사용
- fetch / axios (HTTP)
- Canvas API (이미지 압축)
- File API (파일 입력/업로드)
- LocalStorage / IndexedDB (데이터 저장)
```

### 2. 반응형 디자인 (Mobile-First)
```css
/* Tailwind CSS Mobile-First */
- xs: 375px (iPhone SE)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
```

### 3. 안전 영역 (Safe Area) 대응
```css
/* CSS Viewport Fit */
@media (max-width: 640px) {
  body {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}
```

### 4. 성능 최적화
- Server Components (Next.js)
- 이미지 압축 (클라이언트 측)
- 지연 로딩 (Lazy Loading)
- 캐싱 (React Query)

---

## 🔄 Capacitor 전환 로드맵

### Phase 1 ✅ (현재) - Web SaaS
```
HABIX Web
├── Next.js 14 (Frontend)
├── Supabase (Backend)
└── Responsive Design
```

### Phase 2 → 하이브리드 앱
```
HABIX App (제목)
├── Capacitor Bridge
├── iOS App (via Xcode)
├── Android App (via Android Studio)
└── 네이티브 기능 (카메라, 저장소)
```

---

## 🛠️ Phase 2 구현 단계

### Step 1: Capacitor 설정

```bash
# 1. Capacitor CLI 설치
npm install -g @capacitor/cli

# 2. Capacitor 초기화
npx cap init

# 프롬프트 입력:
# ? App name: HABIX
# ? App Package ID: com.habix.fitness
# ? Directory: .
# ? Git URL: https://github.com/your/repo

# 3. iOS/Android 플랫폼 추가
npx cap add ios
npx cap add android

# 4. 네이티브 프로젝트 열기 (개발자용)
npx cap open ios   # Xcode로 iOS 프로젝트 열기
npx cap open android  # Android Studio로 안드로이드 프로젝트 열기
```

### Step 2: 플러그인 설치

```bash
# 카메라/갤러리
npm install @capacitor/camera

# 파일 시스템
npm install @capacitor/filesystem

# 네이티브 스토리지
npm install @capacitor/preferences

# 상태 바 커스터마이징
npm install @capacitor/status-bar

# 스플래시 스크린
npm install @capacitor/splash-screen

# 네이티브 다이얼로그
npm install @capacitor/dialog

# 기기 정보
npm install @capacitor/device
```

### Step 3: 코드 구조 변경

#### 이전 (Web)
```typescript
// src/services/shared/image.service.ts
export async function compressAndUploadImage(file: File) {
  // Canvas API로 압축
  const compressed = await compressImage(file);
  
  // Supabase에 업로드
  const result = await uploadImageToStorage(compressed);
  return result;
}
```

#### 이후 (Hybrid App)
```typescript
// src/services/shared/image.service.ts
import { Camera } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export async function capturePhotoFromCamera() {
  // 네이티브 카메라 호출
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri,
  });

  // 네이티브 파일 시스템에 저장
  await Filesystem.writeFile({
    path: `diet/${Date.now()}.jpg`,
    data: image.webPath || '',
    directory: Directory.Documents,
  });

  // 여전히 Supabase에 업로드
  return uploadToSupabase(image.webPath);
}
```

---

## 📸 네이티브 기능 통합

### 1. 카메라 (식단 사진)

```typescript
// src/hooks/useImageCapture.ts
import { Camera, CameraResultType } from '@capacitor/camera';
import { isPlatform } from '@ionic/react';

export function useImageCapture() {
  const capturePhoto = async () => {
    if (isPlatform('hybrid')) {  // 네이티브 앱
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri, // URI로 반환
        source: CameraSource.Camera,  // 카메라 사용
      });
      return image.webPath;
    } else {  // 웹
      // 기존 File Input 사용
      return selectFileFromInput();
    }
  };

  const selectFromGallery = async () => {
    if (isPlatform('hybrid')) {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,  // 갤러리 사용
      });
      return image.webPath;
    } else {
      return selectFileFromInput();
    }
  };

  return { capturePhoto, selectFromGallery };
}
```

### 2. 로컬 스토리지 (오프라인 모드)

```typescript
// src/services/shared/offline.service.ts
import { Preferences } from '@capacitor/preferences';

export async function cacheWorkoutLog(log: WorkoutLog) {
  // 네이티브 스토리지에 저장
  await Preferences.set({
    key: `workout_${log.id}`,
    value: JSON.stringify(log),
  });
}

export async function getPendingLogs() {
  // 미전송 로그 조회
  const keys = await Preferences.keys();
  const pending = keys.keys.filter(k => k.startsWith('workout_'));
  return pending;
}

export async function syncOfflineData() {
  // 동기화: 로컬 → Supabase
  const pending = await getPendingLogs();
  for (const key of pending) {
    const { value } = await Preferences.get({ key });
    const log = JSON.parse(value || '{}');
    
    await workoutService.createWorkoutLog(/* ... */);
    await Preferences.remove({ key });
  }
}
```

### 3. 상태 바 커스터마이징

```typescript
// src/components/shared/SafeArea.tsx
'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isPlatform } from '@ionic/react';

export function SafeArea({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isPlatform('hybrid')) {
      // 상태 바 설정
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      
      // Safe Area 인셋 적용
      document.body.style.paddingTop = 'var(--safe-area-inset-top)';
      document.body.style.paddingBottom = 'var(--safe-area-inset-bottom)';
    }
  }, []);

  return (
    <div className="safe-area-inset">
      {children}
    </div>
  );
}
```

---

## 🔌 Progressive Enhancement 패턴

### 기능별 대응 전략

```typescript
// src/lib/platform.ts
import { isPlatform } from '@ionic/react';
import { Platform } from '@capacitor/core';

export async function isMobileApp(): Promise<boolean> {
  const platform = await Platform.ready();
  return isPlatform('hybrid');
}

export async function getDeviceInfo() {
  if (await isMobileApp()) {
    const { Device } = await import('@capacitor/device');
    return await Device.getInfo();
  }
  return {
    model: `${navigator.userAgent}`,
    platform: navigator.platform,
  };
}

// 사용 예시
export async function initializeApp() {
  const isMobile = await isMobileApp();
  
  if (isMobile) {
    // 네이티브 권한 요청
    await requestCameraPermission();
    await requestStoragePermission();
  }
  
  // 공통 초기화
  await loadUserProfile();
}
```

---

## 📲 UI 최적화

### 1. Bottom Safe Area 처리

```css
/* src/styles/globals.css */
@media (max-width: 640px) and (device-type: mobile) {
  /* 네비게이션 탭이 하단에 있을 때 */
  body {
    padding-bottom: max(
      1rem,
      calc(env(safe-area-inset-bottom) + 70px)  /* 탭 바 높이 */
    );
  }
}
```

### 2. 터치 최적화

```typescript
// src/components/shared/TouchOptimizedButton.tsx
export function TouchOptimizedButton({ children, ...props }: ButtonProps) {
  return (
    <button
      className="min-h-44px min-w-44px"  // 터치 영역: 44×44px (iOS 권장)
      style={{ WebkitTouchCallout: 'none' }}  // iOS 콘텍스트 메뉴 비활성화
      {...props}
    >
      {children}
    </button>
  );
}
```

### 3. 키보드 회피

```typescript
import { Keyboard } from '@capacitor/keyboard';

export function useSoftKeyboardHandling() {
  useEffect(() => {
    if (isPlatform('hybrid')) {
      Keyboard.addListener('keyboardWillShow', () => {
        // 입력창 위로 스크롤
        document.body.classList.add('keyboard-visible');
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-visible');
      });
    }
  }, []);
}
```

---

## 🚀 배포 가이드

### iOS (Apple App Store)

```bash
# 1. 빌드
npm run build
npx cap sync ios

# 2. Xcode에서
# - General: Bundle Identifier 설정
# - Signing & Capabilities: Team ID 설정
# - Archive 생성

# 3. App Store Connect에 제출
# - TestFlight로 베타 테스트
# - App Store 리뷰 대기
# - 승인 후 배포
```

### Android (Google Play Store)

```bash
# 1. 빌드
npm run build
npx cap sync android

# 2. Android Studio에서
# - Build → Generate Signed Bundle/APK
# - Keystore 생성 (최초 1회)

# 3. Google Play Console에 제출
# - Internal Testing 채널로 테스트
# - Production 채널로 배포
```

---

## 📊 성능 최적화

### 1. 번들 크기 감소

```javascript
// next.config.js
export default {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 번들 분석
      config.optimization.splitChunks.cacheGroups = {
        ui: {
          test: /[\\/]src[\\/]components[\\/]ui/,
          name: 'ui',
          priority: 20,
        },
        charts: {
          test: /recharts/,
          name: 'charts',
          priority: 15,
        },
      };
    }
    return config;
  },
};
```

### 2. 이미지 최적화

```typescript
// Capacitor에서 WebP 미지원 시 폴백
export async function compressImageForPlatform(
  file: File
): Promise<Blob> {
  const isApp = await isMobileApp();
  const format = isApp ? 'image/jpeg' : 'image/webp';
  
  return compressImage(file, 1200, 1200, 0.7, format);
}
```

---

## ⚠️ 주의사항

### 1. CORS 설정
```typescript
// Capacitor는 CORS 검사를 우회하지만,
// 보안을 위해 Supabase RLS 정책 필수

// 📌 반드시 RLS를 통한 데이터 격리 유지
```

### 2. 권한 요청
```typescript
// iOS/Android 권한 요청 필수
// - Camera
// - Photo Library
// - Storage
// - Microphone (향후)
```

### 3. 인증서 고정 (Pinning)
```typescript
// 향후 보안 강화를 위해
// SSL/TLS 인증서 고정 구현 권장
```

---

## 📚 유용한 리소스

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [iOS 개발 가이드](https://developer.apple.com)
- [Android 개발 가이드](https://developer.android.com)
- [앱 스토어 가이드라인](https://developer.apple.com/app-store/guidelines/)
- [Google Play 정책](https://play.google.com/about/developer-content-policy/)

---

## 🎯 Phase 2 체크리스트

- [ ] Capacitor 초기 설정 완료
- [ ] 카메라/갤러리 플러그인 통합
- [ ] 오프라인 데이터 저장소 구현
- [ ] Safe Area 대응 완료
- [ ] iOS 빌드 테스트
- [ ] Android 빌드 테스트
- [ ] TestFlight 베타 배포
- [ ] Google Play 베타 배포
- [ ] App Store 심사 제출
- [ ] Google Play 심사 제출
- [ ] 정식 배포

---

**작성**: 10년 차 풀스택 개발자  
**최종 업데이트**: 2026년 5월
