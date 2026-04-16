# 구독 및 월급 기반 머니 플래너 앱
## Codex 개발용 PRD (React Native + Supabase 버전)

## 1. 문서 목적

이 문서는 Codex를 위한 제품 요구사항 문서(PRD)이자 구현 가이드입니다.

목표는 사용자가 다음을 할 수 있도록 돕는 모바일 앱을 만드는 것입니다.

1. 반복 구독 관리
2. 월급 기준으로 지출 이해
3. 실시간 환율을 이용해 USD 구독의 원화 결제 예상 금액 예측

이 문서는 Codex가 아래 작업을 수행할 수 있을 만큼 충분히 상세해야 합니다.

- 프로젝트 구조 초기화
- 화면 및 플로우 구현
- 데이터 모델 설계
- 서비스 레이어 구축
- 환율 기반 예측 로직 구현
- App Store / Google Play 인앱 구독 준비

---

## 2. 제품 요약

다음을 결합한 모바일 앱입니다.

- **구독 관리**
- **급여 기반 예산 추천**
- **외화 구독 결제의 KRW 예상 금액 예측**

주요 타깃 시장:

- 한국 사용자
- 급여 생활자
- 디지털 구독이 많은 사용자
- KRW와 USD 구독 서비스를 함께 결제하는 사용자

---

## 3. 핵심 제품 가치

### 3.1 사용자 문제
사용자는 종종 다음과 같은 문제를 겪습니다.

- 반복 구독을 놓치기 쉽다
- 월간 총 구독비를 과소평가한다
- 무료 체험 종료일을 잊는다
- 월급 대비 구독 지출이 적절한지 알기 어렵다
- USD로 결제되는 구독의 다음 청구일 실제 KRW 금액을 알기 어렵다

### 3.2 제품 해결책
이 앱은 다음을 통해 문제를 해결합니다.

1. **구독 관리 탭**
2. **급여 기반 머니 플랜 탭**
3. **외화 결제 예측 시스템**

---

## 4. 제품 목표

### 4.1 사용자 목표
- 모든 반복 구독을 한 곳에서 볼 수 있게 한다.
- 월간/연간 구독 부담을 이해할 수 있게 한다.
- 순월소득 대비 구독 지출을 비교할 수 있게 한다.
- 현재 환율 데이터를 사용해 USD 구독의 예상 KRW 결제 금액을 예측한다.
- 불필요한 반복 지출을 줄이는 데 도움을 준다.

### 4.2 비즈니스 목표
- App Store와 Google Play 모두에 출시한다.
- 프리미엄(Freemium) 모델로 운영한다.
- 무료 사용자를 프리미엄 구독자로 전환한다.
- 알림과 실질적인 머니 인사이트를 통해 리텐션을 높인다.

---

## 5. 플랫폼 및 기술 방향

### 5.1 플랫폼
- iOS
- Android

### 5.2 프론트엔드 스택
- React Native
- TypeScript

### 5.3 추천 앱 프레임워크
다음 중 하나를 사용합니다.

- **React Native CLI**: 네이티브 제어가 가장 많이 필요할 때
- **Expo (prebuild 또는 managed + config plugins)**: 빠른 MVP 개발이 필요할 때

### 최종 권장안
사용 기술:

- **React Native + TypeScript**
- **Expo Router** 또는 **React Navigation**
- **React Query / TanStack Query**
- **Zustand** (가벼운 전역 상태 관리)
- **Supabase**

### MVP용 최종 백엔드
사용 기술:

- **Supabase Auth**
- **PostgreSQL**
- **Row Level Security (RLS)**
- **Edge Functions**
- **Expo Notifications** 또는 **OneSignal**
- **Supabase Realtime** (필요 시)
- **Supabase Storage** (향후 영수증/첨부 저장용)

### Supabase를 선택하는 이유
- 인증, DB, API를 한 번에 구성하기 쉽다
- PostgreSQL 기반이라 데이터 모델 확장성이 좋다
- Edge Functions로 환율 조회 같은 서버 로직을 분리하기 좋다
- RLS로 사용자별 데이터 접근 제어를 명확하게 설계할 수 있다
- Firebase보다 SQL 기반 분석과 리포트 구현이 유리하다

---

## 6. 정보 구조(IA)

권장 하단 탭 구조:

1. Home
2. Subscriptions
3. Money Plan
4. My Page

### 6.1 Home
표시 내용:

