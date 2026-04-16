# Step 04 Exec Plan: Subscription Domain

## 목표

`step/04-subscription-domain`의 목표는 Paynesto 앱에 실제 제품에 가까운 구독 관리 흐름을 추가하는 것입니다.

이번 step이 끝나면 아래가 가능해야 합니다.

- `Subscriptions` 탭에서 구독 목록을 볼 수 있다.
- 구독을 생성, 수정, 삭제할 수 있다.
- 구독 상세에서 금액, 결제 주기, 다음 결제일, 체험 상태 같은 핵심 정보를 확인할 수 있다.
- 화면이 로딩 / 빈 상태 / 에러 / 성공 상태를 모두 드러낸다.
- Supabase가 설정된 경우 실제 `subscriptions` 테이블 CRUD를 호출하고, 설정되지 않은 경우에는 로컬 preview 저장소로 흐름을 확인할 수 있다.

## 현재 상태

현재 앱은 Step 3까지 완료된 상태입니다.

- 인증 기반 라우팅과 세션 복원은 준비되어 있다.
- 앱 탭은 아직 `Home`, `Plans` 샘플 화면 중심이다.
- 공용 button / input / card 디자인 시스템은 정리되어 있다.
- 구독 도메인 타입, repository, query hook, form schema는 아직 없다.

## 가정

- Step 4는 PRD 기준 구독 도메인 구현에 집중하며, Money Plan / FX / Premium은 이후 step에서 붙인다.
- Supabase 테이블 이름은 `subscriptions`로 가정한다.
- Supabase가 로컬 환경에서 준비되지 않았더라도 앱 흐름을 확인할 수 있도록 preview 저장소를 둔다.
- preview 저장소는 실제 백엔드 대체가 아니라 개발용 fallback이며, 구조는 Supabase repository와 동일한 계약을 따른다.
- 이번 step에서는 4개 탭 전체 완성보다 `Subscriptions` 도메인 흐름 완성을 우선한다.

## 범위

### 포함

- Step 4 문서 2종 작성
- 공통 도메인 타입 확장
  - subscription category
  - currency
  - billing cycle
  - payment method
  - usage frequency
- subscription feature 추가
  - schema
  - repository contract
  - supabase repository
  - preview repository
  - query / mutation hooks
  - list / detail / form UI
  - domain formatter / calculation helpers
- app tab을 `Subscriptions` 중심으로 정리
- 홈 화면에 최소 구독 요약 연결
- 삭제 확인 플로우와 성공/실패 피드백 추가
- 테스트 추가
  - 정규화 금액 계산
  - 취소 후보 점수
  - 폼 schema

### 제외

- Money Plan 계산 엔진
- 환율 API 실연동
- 구독 분석 대시보드 완성
- 알림 스케줄링
- 프리미엄 가드
- Supabase migration 자동 실행

## 구현 단계

### 1. 도메인 타입과 계산 유틸 정리

- PRD 기준 subscription 엔티티 타입을 앱 공용 타입으로 추가한다.
- 월간 정규화 금액, D-day, 해지 후보 점수 같은 순수 함수를 분리한다.

### 2. 저장소 경계 만들기

- `SubscriptionRepository` 인터페이스를 만든다.
- Supabase configured 여부에 따라 supabase 또는 preview repository를 선택한다.
- 동일한 API 계약으로 query/mutation에서 저장소 구현 세부를 숨긴다.

### 3. query와 화면 상태 정리

- TanStack Query를 써서 목록/상세 조회를 구성한다.
- 생성/수정/삭제 mutation 후 캐시를 일관되게 갱신한다.
- 로딩/에러/빈 상태를 공통 state 컴포넌트나 section card 기반으로 보여준다.

### 4. 라우팅과 화면 구현

- `Subscriptions` 탭 진입 화면을 목록 화면으로 교체한다.
- `create`, `[subscriptionId]`, `[subscriptionId]/edit` 라우트를 추가한다.
- 하나의 폼 화면 컴포넌트를 create/edit에서 재사용한다.

### 5. 홈 화면 최소 연결

- 홈에서 전체 구독 수, 다음 결제 예정, 월간 정규화 총액 같은 최소 요약을 보여준다.
- 상세 분석은 Step 6+에서 확장 가능한 구조로 남긴다.

### 6. 검증

- lint / typecheck / test를 실행한다.
- create / edit / delete / empty state / unconfigured preview mode를 수동 확인한다.

## 리스크

### Supabase 미설정 상태에서 기능 막힘

인증은 준비됐지만 Supabase table이 아직 없거나 env가 없을 수 있습니다.

대응:

- preview repository를 기본 fallback으로 둔다.
- 화면에서 preview mode 여부를 설명한다.

### Step 4에서 UI와 데이터 경계가 뒤섞일 위험

폼 로직, 계산 로직, Supabase 호출이 화면 안으로 들어가면 이후 Money Plan / FX 단계에서 유지보수가 어려워집니다.

대응:

- schema, repository, hook, utils를 feature 폴더로 분리한다.
- screen은 상태 조립과 레이아웃에 집중시킨다.

### delete UX가 너무 거칠어질 위험

React Native 기본 confirm 흐름을 안 넣으면 실수 삭제 가능성이 있습니다.

대응:

- 삭제 전 Alert 확인 절차를 넣는다.
- 성공/실패 메시지를 명확히 보여준다.

## 검증 방법

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`

추가 수동 확인:

- Subscriptions 탭 첫 진입 시 loading -> success / empty / error 분기
- 신규 구독 생성 후 목록에 즉시 반영되는지
- 상세 화면에서 편집/삭제가 가능한지
- Supabase 미설정 상태에서도 preview mode로 CRUD 흐름이 유지되는지

## 완료 기준

- 구독 목록 / 상세 / 생성 / 수정 / 삭제가 모두 동작한다.
- 관련 화면에 loading / empty / error / success 상태가 있다.
- 구독 도메인 로직이 UI 밖에 분리되어 있다.
- 관련 테스트와 검증이 통과한다.
