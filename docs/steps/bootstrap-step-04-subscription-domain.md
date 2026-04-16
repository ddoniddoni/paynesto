# Bootstrap Step 04: Subscription Domain

## Step 정보

- Step 번호: `04`
- 브랜치 이름: `step/04-subscription-domain`
- 권장 커밋 타입: `feat(subscriptions)`

## Step 목적

Paynesto의 핵심 도메인인 구독 관리 흐름을 실제 제품 수준의 구조로 추가합니다.

이번 step에서는 아래를 우선합니다.

- `Subscriptions` 탭
- 구독 목록 / 상세 / 생성 / 수정 / 삭제
- repository + query 경계
- Supabase / preview mode 분리

## 작업 체크리스트

### 1. 문서 준비

- [x] `docs/execplans/step-04-subscription-domain.md` 작성
- [x] `docs/steps/bootstrap-step-04-subscription-domain.md` 작성

### 2. 도메인 타입

- [x] subscription enum / type 정리
- [x] PRD 기준 필드 구조 반영
- [x] formatter / calculation util 추가

### 3. 데이터 레이어

- [x] repository contract 추가
- [x] Supabase repository 추가
- [x] preview repository 추가
- [x] query / mutation hook 추가

### 4. 화면 및 라우팅

- [x] `Subscriptions` 탭 연결
- [x] 목록 화면 구현
- [x] 생성 화면 구현
- [x] 상세 화면 구현
- [x] 수정 화면 구현
- [x] 삭제 확인 구현

### 5. 앱 연결

- [x] 홈 요약에 구독 데이터 일부 연결
- [x] 기존 plans 샘플 의존 제거
- [x] preview mode 문구 노출

### 6. 테스트 및 검증

- [x] schema 테스트 추가
- [x] domain util 테스트 추가
- [x] `npm.cmd run lint`
- [x] `npm.cmd run typecheck`
- [x] `npm.cmd run test`

## 예상 변경 파일

- `src/types/domain.ts`
- `src/components/app-tabs*.tsx`
- `src/app/(app)/*`
- `src/features/subscriptions/**/*`
- `tests/subscriptions/*`
- `README.md`

## 이번 step의 비범위

- Money Plan
- FX estimate 실연동
- 알림 예약
- 프리미엄 결제
- Supabase migration 운영 반영

## 완료 전 확인 질문

- 구독이 없을 때도 화면이 이해 가능하게 비어 있음 상태를 보여주는가?
- Supabase 환경이 없을 때도 preview mode로 흐름이 유지되는가?
- 삭제 액션에 확인 절차가 있는가?
- 목록/상세/폼이 이후 Money Plan과 Home 요약에서 재사용 가능한 구조인가?