- 월간 총 구독비
- 연간 총 구독비
- 다음 결제일
- USD 구독 KRW 예측 요약
- 월급 대비 구독 비율
- 해지 추천 같은 액션 카드

### 6.2 Subscriptions
표시 내용:

- 구독 목록
- 생성/수정/삭제 플로우
- 카테고리 필터
- 청구 일정 정보
- 외화 결제 여부

### 6.3 Money Plan
표시 내용:

- 순월급
- 고정비
- 추천 저축액
- 추천 구독 예산
- 지출 건강 점수
- 절약/지출 감축 추천

### 6.4 My Page
표시 내용:

- 프로필
- 프리미엄 플랜
- 알림 설정
- 이용약관
- 개인정보처리방침
- 고객지원

---

## 7. 주요 사용자 플로우

### 7.1 온보딩
1. 앱 소개
2. 회원가입 / 로그인 / 게스트 시작
3. 순월소득 입력
4. 고정비 입력
5. 구독 추가
6. 초기 분석 결과 확인

### 7.2 일상 사용
1. 홈 대시보드 열기
2. 월간 총액 확인
3. 다음 결제일 확인
4. USD 구독 KRW 예측 확인
5. 예산 추천 확인
6. 해지 추천 확인

### 7.3 프리미엄 전환
1. 사용자가 무료 제한에 걸리거나 프리미엄 기능을 탭함
2. 페이월 노출
3. 월간/연간 플랜 옵션 표시
4. 인앱 결제 완료
5. 프리미엄 기능 잠금 해제

---

## 8. 기능 범위

# 8.1 구독 관리

## 8.1.1 구독 생성/수정
각 구독은 아래 필드를 가져야 합니다.

- `serviceName`
- `category`
- `billingCycle` (`monthly` | `yearly`)
- `amount`
- `currency` (`KRW` | `USD`)
- `paymentMethodType` (`app_store` | `play_store` | `card` | `paypal` | `other`)
- `nextBillingDate`
- `isTrial`
- `trialEndDate`
- `usageFrequency` (`high` | `medium` | `low`)
- `note`
- `isActive`

### 카테고리
- OTT
- Music
- Shopping
- Productivity
- Cloud
- Education
- AI
- Gaming
- Others

### 요구사항
- 결제 주기가 yearly이면 monthly 기준 금액으로 환산해서 보여준다.
- 통화가 USD이면 다음을 보여준다.
  - 원래 USD 금액
  - 현재 KRW 예상 금액
  - 최근 환율 기준값

---

## 8.1.2 구독 목록
각 행/카드는 다음을 표시해야 합니다.

- 서비스명
- 원래 금액 + 통화
- 월 기준 정규화된 KRW 금액
- 다음 결제일
- 체험판 여부
- 카테고리
- 사용 빈도
- 외화 결제 배지(해당 시)

### 정렬
- 다음 결제일 순
- 최고 비용 순
- 최근 추가 순
- 해지 점수 순

### 필터링
- 전체
- 카테고리
- KRW만
- USD만
- 체험판만
- 해지 후보만

---

## 8.1.3 구독 분석
제공 내용:

- 총 월간 구독비(KRW)
- 총 연간 구독 부담(KRW)
- 가장 비싼 구독
- 사용 빈도가 낮은 구독
- 체험 종료 예정 개수
- 월급 대비 구독 비율
- USD 노출 금액
- 다음 결제 예상 총액(KRW)

---

## 8.1.4 알림 기능
알림은 다음을 지원해야 합니다.

- 결제 3일 전
- 결제 1일 전
- 체험 종료 알림
- 월간 요약 알림
- 저사용 구독 점검 알림
- USD 구독 환율 변동 알림(프리미엄)

### 환율 알림 예시
현재 KRW 예상 금액이 이전 저장값과 비교해 유의미하게 달라졌다면 알림:

- "환율 변동으로 인해 이번 달 예정된 USD 구독 결제 금액이 더 높아질 수 있어요."

---

# 8.2 급여 기반 머니 플래닝

## 8.2.1 재무 입력
사용자가 입력할 수 있는 값:

- `netMonthlyIncome`
- `rentCost`
- `telecomCost`
- `insuranceCost`
- `transportCost`
- `otherFixedCost`
- `savingsGoal`
- `hasDebt`

구독 데이터는 자동으로 플랜에 연결됩니다.

## 8.2.2 예산 추천 엔진
MVP는 규칙 기반 추천 엔진을 사용합니다.

입력값:

- 월급
- 고정비
- 총 월간 구독비
- 부채 여부
- 저축 목표

