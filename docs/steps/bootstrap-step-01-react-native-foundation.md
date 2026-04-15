# Bootstrap Step 01: React Native Foundation

## Step 정보

- Step 번호: `01`
- 브랜치 이름: `step/01-bootstrap-react-native-foundation`
- 권장 커밋 타입: `chore(repo)` 또는 `docs(planning)`

## Step 목적

현재 Expo 스타터를 PRD 기준의 실제 제품 개발 출발점으로 정렬합니다.

이번 step에서는 "기능 완성"보다 아래 기반을 만드는 데 집중합니다.

- 핵심 라이브러리 준비
- 앱 provider 구조 준비
- 최소 feature-based 구조 준비
- Supabase 연동 시작점 준비
- 표준 검증 명령 준비

## 작업 체크리스트

### 1. 문서 준비

- [x] `docs/execplans/step-01-react-native-foundation.md` 작성
- [x] `docs/steps/bootstrap-step-01-react-native-foundation.md` 작성
- [x] 범위와 제외 범위를 PRD Step 1과 맞춘다

### 2. 의존성 정리

- [x] `@tanstack/react-query` 추가
- [x] `zustand` 추가
- [x] `@supabase/supabase-js` 추가
- [x] `react-hook-form` 추가
- [x] `zod` 추가
- [x] `@hookform/resolvers` 추가
- [x] `date-fns` 추가

### 3. 스크립트 정리

- [x] `package.json`에 `typecheck` 추가
- [x] 현재 step에서는 `test` 스크립트 도입을 보류하고 README에 이유를 기록
- [x] 기존 `lint`, `start`, `android`, `ios`, `web` 스크립트와 충돌 없는지 확인

### 4. 앱 provider 구조 추가

- [x] `src/app/providers` 생성
- [x] Query Client 생성 코드 추가
- [x] 루트 레이아웃에서 provider 연결
- [x] 이후 auth/session provider가 자연스럽게 들어갈 수 있게 구조 정리

### 5. 폴더 구조 초깃값 추가

- [x] `src/features/` 생성
- [x] `src/lib/` 생성
- [x] `src/services/` 생성
- [x] `src/components/shared/` 생성
- [x] 현재 존재하는 `src/components/ui`, `src/mocks`, `src/types`와 역할 충돌 없도록 최소 기반만 추가

### 6. Supabase 준비 코드 추가

- [x] env 접근 코드 초안 추가
- [x] Supabase client 초기화 파일 추가
- [x] 키가 없을 때의 개발 경험 정의
- [x] 시크릿이 Git에 들어가지 않도록 경계 확인

### 7. 문서 보강

- [x] README에 현재 프로젝트 목적과 실행 방법 정리
- [x] 필요한 환경 변수 이름만 문서화
- [x] 현재는 mock 기반 화면이 포함되어 있다는 점 명시

### 8. 검증

- [x] `npm.cmd run lint`
- [x] `npm.cmd run typecheck`
- [ ] `npm.cmd run start`
- [x] `start`는 장시간 대기 프로세스라 이번 step에서는 생략하고 정적 검증 위주로 마무리

## 제안 구현 순서

1. 의존성 및 스크립트 정리
2. provider 구조 추가
3. 폴더 구조 초깃값 생성
4. Supabase/env 경계 추가
5. 문서 정리
6. lint/typecheck 실행

## 예상 변경 파일

- `package.json`
- `package-lock.json`
- `README.md`
- `src/app/_layout.tsx`
- `src/app/providers/*`
- `src/lib/*`
- `src/services/supabase/*`
- 필요 시 `src/features/.gitkeep` 성격의 초기 파일

## 이번 step의 비범위

- 인증 화면 구현
- 실제 Supabase CRUD
- 구독 도메인 구현
- 예산 추천 엔진 구현
- 환율 API 연동 구현
- 프리미엄 결제 구현

## 완료 판단 질문

아래 질문에 모두 "예"라고 답할 수 있으면 Step 1을 완료로 봅니다.

- 다음 step에서 인증 구현을 시작할 수 있는가?
- Query, store, backend 연동을 붙일 자리가 명확한가?
- 시크릿 없이도 안전하게 커밋 가능한 상태인가?
- lint/typecheck 기준이 팀 공통 기준으로 작동하는가?

## 메모

- 현재 저장소에는 이미 Expo Router와 기초 UI 셸이 있으므로, Step 1은 "새 앱 생성"이 아니라 "제품 개발용 기반 정렬"로 해석합니다.
- 현재 `Home`과 `Plans` 화면은 이후 실제 도메인 화면으로 교체될 수 있는 임시 scaffold로 유지합니다.
