# Paynesto

구독 관리 + 월급 기반 돈 관리 + 환율 예상 결제를 함께 제공하는 React Native 앱입니다.

## 핵심 기능

- 구독 등록 / 수정 / 삭제
- 월간 / 연간 구독비 환산
- 결제 예정일 및 무료체험 종료 관리
- 세후 월급 / 고정비 기반 예산 추천
- USD 구독의 현재 KRW 예상 결제액 표시
- 환율 변동 감지
- 프리미엄 기능 게이트

## 기술 스택

- React Native
- TypeScript
- React Navigation 또는 Expo Router
- TanStack Query
- Zustand
- supabase

## 권장 폴더 구조

```text
src/
  app/
  components/
    ui/
    shared/
  features/
    auth/
    subscriptions/
    money-plan/
    exchange-rate/
    premium/
    settings/
  lib/
  services/
  types/
  mocks/
tests/
docs/
```

## 실행 원칙

- 비즈니스 로직은 UI 밖으로 분리
- 비동기 화면은 loading / empty / error / success 상태 보장
- USD 구독은 항상 USD 금액 + KRW 예상 금액 + 적용 환율을 함께 표시
- 외부 환율 API 비밀키는 클라이언트에 직접 저장하지 않음

## 기본 실행 명령

```bash
npm install
npm run lint
npm run typecheck
npm run test
```
