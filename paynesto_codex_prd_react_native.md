# Subscription & Salary Money Planner App
## Codex Development PRD (React Native Edition)

## 1. Document Purpose

This document is a product requirements document (PRD) and implementation guide for Codex.

The goal is to build a mobile app that helps users:
1. manage recurring subscriptions,
2. understand their spending based on salary,
3. predict KRW payment amounts for USD subscriptions using live exchange rates.

This document should be detailed enough for Codex to:
- initialize the project structure,
- implement screens and flows,
- design data models,
- build service layers,
- implement exchange-rate based prediction logic,
- prepare in-app subscriptions for App Store and Google Play.

---

## 2. Product Summary

A mobile app that combines:
- **subscription management**
- **salary-based budgeting recommendations**
- **exchange-rate based KRW prediction for foreign-currency subscriptions**

Primary target market:
- Korean users
- salary earners
- users with many digital subscriptions
- users who pay for both KRW and USD subscription services

---

## 3. Core Product Value

### 3.1 User Problems
Users often:
- lose track of recurring subscriptions,
- underestimate total monthly subscription costs,
- forget trial expiration dates,
- do not know whether their subscription spending is reasonable relative to salary,
- pay in USD but do not know how much KRW will actually be charged at the next billing date.

### 3.2 Product Solution
The app solves this by offering:
1. a **subscription management tab**
2. a **salary-based money planning tab**
3. a **foreign currency payment prediction system**

---

## 4. Product Goals

### 4.1 User Goals
- Let users see all recurring subscriptions in one place.
- Let users understand monthly and yearly subscription burden.
- Help users compare subscription spending against their net monthly income.
- Predict expected KRW payment amount for USD subscriptions using current exchange rate data.
- Help users reduce unnecessary recurring expenses.

### 4.2 Business Goals
- Launch on both App Store and Google Play.
- Operate on a freemium model.
- Convert free users into premium subscribers.
- Increase retention through reminders and actionable money insights.

---

## 5. Platform and Technical Direction

## 5.1 Platform
- iOS
- Android

## 5.2 Frontend Stack
- React Native
- TypeScript

## 5.3 Recommended App Framework
Use one of the following:
- **React Native CLI** for maximum native control
- **Expo (prebuild or managed with config plugins)** if faster MVP delivery is preferred

### Final recommendation
Use:
- **React Native + TypeScript**
- **Expo Router** or **React Navigation**
- **React Query / TanStack Query**
- **Zustand** for lightweight global state
- **Firebase** or **Supabase** for backend

### Recommended backend for MVP
Option A:
- Firebase Auth
- Firestore
- Firebase Cloud Messaging
- Firebase Analytics
- Crashlytics

Option B:
- Supabase Auth
- PostgreSQL
- Edge Functions
- Expo Notifications or OneSignal

### Final backend recommendation
For a fast MVP:
- **React Native + TypeScript + Firebase**

Reason:
- faster auth + push + analytics setup,
- lower backend overhead,
- good support for MVP launch.

---

## 6. Information Architecture

Recommended bottom tab structure:

1. Home
2. Subscriptions
3. Money Plan
4. My Page

### 6.1 Home
Shows:
- monthly subscription total,
- yearly subscription total,
- next billing date,
- USD subscription KRW prediction summary,
- salary vs subscription ratio,
- action cards such as cancellation suggestions.

### 6.2 Subscriptions
Shows:
- subscription list,
- create/edit/delete flows,
- category filter,
- billing schedule info,
- foreign currency status.

### 6.3 Money Plan
Shows:
- net monthly salary,
- fixed costs,
- recommended savings,
- recommended subscription budget,
- spending health score,
- savings/cut recommendations.

### 6.4 My Page
Shows:
- profile,
- premium plan,
- notification settings,
- terms,
- privacy policy,
- support.

---

## 7. Primary User Flows

## 7.1 Onboarding
1. App introduction
2. Sign up / sign in / guest start
3. Enter net monthly salary
4. Enter fixed costs
5. Add subscriptions
6. View initial analysis