출력값:

- 추천 저축액
- 추천 생활비
- 고정비 경고
- 추천 구독 예산 한도
- 현재 상태
- 액션 추천

## 8.2.3 예시 규칙

### 월급 대비 구독 비율
- 0% ~ 3%: healthy
- 3% 초과 ~ 5%: warning
- 5% 초과: over

### 월급 대비 고정비 부담
- 35% 미만: healthy
- 35% ~ 50%: caution
- 50% 초과: high burden

### 추천 예산 모델
기본 모델:

- 저축: 20%
- 유동 지출: 30% ~ 40%
- 구독/여가: 5% ~ 10%
- 고정비: 실제 입력값
- 비상금/기타: 남은 잔액

### 가이드 문구 예시
- "현재 구독 지출은 월급 대비 건강한 수준입니다."
- "월급 대비 고정비 비중이 높습니다."
- "이번 달에는 구독 지출을 20,000원 줄여보세요."
- "현재 소득 수준에서는 월 구독 지출을 90,000원 이하로 유지하는 것이 좋습니다."

---

# 8.3 환율 예측 시스템

## 8.3.1 목적
일부 구독은 USD로 청구됩니다.
한국 사용자들은 다음 결제일에 원화로 얼마가 청구될지 알고 싶어 합니다.

시스템은 다음을 수행해야 합니다.

- 현재 USD/KRW 환율 조회
- 각 USD 구독의 KRW 예상 금액 계산
- 외화 구독 부담 총액 집계
- 비교를 위한 최근 스냅샷 저장
- KRW 예상 금액이 크게 오르면 사용자에게 알림

## 8.3.2 기능 요구사항
`currency = USD` 인 구독에 대해:

- 실시간 또는 준실시간 USD/KRW 환율 조회
- `estimatedKRWAmount` 계산
- UI에 "현재 예상 금액" 표시
- 사용한 환율과 시각 저장
- 이전 예상값과 비교
- 모든 USD 구독에 대한 대시보드 요약 지원

## 8.3.3 데이터 소스 전략
환율 제공 API를 사용합니다.

권장 아키텍처:

- API 키/시크릿이 필요한 경우 앱 클라이언트에서 직접 외부 환율 API를 호출하지 않음
- 대신 다음을 사용:
  - Supabase Edge Function
  - 커스텀 서버 엔드포인트

서버 측 함수의 책임:

- 최신 USD/KRW 환율 조회
- 응답 검증
- 결과 캐싱
- 모바일 앱에 정제된 응답 반환

## 8.3.4 환율 갱신 정책
권장 방식:

- 앱 실행 시 stale이면 갱신
- 구독 상세 페이지 진입 시 stale이면 갱신
- 서버에서 일 단위 스케줄 갱신
- 캐시 TTL: 제공자 정책에 따라 6 ~ 24시간

## 8.3.5 예상 결제 금액 공식
월간 구독이면:

- `estimatedKRWAmount = usdAmount * usdKrwRate`

연간 구독이면:

- 결제 시점의 `estimatedKRWAmount`
- `normalizedMonthlyKRWAmount = (usdAmount * usdKrwRate) / 12`

## 8.3.6 선택적 버퍼 로직
실제 카드 청구 금액은 카드사 스프레드, 수수료, 정산 시점에 따라 조금 달라질 수 있으므로 앱은 다음을 표시할 수 있습니다.

- 기본 추정값
- 추정 범위

예시:

- 기본 추정값: 13,620원
- 예상 범위: 13,620원 ~ 13,950원

권장 버퍼:
- 1% ~ 3% 설정 가능

## 8.3.7 변동성 로직
이전 저장된 예상값이 있다면:

- 현재 예상 KRW와 이전 예상 KRW 비교
- 변화폭이 기준값(예: 3% 또는 5%)을 넘으면 큰 변동으로 표시

예시 상태:

- stable
- slight increase
- significant increase
- decrease

## 8.3.8 UI 요구사항
USD 구독에 대해 다음을 표시:

- `$9.99` 같은 USD 금액
- `약 13,700원` 같은 예상 KRW
- `1 USD = 1,372 KRW` 같은 환율 기준
- `updated 2026-04-16 09:00` 같은 업데이트 시각
- 변동성 표시기

## 8.3.9 UX 문구 예시
- "현재 KRW 예상 금액"
- "오늘 환율이 업데이트되었어요"
- "실제 청구 금액은 카드사 수수료 등에 따라 약간 달라질 수 있어요"
- "다음 USD 구독 결제 금액은 약 13,700원으로 예상돼요"

