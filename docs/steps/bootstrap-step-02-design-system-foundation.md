# Bootstrap Step 02: Design System Foundation

## Step 정보

- Step 번호: `02`
- 브랜치 이름: `step/02-design-system-foundation`
- 권장 커밋 타입: `feat(ui)` 또는 `refactor(ui)`

## Step 목적

PRD Step 2에 맞춰 공통 디자인 시스템을 제품 기준으로 정리합니다.

이번 step에서는 아래를 중심으로 작업합니다.

- theme token 정리
- spacing / typography 규칙 명확화
- 재사용 가능한 card / button / input 컴포넌트 구축
- 기존 샘플 화면 일부를 공통 레이어로 정리

## 작업 체크리스트

### 1. 문서 준비

- [x] `docs/execplans/step-02-design-system-foundation.md` 작성
- [x] `docs/steps/bootstrap-step-02-design-system-foundation.md` 작성
- [x] 범위와 제외 범위를 PRD Step 2와 맞춘다

### 2. theme token 정리

- [x] `src/constants/theme.ts` 역할 재정리
- [x] semantic color token 확장
- [x] spacing scale 유지
- [x] radius / border / state token 추가

### 3. typography 정리

- [x] `ThemedText` variant 체계 정리
- [x] heading / body / label / caption 역할 구분
- [x] 한국어 UI 가독성 관점에서 size / line-height 점검

### 4. 공통 컴포넌트 구축

- [x] `Card` 공통 컴포넌트 정의
- [x] 기존 `SectionCard`와 통합
- [x] `Button` 공통 컴포넌트 추가
- [x] `Input` 공통 컴포넌트 추가
- [x] pressed / disabled / error / helper text 상태 정의

### 5. 샘플 화면 적용

- [x] `Home`과 `Plans` 화면에 새 컴포넌트 적용
- [x] 반복 스타일을 공통 레이어로 이동
- [x] ad-hoc style 감소 여부 확인

### 6. 문서 보강

- [x] README에 디자인 시스템 진행 상태 반영
- [x] 이후 feature 화면에서 따라야 할 기준을 step 문서에 유지

### 7. 검증

- [x] `npm.cmd run lint`
- [x] `npm.cmd run typecheck`
- [ ] 가능하면 `npm.cmd run start`
- [x] `start`는 장시간 대기 프로세스라 이번 step에서는 정적 검증 위주로 마무리

## 제안 구현 순서

1. theme token 정리
2. typography 체계 정리
3. Card/Button/Input 구축
4. 기존 화면 일부 적용
5. 문서 보강
6. lint/typecheck 검증

## 예상 변경 파일

- `src/constants/theme.ts`
- `src/components/themed-text.tsx`
- `src/components/themed-view.tsx`
- `src/components/ui/*`
- `src/app/index.tsx`
- `src/app/plans.tsx`
- 필요 시 `README.md`

## 이번 step의 비범위

- 인증 화면 완성
- 실제 폼 제출/검증 흐름 완성
- 도메인 기능 구현
- Supabase 연동
- 알림 또는 프리미엄 구현

## 완료 판단 질문

아래 질문에 모두 "예"라고 답할 수 있으면 Step 2를 완료로 봅니다.

- 공통 토큰과 typography 기준이 실제 화면에서 재사용 가능한가?
- Button/Input이 다음 step의 인증 화면에 바로 쓸 수 있는 수준인가?
- 기존 화면 스타일이 공통 레이어 쪽으로 이동했는가?
- lint/typecheck를 유지하는가?

## 메모

- Step 규칙상 실제 구현은 Step 1이 `develop`에 머지된 뒤 새 브랜치에서 시작하는 것이 원칙입니다.
- 이번 문서는 그 다음 작업을 바로 시작할 수 있도록 현재 코드 기준으로 먼저 준비한 계획 문서입니다.