## 7.2 Daily Usage
1. Open home dashboard
2. Check monthly total
3. Review next billing dates
4. Review KRW prediction for USD subscriptions
5. Check budget recommendations
6. Review cancellation suggestions

## 7.3 Premium Conversion
1. User hits free limit or taps premium feature
2. Paywall is shown
3. Monthly / yearly plan options appear
4. User completes in-app purchase
5. Premium features unlock

---

## 8. Feature Scope

# 8.1 Subscription Management

## 8.1.1 Subscription Create/Edit
Each subscription should have the following fields:

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

### Categories
- OTT
- Music
- Shopping
- Productivity
- Cloud
- Education
- AI
- Gaming
- Others

### Requirements
- If billing cycle is yearly, convert it into monthly normalized amount.
- If currency is USD, show:
  - original USD amount,
  - current KRW estimated amount,
  - recent exchange-rate reference.

---

## 8.1.2 Subscription List
Each row/card should display:
- service name,
- original amount and currency,
- normalized monthly KRW amount,
- next billing date,
- trial status,
- category,
- usage frequency,
- foreign currency badge if applicable.

### Sorting
- by next billing date
- by highest cost
- by recent addition
- by cancellation score

### Filtering
- all
- category
- KRW only
- USD only
- trial only
- cancellation candidate

---

## 8.1.3 Subscription Analysis
Provide:
- total monthly subscriptions in KRW,
- total yearly subscription burden in KRW,
- highest-cost subscriptions,
- low-usage subscriptions,
- trial expiry count,
- salary-to-subscription ratio,
- USD exposure amount,
- forecasted next-payment total in KRW.

---

## 8.1.4 Notification Features
Notifications should support:
- 3 days before billing
- 1 day before billing
- trial end reminders
- monthly summary reminder
- low-usage review reminder
- exchange rate volatility alert for USD subscriptions (premium)

### Exchange-rate alert example
If the current KRW estimate for a USD subscription changes significantly versus last stored estimate, notify user:
- "Your upcoming USD subscription may cost more this month due to exchange-rate movement."

---

# 8.2 Salary-Based Money Planning

## 8.2.1 Financial Input
User can input:
- `netMonthlyIncome`
- `rentCost`
- `telecomCost`
- `insuranceCost`
- `transportCost`
- `otherFixedCost`
- `savingsGoal`
- `hasDebt`

Subscriptions are automatically linked into the plan.

## 8.2.2 Budget Recommendation Engine
The MVP should use a rules-based recommendation engine.

Inputs:
- salary,
- fixed costs,
- total monthly subscriptions,
- debt flag,
- savings goal.

Outputs:
- recommended savings amount,
- recommended living budget,
- recommended fixed-cost warning,
- recommended subscription budget cap,
- current status,
- action recommendations.

## 8.2.3 Example Rules
### Subscription ratio relative to salary
- 0% to 3%: healthy
- above 3% to 5%: warning
- above 5%: over

### Fixed-cost burden relative to salary
- below 35%: healthy
- 35% to 50%: caution
- above 50%: high burden

### Suggested budget model
Base model:
- savings: 20%
- flexible spending: 30% to 40%
- subscriptions/leisure: 5% to 10%
- fixed cost: actual input
- emergency/other: remaining balance

### Example guidance messages
- "Your subscription spending is currently healthy for your salary."
- "Your fixed costs are high relative to your salary."
- "Try reducing subscription spending by 20,000 KRW this month."
- "At your salary level, recommended monthly subscription spending is under 90,000 KRW."

---

# 8.3 Exchange Rate Prediction System

## 8.3.1 Purpose
Some subscriptions are billed in USD.
Users in Korea want to know the estimated KRW charge for the next billing date.

The system should:
- fetch the current USD/KRW exchange rate,
- estimate KRW charge for each USD subscription,
- aggregate predicted foreign-currency burden,
- store recent snapshots for comparison,
- optionally notify users if KRW estimate increases materially.