---

## 9. 수익화 모델

### 9.1 프리미엄(Freemium) 모델

#### 무료
- 최대 5개 구독
- 기본 대시보드
- 기본 급여 기반 추천
- 기본 결제 알림
- 기본 USD/KRW 현재 예상 금액

#### 프리미엄
- 무제한 구독
- 고급 분석
- 해지 추천
- 프리미엄 알림 옵션
- 환율 변동 알림
- 예상 금액 히스토리 추적
- 고급 리포트
- 멀티디바이스 동기화 개선

### 9.2 권장 가격
- 월간: 4,900원
- 연간: 39,000원 ~ 49,000원

### 9.3 향후 수익화
- 일회성 고급 리포트
- 제휴 파트너십
- 금융 관련 추천 파트너십
- 가족/공유 플랜 기능

---

## 10. 데이터 모델

아래 모든 모델은 TypeScript로 구현하고 Supabase PostgreSQL 테이블 또는 동등한 백엔드 저장소에 반영해야 합니다.

### 10.1 User
```ts
export type User = {
  id: string;
  email: string;
  displayName?: string;
  locale: "ko-KR" | "en-US";
  preferredCurrency: "KRW";
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 10.2 UserFinancialProfile
```ts
export type UserFinancialProfile = {
  id: string;
  userId: string;
  netMonthlyIncome: number;
  rentCost?: number;
  telecomCost?: number;
  insuranceCost?: number;
  transportCost?: number;
  otherFixedCost?: number;
  savingsGoal?: number;
  hasDebt?: boolean;
  updatedAt: string;
};
```

### 10.3 Subscription
```ts
export type Subscription = {
  id: string;
  userId: string;
  serviceName: string;
  category:
    | "OTT"
    | "Music"
    | "Shopping"
    | "Productivity"
    | "Cloud"
    | "Education"
    | "AI"
    | "Gaming"
    | "Others";
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency: "KRW" | "USD";
  paymentMethodType: "app_store" | "play_store" | "card" | "paypal" | "other";
  nextBillingDate: string;
  isTrial: boolean;
  trialEndDate?: string;
  usageFrequency: "high" | "medium" | "low";
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 10.4 ExchangeRateSnapshot
```ts
export type ExchangeRateSnapshot = {
  id: string;
  baseCurrency: "USD";
  quoteCurrency: "KRW";
  rate: number;
  source: string;
  fetchedAt: string;
  expiresAt?: string;
};
```

### 10.5 SubscriptionFxEstimate
```ts
export type SubscriptionFxEstimate = {
  id: string;
  subscriptionId: string;
  userId: string;
  originalAmountUsd: number;
  exchangeRate: number;
  estimatedKrwAmount: number;
  estimateLowKrwAmount?: number;
  estimateHighKrwAmount?: number;
  changedPercentFromPrevious?: number;
  changeStatus?: "stable" | "up" | "down" | "significant_up" | "significant_down";
  calculatedAt: string;
};
```

### 10.6 NotificationSettings
```ts
export type NotificationSettings = {
  id: string;
  userId: string;
  paymentReminderEnabled: boolean;
  trialReminderEnabled: boolean;
  lowUsageReminderEnabled: boolean;
  monthlySummaryEnabled: boolean;
  fxVolatilityAlertEnabled: boolean;
  reminderDaysBeforePayment: number[];
  reminderDaysBeforeTrialEnd: number[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  updatedAt: string;
};
```

### 10.7 BudgetReport
```ts
export type BudgetReport = {
  id: string;
  userId: string;
  totalSubscriptionsMonthlyKrw: number;
  totalFixedCostsMonthlyKrw: number;
  totalUsdSubscriptionsEstimatedKrw: number;
  recommendedSavingsKrw: number;
  recommendedLivingBudgetKrw: number;
  recommendedSubscriptionBudgetKrw: number;
  subscriptionRatio: number;
  fixedCostRatio: number;
  status: "healthy" | "warning" | "over";
  actionTips: string[];
  createdAt: string;
};
```

### 10.8 PremiumTransaction
```ts
export type PremiumTransaction = {
  id: string;
  userId: string;
  platform: "ios" | "android";
  productId: string;
  purchaseToken?: string;
  originalTransactionId?: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 11. 계산 로직

### 11.1 월간 정규화
```ts
export function getMonthlyNormalizedAmount(amount: number, billingCycle: "monthly" | "yearly") {
  return billingCycle === "monthly" ? amount : amount / 12;
}
```

### 11.2 KRW 변환
```ts
export function convertUsdToKrw(usdAmount: number, rate: number) {
  return usdAmount * rate;
}
```

### 11.3 버퍼 포함 KRW 변환
```ts
export function convertUsdToKrwWithBuffer(
  usdAmount: number,
  rate: number,
  bufferPercent: number = 0.02
) {
  const base = usdAmount * rate;
  return {
    base,
    low: base,
    high: base * (1 + bufferPercent),
  };
}
```

### 11.4 월간 총 구독비(KRW)
```ts
export function getTotalMonthlySubscriptionsKrw(
  subscriptions: Array<{
    amount: number;
    billingCycle: "monthly" | "yearly";
    currency: "KRW" | "USD";
  }>,
  usdKrwRate: number
) {
  return subscriptions.reduce((sum, item) => {
    const normalized = item.billingCycle === "monthly" ? item.amount : item.amount / 12;
    const krwValue = item.currency === "USD" ? normalized * usdKrwRate : normalized;
    return sum + krwValue;
  }, 0);
}
```

### 11.5 비율 계산
```ts
export function getSubscriptionRatio(totalSubscriptionsMonthlyKrw: number, netMonthlyIncome: number) {
  if (!netMonthlyIncome) return 0;
  return totalSubscriptionsMonthlyKrw / netMonthlyIncome;
}
```

```ts
export function getFixedCostRatio(totalFixedCostsMonthlyKrw: number, netMonthlyIncome: number) {
  if (!netMonthlyIncome) return 0;
  return totalFixedCostsMonthlyKrw / netMonthlyIncome;
}
```

### 11.6 상태 로직
```ts
export function getSubscriptionHealthStatus(subscriptionRatio: number): "healthy" | "warning" | "over" {
  if (subscriptionRatio <= 0.03) return "healthy";
  if (subscriptionRatio <= 0.05) return "warning";
  return "over";
}
```

### 11.7 FX 예상값 변화 상태
```ts
export function getFxDeltaStatus(
  previousEstimate: number | null,
  currentEstimate: number
): {
  changedPercentFromPrevious: number;
  changeStatus: "stable" | "up" | "down" | "significant_up" | "significant_down";
} {
  if (!previousEstimate || previousEstimate <= 0) {
    return { changedPercentFromPrevious: 0, changeStatus: "stable" };
  }

  const delta = ((currentEstimate - previousEstimate) / previousEstimate) * 100;

  if (delta >= 5) return { changedPercentFromPrevious: delta, changeStatus: "significant_up" };
  if (delta > 0.5) return { changedPercentFromPrevious: delta, changeStatus: "up" };
  if (delta <= -5) return { changedPercentFromPrevious: delta, changeStatus: "significant_down" };
  if (delta < -0.5) return { changedPercentFromPrevious: delta, changeStatus: "down" };

  return { changedPercentFromPrevious: delta, changeStatus: "stable" };
}
```

### 11.8 해지 점수
```ts
export function getCancellationScore(input: {
  usageFrequency: "high" | "medium" | "low";
  isTrial: boolean;
  daysUntilBilling: number;
  duplicateCategoryCount: number;
}) {
  let score = 0;

  if (input.usageFrequency === "low") score += 3;
  else if (input.usageFrequency === "medium") score += 1;

  if (input.isTrial) score += 2;
  if (input.daysUntilBilling <= 3) score += 2;
  if (input.duplicateCategoryCount >= 3) score += 2;

  return score;
}
```

---

## 12. 서비스 레이어 설계

### 12.1 AuthService
책임:
- 회원가입
- 로그인
- 로그아웃
- 세션 복원
- 현재 사용자 조회

### 12.2 SubscriptionService
책임:
- 구독 생성
- 구독 수정
- 구독 삭제
- 구독 목록 조회
- 요약 계산
- 해지 후보 계산

### 12.3 FinancialProfileService
책임:
- 월급/고정비 프로필 저장
- 사용자 프로필 조회
- 프로필 수정

### 12.4 BudgetService
책임:
- 예산 리포트 생성
- 비율 계산
- 추천 메시지 계산

### 12.5 ExchangeRateService
책임:
- Supabase Edge Function에서 최신 USD/KRW 환율 가져오기
- 마지막 유효 환율 캐시
- stale이면 갱신
- 출처와 시각 같은 메타데이터 반환

### 12.6 FxEstimateService
책임:
- 각 USD 구독의 KRW 예상값 계산
- 예상 스냅샷 저장
- 현재 값과 이전 값 비교
- 변동성 상태 생성

### 12.7 NotificationService
책임:
- 로컬 알림 스케줄링
- 푸시 알림 발송
- 월간 요약 발송
- 프리미엄 사용자 대상 FX 변동성 알림 트리거

### 12.8 PremiumService
책임:
- 인앱 플랜 조회
- 프리미엄 구매
- 구매 복원
- 권한 검증
- 프리미엄 전용 기능 가드 처리

---

## 13. API / 백엔드 함수 계약

### 13.1 GET /fx/usd-krw
목적:
- 최신 USD/KRW 환율 스냅샷 반환

예시 응답:
```json
{
  "baseCurrency": "USD",
  "quoteCurrency": "KRW",
  "rate": 1372.15,
  "source": "example-provider",
  "fetchedAt": "2026-04-16T09:00:00Z",
  "expiresAt": "2026-04-16T15:00:00Z"
}
```

### 13.2 POST /fx/estimate
목적:
- 최신 캐시 환율을 사용해 특정 USD 금액의 예상값 계산

예시 요청:
```json
{
  "usdAmount": 9.99,
  "bufferPercent": 0.02
}
```

예시 응답:
```json
{
  "usdAmount": 9.99,
  "rate": 1372.15,
  "estimatedKrwAmount": 13707.7785,
  "estimateLowKrwAmount": 13707.7785,
  "estimateHighKrwAmount": 13981.93407,
  "calculatedAt": "2026-04-16T09:00:00Z"
}
```

### 13.3 POST /budget/report
목적:
- 사용자 재무 프로필 + 구독 데이터를 기반으로 예산 리포트 생성

---

## 14. React Native 프로젝트 구조

```text
src/
  app/
    navigation/
    providers/
  common/
    components/
    constants/
    hooks/
    utils/
    types/
  features/
    auth/
      api/
      components/
      hooks/
      screens/
      store/
      types/
    subscriptions/
      api/
      components/
      hooks/
      screens/
      store/
      types/
      utils/
    money-plan/
      api/
      components/
      hooks/
      screens/
      store/
      types/
      utils/
    exchange-rate/
      api/
      hooks/
      store/
      types/
      utils/
    premium/
      api/
      components/
      hooks/
      screens/
      store/
      types/
    settings/
      screens/
      components/
  services/
    supabase/
    notifications/
    analytics/
```

---

## 15. 화면 목록

### 15.1 온보딩 / 인증
- SplashScreen
- IntroScreen
- LoginScreen
- SignupScreen
- OnboardingIncomeScreen
- OnboardingFixedCostScreen
- OnboardingSubscriptionSetupScreen

### 15.2 Home
- HomeDashboardScreen

### 15.3 Subscriptions
- SubscriptionListScreen
- SubscriptionCreateScreen
- SubscriptionEditScreen
- SubscriptionDetailScreen
- FxEstimateDetailScreen

### 15.4 Money Plan
- MoneyPlanScreen
- BudgetRecommendationScreen
- SavingsTipsScreen

### 15.5 Premium
- PremiumIntroScreen
- PaywallScreen
- PurchaseSuccessScreen

### 15.6 Settings
- MyPageScreen
- NotificationSettingsScreen
- ProfileScreen
- TermsScreen
- PrivacyPolicyScreen

---

## 16. MVP 범위

### 16.1 반드시 포함
- 인증
- 구독 추가/수정/삭제
- 월간/연간 정규화
- 월급 및 고정비 입력
- 대시보드 요약
- USD 구독 KRW 예측
- 예산 추천
- 알림 설정
- 프리미엄 페이월

### 16.2 있으면 좋은 것
- 해지 후보
- FX 변동 알림
- 고급 요약 카드
- 프리미엄 리포트

### 16.3 이후 버전
- 이메일/영수증 기반 자동 구독 감지
- AI 기반 코칭
- 가족/커플 공유 플랜
- 더 많은 통화 지원
- FX 영향 히스토리 차트

---

## 17. 비기능 요구사항

### 17.1 성능
- 홈 대시보드는 빠르게 로드되어야 한다
- 환율 조회는 캐시되어야 한다
- 외부 API 반복 호출을 피해야 한다
- 오프라인 시 마지막 환율로 fallback 지원

### 17.2 안정성
- 모든 화면에 안전한 로딩/에러/빈 상태 제공
- 프로필 데이터가 없어도 앱이 크래시 나지 않도록
- 최신 환율 조회 실패 시 stale 환율 fallback 지원

### 17.3 보안
- 환율 API 시크릿을 클라이언트에 노출하지 않는다
- 최소한의 금융 정보만 저장한다
- 사용자 데이터는 인증된 접근만 허용한다
- 모든 쓰기 작업은 검증한다
- Supabase RLS 정책으로 사용자별 접근 제어를 적용한다

### 17.4 컴플라이언스 / 포지셔닝
이 제품은 예산 관리 및 구독 관리 도구입니다.
다음처럼 포지셔닝해서는 안 됩니다.

- 투자 자문 서비스
- 규제 대상 금융 자문 서비스
- 수익 보장형 자산 증식 서비스

---

## 18. KPI

### 제품
- 회원가입 전환율
- 첫 구독 생성률
- 월급 입력 완료율
- DAU / WAU / MAU
- 예산 화면 사용률

### 금전 / 가치
- 평균 추적 구독 수
- USD 구독 보유 사용자 비율
- FX 예상 화면 진입률
- 해지 후보 클릭률

### 수익
- 무료 → 프리미엄 전환율
- 월 반복 매출(MRR)
- 이탈률
- 프리미엄 유지율

---

## 19. 완료 기준(Definition of Done)

기능은 다음을 모두 만족해야 완료입니다.

- UI가 동작한다
- 로딩/에러/빈 상태가 존재한다
- 데이터 저장이 된다
- 검증이 존재한다
- TypeScript 타입이 정확하다
- 비즈니스 로직이 가능하면 프레젠테이션 계층 밖에 있다
- 핵심 계산 로직에 테스트가 있다
- 프리미엄 기능 가드가 필요한 곳에 있다
- Supabase 정책 및 권한 검토가 완료되어 있다

---

## 20. Codex 구현 순서

### Step 1
React Native TypeScript 프로젝트 초기화 및 핵심 의존성 설치:

- navigation
- query
- state
- supabase-js
- forms
- date utils

### Step 2
프로젝트 아키텍처와 공통 디자인 시스템 설정:

- theme
- spacing
- typography
- card/button/input 컴포넌트

### Step 3
인증 구현:

- 회원가입
- 로그인
- 세션 복원
- Supabase Auth 연동

### Step 4
구독 도메인 구현:

- 모델
- repository
- 생성/수정/삭제/목록 화면
- Supabase 테이블 및 CRUD 연동

### Step 5
재무 프로필 구현:

- 월급 입력
- 고정비 입력
- 저장

### Step 6
예산 추천 엔진 구현:

- 계산 로직
- 액션 팁
- 리포트 UI

### Step 7
환율 백엔드 함수 및 앱 연동 구현:

- USD/KRW 환율 조회
- 결과 캐싱
- 예상값 계산
- USD 예상 카드 표시
- Supabase Edge Function 구성

### Step 8
대시보드 구현:

- 총액
- 다음 결제
- FX 요약
- 추천 카드

### Step 9
알림 구현:

- 결제 알림
- 체험 종료 알림
- 월간 요약
- 선택적 FX 변동 알림

### Step 10
프리미엄 구현:

- 페이월
- 플랜 권한 처리
- 구매 복원

### Step 11
테스트 추가:

- 비율 계산
- KRW 예상 계산
- 델타/변동성 로직
- Supabase 데이터 접근 계층 테스트

---

## 21. AGENTS.md for Codex

프로젝트 루트에 `AGENTS.md` 파일을 만들고 아래 내용을 넣습니다.

```md
# AGENTS.md

## Project Overview
This is a React Native TypeScript mobile app for Korean users.
The app manages subscriptions, gives salary-based budgeting guidance,
and predicts KRW charges for USD subscriptions using exchange rates.

## Tech Stack
- React Native
- TypeScript
- Supabase
- React Query
- Zustand

## Architecture Rules
- Use feature-based folders
- Keep business logic outside screens/components
- Prefer hooks + service layer + repository style separation
- Add strong typing for all DTOs and domain models
- Keep components small and reusable

## Product Priorities
1. Fast MVP delivery
2. Reliable subscription CRUD
3. Useful budget recommendations
4. Accurate USD/KRW estimate display
5. Clean Korean-first UX

## Coding Rules
- Validate all user input
- Always implement loading, error, and empty states
- Do not put secret keys in client
- Currency and date formatting must be consistent
- Prefer pure functions for calculations
- Add unit tests for important business logic

## Supabase Rules
- Use Supabase Auth for authentication
- Use PostgreSQL tables with clear relational design
- Apply RLS for all user-owned tables
- Use Edge Functions or server proxy for protected external API calls
- Store timestamp and source metadata with exchange-rate snapshots

## Auth Roadmap
- MVP auth can start with email/password via Supabase Auth for faster delivery and simpler QA.
- Google login is a planned next-step enhancement and should be documented before implementation work starts.
- When Google login is added, prefer Supabase OAuth with Expo redirect/deep-link flow so session restore and route guards can stay consistent.
- Google login should be introduced without breaking existing auth session persistence, onboarding flow, or user-owned data policies.

## UX Rules
- Keep forms short
- Show money clearly
- Explain status in plain language
- For USD subscriptions, always show both USD and estimated KRW

## Done Criteria
A task is complete only if:
- the screen works,
- the state is persisted,
- validation exists,
- loading/error/empty states exist,
- code is readable,
- calculation logic is testable.
```

---

## 22. 첫 Codex 프롬프트

Codex에 아래 초기 프롬프트를 사용합니다.

```text
Build a production-ready React Native TypeScript app called "SubMoney".

Main features:
1. Supabase authentication
2. Subscription CRUD
3. Dashboard for subscription totals and next billing dates
4. Salary and fixed-cost input
5. Rules-based budget recommendation engine
6. USD subscription KRW estimate feature using exchange rates fetched from a secure backend function
7. Notification settings for billing reminders
8. Premium paywall

Requirements:
- Use feature-based architecture
- Use React Query for async state
- Use Zustand for local/global state where appropriate
- Keep business logic outside UI components
- Korean-first UX copy
- Implement loading, empty, and error states
- Add unit tests for budget and FX calculation logic
- Use Supabase for auth and data persistence
- Use Edge Functions for protected external API integrations
- Start auth with email/password, but keep the auth module extensible for Google login in a later step.
- Plan Google login around Supabase OAuth provider setup, Expo redirect handling, and stable session restoration.

Start with:
1. Project structure
2. Supabase setup
3. Auth flow
4. Subscription domain
5. Exchange rate service and USD/KRW estimate cards
```

### 한국어 의미
"SubMoney"라는 이름의 프로덕션 수준 React Native TypeScript 앱을 만들어라.

주요 기능:
1. Supabase 인증
2. 구독 CRUD
3. 구독 총액 및 다음 결제일 대시보드
4. 월급 및 고정비 입력
5. 규칙 기반 예산 추천 엔진
6. 보안 백엔드 함수에서 환율을 가져오는 USD 구독 KRW 예상 금액 기능
7. 결제 알림용 알림 설정
8. 프리미엄 페이월

요구사항:
- 기능 단위 아키텍처 사용
- 비동기 상태는 React Query 사용
- 필요한 곳에 Zustand 사용
- 비즈니스 로직은 UI 컴포넌트 밖에 둘 것
- 한국어 우선 UX 문구
- 로딩/빈 상태/에러 상태 구현
- 예산 및 환율 계산 로직에 대한 단위 테스트 추가
- 인증과 데이터 저장은 Supabase 사용
- 보호된 외부 API 연동은 Edge Functions 사용

다음부터 시작:
1. 프로젝트 구조
2. Supabase 설정
3. 인증 플로우
4. 구독 도메인
5. 환율 서비스 및 USD/KRW 예상 카드

---

## 23. 향후 확장 아이디어

- JPY/EUR 지원
- 가족 단위 공유 구독 모드
- 카드 수수료 프로필 커스터마이징
- FX 추이 차트
- AI 추천 엔진
- 중복 구독 자동 탐지
- 영수증 자동 파싱

---

## 24. 최종 MVP 정의

MVP는 다음이 가능할 때 완료입니다.

- 사용자가 회원가입 및 로그인할 수 있다
- 사용자가 구독을 생성하고 관리할 수 있다
- 사용자가 월급과 고정비를 입력할 수 있다
- 앱이 KRW 기준 월간 총 구독 부담을 계산할 수 있다
- USD 구독에 현재 KRW 예상 금액이 표시된다
- 앱이 머니 플래닝 추천을 생성할 수 있다
- 결제 알림이 동작한다
- 프리미엄 페이월이 존재한다
- iOS와 Android 빌드가 스토어 제출 가능한 상태다
