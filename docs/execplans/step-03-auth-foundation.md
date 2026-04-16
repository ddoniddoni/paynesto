# Step 03 Exec Plan: Auth Foundation

## 목표

`step/03-auth-foundation`의 목표는 Paynesto 앱에 실제 제품 흐름으로 이어질 수 있는 인증 기반을 추가하는 것입니다.

이번 step이 끝나면 아래가 가능해야 합니다.

- 이메일/비밀번호 기준 로그인 화면과 회원가입 화면이 준비된다.
- Supabase Auth와 앱 라우팅이 연결되어 세션 복원이 동작한다.
- 인증 여부에 따라 `(auth)`와 `(app)` 진입 경로가 분리된다.
- Supabase 환경 변수가 없거나 인증 요청이 실패해도 앱이 조용히 깨지지 않고 상태를 설명한다.

## 현재 상태

현재 저장소는 Step 2까지 진행된 상태로 보이며, 디자인 시스템과 기본 탭 셸이 정리되어 있습니다.

- `src/app/_layout.tsx`는 바로 탭 셸을 렌더링한다.
- `src/services/supabase/client.ts`에 Supabase 클라이언트 생성 함수는 있지만 auth session provider는 없다.
- `src/app/index.tsx`, `src/app/plans.tsx`는 mock 기반 샘플 화면이다.
- 로그인/회원가입 화면, 세션 복원, 인증 가드는 아직 없다.

추가로 현재 워크트리에는 사용자 변경으로 보이는 삭제 1건이 있으므로, 이번 step에서는 해당 변경을 되돌리거나 정리하지 않는다.

## 가정

- Step 3의 범위는 PRD 기준 인증 구현까지이며, 온보딩 전체 플로우와 프로필 입력은 포함하지 않는다.
- 인증 방식은 우선 이메일/비밀번호 기반으로 시작한다.
- Supabase 프로젝트 설정에 따라 회원가입 직후 이메일 인증이 필요할 수 있으므로, 세션이 즉시 생기지 않는 경우를 정상 흐름으로 처리한다.
- 현재 브랜치 정리와 원격 푸시는 사용자 작업 상태를 건드릴 수 있으므로 이번 구현에서는 자동 수행하지 않는다.
- React Native 환경의 session persistence는 Supabase 공식 React Native 가이드에 맞춰 `@react-native-async-storage/async-storage`와 foreground auto-refresh 전략을 따른다.

## 범위

### 포함

- Step 3 문서 2종 작성
- 인증 feature 폴더 추가
  - auth schema
  - auth service
  - auth session provider / hook
  - auth screen component
- Expo Router 구조 정리
  - `(app)` / `(auth)` route group
  - root redirect
  - 인증 가드
- 로그인 / 회원가입 화면 구현
- 세션 복원 및 auth state 구독
- 로그아웃 액션 연결
- Supabase React Native session persistence 보강
- auth 관련 최소 테스트 추가
- README 상태 갱신

### 제외

- 소셜 로그인
- 비밀번호 재설정
- 프로필 생성/수정
- 온보딩 수입/고정비 입력
- RLS 정책 작성
- 구독 CRUD와 연동된 사용자 데이터 저장

## 구현 단계

### 1. 라우팅과 진입 구조 재정리

- 루트 layout을 Stack 기반으로 바꾸고 기존 탭 셸을 `(app)` group으로 이동한다.
- root index는 auth status를 확인해서 `/(app)` 또는 `/sign-in`으로 보낸다.
- `(auth)` layout은 로그인 전용 진입점, `(app)` layout은 로그인 후 진입점으로 분리한다.

### 2. auth session provider 추가

- Supabase client로 초기 session을 복원한다.
- `onAuthStateChange`를 구독해 로그인/로그아웃 변화를 반영한다.
- 상태를 `loading | authenticated | anonymous | unconfigured | error`로 분리한다.

### 3. React Native용 Supabase auth 보강

- 공식 가이드에 맞춰 URL polyfill과 AsyncStorage를 적용한다.
- non-web 환경에서 AppState와 `startAutoRefresh` / `stopAutoRefresh`를 연결한다.

### 4. 로그인 / 회원가입 화면 구현

- `react-hook-form` + `zod`로 이메일/비밀번호 폼 검증을 구현한다.
- 로딩 / 에러 / 성공 메시지를 명확하게 노출한다.
- 회원가입 후 세션이 즉시 없으면 이메일 확인 안내를 보여준다.

### 5. 앱 화면과 인증 연결

- 홈 화면에서 현재 로그인 사용자 요약과 로그아웃 액션을 보여준다.
- 인증 실패나 환경 변수 누락 시에도 사용자가 현재 상태를 이해할 수 있게 한다.

### 6. 검증 및 문서 반영

- lint / typecheck / test를 실행한다.
- README에 Step 3 상태와 환경 변수/인증 흐름 메모를 반영한다.

## 리스크

### Supabase 환경 변수 미설정

로컬 `.env`가 비어 있으면 인증 요청 자체가 불가능합니다.

대응:

- auth provider에서 `unconfigured` 상태를 분리한다.
- auth 화면에서 원인과 필요한 환경 변수 이름을 명확히 보여준다.

### React Native 세션 저장 누락

React Native에서 적절한 storage 설정 없이 `persistSession`만 켜면 세션 복원이 불안정할 수 있습니다.

대응:

- AsyncStorage를 auth storage로 연결한다.
- Supabase 공식 가이드에 맞춰 foreground auto-refresh도 같이 설정한다.

### 라우팅 구조 변경으로 기존 샘플 화면 회귀

기존 `index` / `plans`가 route group 안으로 이동하면서 탭 진입 경로가 깨질 수 있습니다.

대응:

- `(app)` group으로 화면을 이동한 뒤 root redirect를 명시적으로 둔다.
- 기존 탭 이름은 유지해 NativeTabs와 route name 충돌을 줄인다.

### 테스트 도입 부담

프로젝트에 아직 테스트 러너가 정식 도입되지 않아 Step 3에서 과도한 설정 변경이 생길 수 있습니다.

대응:

- auth schema, error mapping 같은 순수 로직 위주로 최소 테스트를 먼저 추가한다.
- UI/E2E 테스트는 이후 step에서 확장한다.

## 검증 방법

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

가능하면 추가로 아래를 수동 확인합니다.

- 앱 시작 시 세션 유무에 따라 auth/app route가 올바르게 분기되는지
- 회원가입 성공 시 이메일 확인 안내 또는 즉시 로그인 상태가 자연스럽게 보이는지
- 로그아웃 시 다시 로그인 화면으로 돌아가는지
- Supabase 환경 변수가 없을 때 앱이 깨지지 않고 안내 문구를 보여주는지

## 완료 기준

아래 조건을 모두 만족하면 Step 3 완료로 봅니다.

- 로그인 화면과 회원가입 화면이 동작한다.
- 세션 복원과 auth state 구독이 구현되어 있다.
- 인증 전용 경로와 앱 경로가 분리되어 있다.
- 로딩 / 에러 / 미설정 상태가 화면에 드러난다.
- lint / typecheck / test가 통과한다.
