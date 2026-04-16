# Bootstrap Step 03: Auth Foundation

## Step 정보

- Step 번호: `03`
- 브랜치 이름: `step/03-auth-foundation`
- 권장 커밋 타입: `feat(auth)`

## Step 목적

Paynesto의 첫 실제 사용자 흐름인 인증 기반을 추가합니다.

이번 step에서는 아래를 우선합니다.

- Supabase Auth 연결
- 세션 복원
- 로그인 / 회원가입 화면
- auth route와 app route 분리

## 작업 체크리스트

### 1. 문서 준비

- [x] `docs/execplans/step-03-auth-foundation.md` 작성
- [x] `docs/steps/bootstrap-step-03-auth-foundation.md` 작성
- [x] 현재 워크트리 사용자 변경을 건드리지 않는 가정 명시

### 2. Supabase auth 기반 보강

- [x] React Native auth storage 설정
- [x] AppState 기반 auto-refresh 연결
- [x] auth service 레이어 추가

### 3. 인증 상태 관리

- [x] auth session provider 추가
- [x] 초기 세션 복원 구현
- [x] `onAuthStateChange` 구독 구현
- [x] auth status enum 수준 상태 분리

### 4. 라우팅 구조 정리

- [x] 루트 layout을 Stack 중심으로 정리
- [x] `(auth)` / `(app)` group 추가
- [x] root redirect 추가
- [x] 보호된 앱 영역 가드 추가

### 5. 화면 구현

- [x] 로그인 화면 구현
- [x] 회원가입 화면 구현
- [x] 입력 검증 추가
- [x] 로딩 / 에러 / 성공 / 미설정 상태 노출
- [x] 로그아웃 액션 연결

### 6. 테스트 및 문서

- [x] auth 순수 로직 테스트 추가
- [x] README 상태 업데이트
- [x] `npm.cmd run lint`
- [x] `npm.cmd run typecheck`
- [x] `npm.cmd run test`

## 예상 변경 파일

- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/app/(app)/*`
- `src/app/(auth)/*`
- `src/app/providers/app-providers.tsx`
- `src/features/auth/**/*`
- `src/services/supabase/client.ts`
- `tests/auth/*`
- `README.md`

## 이번 step의 비범위

- 구독 CRUD
- 온보딩 수입/고정비 입력
- 비밀번호 재설정
- 소셜 로그인
- 프로필 편집

## 완료 전 확인 질문

- 인증되지 않은 사용자가 앱 탭 영역에 바로 들어가지 않는가?
- Supabase 환경 변수가 없을 때도 앱이 안내 가능한 상태로 남는가?
- 로그인/회원가입 폼이 한국어 UX로 이해 가능하게 정리됐는가?
- 세션 복원이 앱 재실행 시에도 이어질 준비가 되었는가?