## 8.3.2 Functional Requirements
For subscriptions where `currency = USD`:
- fetch live or near-real-time USD/KRW rate,
- calculate `estimatedKRWAmount`,
- show "current estimate" in UI,
- store the rate used and timestamp,
- compare against previously stored estimate,
- support dashboard summary of all USD subscriptions.

## 8.3.3 Data Source Strategy
Use an exchange rate provider API.

Recommended architecture:
- app does **not** call third-party exchange API directly from client if secret/API key is required.
- instead use:
  - Firebase Cloud Function
  - Supabase Edge Function
  - custom server endpoint

Server-side function responsibilities:
- fetch latest USD/KRW exchange rate,
- validate response,
- cache result,
- return sanitized payload to mobile app.

## 8.3.4 Exchange Rate Refresh Policy
Recommended:
- refresh on app open if stale
- refresh on subscription detail page if stale
- daily scheduled refresh server-side
- cache TTL: 6 to 24 hours depending on provider policy

## 8.3.5 Estimated Payment Formula
If subscription is monthly:
- `estimatedKRWAmount = usdAmount * usdKrwRate`

If yearly:
- calculate:
  - `estimatedKRWAmount` for the billing event
  - `normalizedMonthlyKRWAmount = (usdAmount * usdKrwRate) / 12`

## 8.3.6 Optional Buffer Logic
Because final card charge may vary slightly due to card issuer spread, fees, or settlement timing,
the app may optionally show:
- base estimate
- estimate range

Example:
- base estimate: 13,620 KRW
- expected range: 13,620 KRW ~ 13,950 KRW

Suggested buffer:
- 1% to 3% configurable estimate buffer

## 8.3.7 Volatility Logic
If stored previous estimate exists:
- compare current estimated KRW amount with previous estimate
- if change exceeds threshold (example: 3% or 5%), mark as changed significantly

Example statuses:
- stable
- slight increase
- significant increase
- decrease

## 8.3.8 UI Requirements
For USD subscriptions:
- show amount like `$9.99`
- show estimated KRW like `약 13,700원`
- show exchange rate reference like `1 USD = 1,372 KRW`
- show timestamp like `updated 2026-04-16 09:00`
- show volatility indicator if applicable

## 8.3.9 UX Copy Examples
- "Current KRW estimate"
- "Exchange rate updated today"
- "Estimated amount may vary slightly depending on card issuer fees"
- "Your next USD subscription payment is expected to be around 13,700 KRW"

---

## 9. Monetization Model

## 9.1 Freemium Model

### Free
- up to 5 subscriptions
- basic dashboard
- basic salary-based recommendation
- basic billing reminders
- basic USD/KRW current estimate

### Premium
- unlimited subscriptions
- advanced analysis
- cancellation suggestions
- premium reminder options
- exchange-rate volatility alerts
- historical estimate tracking
- advanced reports
- multi-device sync improvements

## 9.2 Suggested Pricing
- monthly: 4,900 KRW
- yearly: 39,000 KRW to 49,000 KRW

## 9.3 Future Monetization
- one-time advanced reports
- affiliate partnerships
- finance-related recommendation partnerships
- family/shared plan features

---

## 10. Data Models

All models below should be implemented in TypeScript and mirrored in Firestore collections or equivalent backend storage.

# 10.1 User
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

# 10.2 UserFinancialProfile
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

# 10.3 Subscription
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

# 10.4 ExchangeRateSnapshot
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

# 10.5 SubscriptionFxEstimate
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

# 10.6 NotificationSettings
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

# 10.7 BudgetReport
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

# 10.8 PremiumTransaction
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

## 11. Calculation Logic

# 11.1 Monthly Normalization
```ts
export function getMonthlyNormalizedAmount(amount: number, billingCycle: "monthly" | "yearly") {
  return billingCycle === "monthly" ? amount : amount / 12;
}
```

# 11.2 KRW Conversion
```ts
export function convertUsdToKrw(usdAmount: number, rate: number) {
  return usdAmount * rate;
}
```

