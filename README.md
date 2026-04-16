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
- Expo Router
- TanStack Query
- Zustand
- Supabase

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

## 현재 상태

- Expo Router 기반 탭 셸과 기초 UI scaffold가 준비되어 있습니다.
- 현재 `Home`, `Plans` 화면은 mock 데이터 기반의 초기 스타터 화면입니다.
- Step 1에서는 핵심 의존성, provider 구조, Supabase/env 경계를 정리합니다.
- Step 2에서는 제품용 theme token, typography, card/button/input 공용 컴포넌트를 정리합니다.
- Step 3에서는 Supabase Auth 기반 로그인 / 회원가입 / 세션 복원 / auth route 분리를 추가합니다.

## 실행 원칙

- 비즈니스 로직은 UI 밖으로 분리
- 비동기 화면은 loading / empty / error / success 상태 보장
- USD 구독은 항상 USD 금액 + KRW 예상 금액 + 적용 환율을 함께 표시
- 외부 환율 API 비밀키는 클라이언트에 직접 저장하지 않음

## 환경 변수

클라이언트에서 공개 가능한 값만 사용합니다. 실제 값은 로컬 `.env`에 넣고, 시크릿은 앱 코드에 넣지 않습니다.

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.example`를 템플릿으로 사용할 수 있습니다.

인증을 실제로 테스트하려면 위 두 값이 필요합니다. 값이 없으면 앱은 인증 화면에서 미설정 상태를 안내합니다.

## 실행 명령

```bash
npm install
npm run start
npm run lint
npm run typecheck
npm run test
```

현재 `npm run test`는 auth schema와 에러 매핑 같은 순수 로직의 최소 검증부터 시작합니다.