# 11.3 KRW Conversion with Buffer Range
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

# 11.4 Total Monthly Subscription in KRW
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

# 11.5 Ratios
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

# 11.6 Status Logic
```ts
export function getSubscriptionHealthStatus(subscriptionRatio: number): "healthy" | "warning" | "over" {
  if (subscriptionRatio <= 0.03) return "healthy";
  if (subscriptionRatio <= 0.05) return "warning";
  return "over";
}
```

# 11.7 FX Estimate Delta
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

# 11.8 Cancellation Score
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

## 12. Service Layer Design

## 12.1 AuthService
Responsibilities:
- sign up
- sign in
- sign out
- restore session
- fetch current user

## 12.2 SubscriptionService
Responsibilities:
- create subscription
- edit subscription
- delete subscription
- list subscriptions
- calculate summary
- calculate cancellation candidates

## 12.3 FinancialProfileService
Responsibilities:
- save salary/fixed-cost profile
- fetch user profile
- update profile

## 12.4 BudgetService
Responsibilities:
- generate budget report
- calculate ratios
- calculate recommendation messages

## 12.5 ExchangeRateService
Responsibilities:
- fetch latest USD/KRW rate from backend function
- cache last valid rate
- refresh if stale
- return metadata like source and timestamp

## 12.6 FxEstimateService
Responsibilities:
- compute KRW estimate for each USD subscription
- persist estimate snapshot
- compare current estimate vs previous estimate
- generate volatility status

## 12.7 NotificationService
Responsibilities:
- schedule local reminders
- send push reminders
- send monthly summary
- trigger FX volatility alerts for premium users

## 12.8 PremiumService
Responsibilities:
- load available in-app plans
- purchase premium
- restore purchase
- validate entitlement
- guard premium-only features

---

## 13. API / Backend Function Contracts

## 13.1 GET /fx/usd-krw
Purpose:
- return latest USD/KRW rate snapshot

Example response:
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

## 13.2 POST /fx/estimate
Purpose:
- calculate estimate for a given USD amount using latest cached rate

Example request:
```json
{
  "usdAmount": 9.99,
  "bufferPercent": 0.02
}
```

Example response:
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

## 13.3 POST /budget/report
Purpose:
- generate budget report from user financial profile + subscriptions

---

## 14. React Native Project Structure

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
    firebase/
    notifications/
    analytics/
```

---

## 15. Screen List

## 15.1 Onboarding / Auth
- SplashScreen
- IntroScreen
- LoginScreen
- SignupScreen
- OnboardingIncomeScreen
- OnboardingFixedCostScreen
- OnboardingSubscriptionSetupScreen

## 15.2 Home
- HomeDashboardScreen

## 15.3 Subscriptions
- SubscriptionListScreen
- SubscriptionCreateScreen
- SubscriptionEditScreen
- SubscriptionDetailScreen
- FxEstimateDetailScreen

## 15.4 Money Plan
- MoneyPlanScreen
- BudgetRecommendationScreen
- SavingsTipsScreen

## 15.5 Premium
- PremiumIntroScreen
- PaywallScreen
- PurchaseSuccessScreen

## 15.6 Settings
- MyPageScreen
- NotificationSettingsScreen
- ProfileScreen
- TermsScreen
- PrivacyPolicyScreen

---

## 16. MVP Scope

## 16.1 Must Have
- authentication
- add/edit/delete subscriptions
- monthly/yearly normalization
- salary and fixed-cost input
- dashboard summary
- KRW prediction for USD subscriptions
- budget recommendations
- notification settings
- premium paywall

## 16.2 Nice to Have
- cancellation candidates
- FX change alerts
- advanced summary cards
- premium reports

## 16.3 Later Versions
- automatic subscription detection from email or receipt
- AI-based coaching
- shared plans for family/couples
- more currencies
- historical charts for FX impact

---

## 17. Non-Functional Requirements

## 17.1 Performance
- home dashboard should load fast
- exchange-rate fetch should be cached
- avoid repeated external API calls
- app should support offline fallback with last known rate

## 17.2 Stability
- safe loading and error states everywhere
- no crashing on missing profile data
- stale rate fallback if fresh data unavailable

## 17.3 Security
- do not expose exchange API secret on client
- store minimal financial information
- use authenticated access for user data
- validate all write operations

## 17.4 Compliance / Positioning
This product is a budgeting and subscription management tool.
It should not position itself as:
- an investment advisor,
- a regulated financial advisory service,
- a guaranteed wealth-building product.

---

## 18. KPIs

### Product
- signup conversion
- first subscription creation rate
- salary input completion rate
- DAU / WAU / MAU
- budget screen usage rate

### Money / Value
- average number of subscriptions tracked
- percentage of users with USD subscriptions
- FX estimate screen open rate
- cancellation candidate click rate

### Revenue
- free-to-premium conversion
- monthly recurring revenue
- churn rate
- premium retention

---

## 19. Definition of Done

A feature is done only if:
- UI works
- loading/error/empty states exist
- data persistence works
- validation exists
- TypeScript types are correct
- business logic is outside presentation where possible
- critical calculation logic has tests
- premium feature guards are in place where required

---

## 20. Codex Implementation Order

## Step 1
Initialize React Native TypeScript project and install core dependencies:
- navigation
- query
- state
- firebase
- forms
- date utils

## Step 2
Set up project architecture and shared design system:
- theme
- spacing
- typography
- card/button/input components

## Step 3
Implement authentication:
- sign up
- sign in
- session restore

## Step 4
Implement subscription domain:
- models
- repository
- create/edit/delete/list screens

## Step 5
Implement financial profile:
- salary input
- fixed-cost input
- persistence

## Step 6
Implement budget recommendation engine:
- calculations
- action tips
- report UI

## Step 7
Implement exchange-rate backend function and app integration:
- fetch USD/KRW rate
- cache result
- compute estimates
- show USD estimate cards

## Step 8
Implement dashboard:
- totals
- next billing
- FX summary
- recommendation cards

## Step 9
Implement notifications:
- billing reminders
- trial reminders
- monthly summary
- optional FX volatility alert

## Step 10
Implement premium:
- paywall
- plan entitlements
- purchase restore

## Step 11
Add tests:
- ratio calculations
- KRW estimate calculations
- delta/volatility logic

---

## 21. AGENTS.md for Codex

Create a root file named `AGENTS.md` with the following content:

```md
# AGENTS.md

## Project Overview
This is a React Native TypeScript mobile app for Korean users.
The app manages subscriptions, gives salary-based budgeting guidance,
and predicts KRW charges for USD subscriptions using exchange rates.

## Tech Stack
- React Native
- TypeScript
- Firebase
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

## Exchange Rate Rules
- Never call a protected third-party FX API directly from the client
- Use backend function or server proxy
- Cache exchange rates and handle stale fallback
- Store timestamp and source metadata with rate snapshots

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

## 22. First Codex Prompt

Use the following initial prompt with Codex:

```text
Build a production-ready React Native TypeScript app called "SubMoney".

Main features:
1. Firebase authentication
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

Start with:
1. Project structure
2. Firebase setup
3. Auth flow
4. Subscription domain
5. Exchange rate service and USD/KRW estimate cards
```

---

## 23. Future Expansion Ideas

- JPY/EUR support
- shared subscription household mode
- card fee profile customization
- FX trend chart
- AI recommendation engine
- automatic duplicate-subscription detection
- automatic receipt parsing

---

## 24. Final MVP Definition

The MVP is complete when:
- users can sign up and log in,
- users can create and manage subscriptions,
- users can input salary and fixed costs,
- the app can compute total monthly subscription burden in KRW,
- USD subscriptions show current KRW estimate,
- the app can generate money planning recommendations,
- billing reminders work,
- premium paywall exists,
- iOS and Android builds are ready for store submission.
