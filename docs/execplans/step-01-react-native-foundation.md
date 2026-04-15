# Step 01 Exec Plan: Bootstrap React Native Foundation

## 목표

`step/01-bootstrap-react-native-foundation`의 목표는 현재 Expo 기반 스타터 앱을 유지하면서, PRD와 `AGENTS.md` 기준에 맞는 초기 개발 기반을 정리하는 것입니다.

이 step이 끝나면 아래가 가능해야 합니다.

- React Native + TypeScript + Expo Router 기반 앱 구조를 계속 사용한다.
- 이후 feature 작업을 위한 최소 공통 폴더 구조가 준비된다.
- 비동기 상태, 전역 상태, 백엔드 연동, 폼 처리, 날짜 처리에 필요한 핵심 의존성이 정리된다.
- 앱 전역 provider 진입점이 준비된다.
- Supabase, React Query, Zustand, 폼, 날짜 유틸을 붙일 수 있는 안전한 초기 경계가 생긴다.

## 현재 상태

현재 저장소에는 아래가 이미 존재합니다.

- Expo SDK 55 기반 React Native 앱
- Expo Router 엔트리 구성
- `Home`, `Plans` 화면 중심의 간단한 탭 셸
- 기본 테마 상수와 일부 공용 UI 컴포넌트
- 로컬 mock 기반 plans 데이터

반면 PRD의 Step 1 관점에서 아직 부족한 부분은 아래입니다.

- `@tanstack/react-query`, `zustand`, `@supabase/supabase-js` 등 핵심 런타임 의존성 부재
- 폼/입력 검증 도구 부재
- 날짜 유틸 부재
- feature-based 구조의 초깃값 부재
- 앱 레벨 provider 분리 부재
- 환경 변수 계약과 Supabase 연동 준비 코드 부재
- `typecheck`, `test` 등 표준 검증 명령 정리 부족

## 가정

- Step 1에서는 현재 `Expo Router`를 유지한다.
- Step 1에서는 실제 인증, 실제 CRUD, 실제 Supabase 연결은 구현하지 않는다.
- Step 1의 목적은 "실행 가능한 기반 정리"이며, 화면 완성보다 아키텍처 발판 마련이 우선이다.
- 현재 있는 `Home`/`Plans` UI는 임시 스타터 화면으로 유지하고, 이후 step에서 도메인 화면으로 교체할 수 있다.
- 환경 변수에는 공개 가능한 값만 클라이언트에 두고, 시크릿은 절대 앱 코드에 넣지 않는다.

## 범위

### 포함

- 핵심 의존성 추가
  - `@tanstack/react-query`
  - `zustand`
  - `@supabase/supabase-js`
  - `react-hook-form`
  - `zod`
  - `@hookform/resolvers`
  - `date-fns`
- 앱 전역 provider 구조 도입
  - Query Client provider
  - 향후 auth/theme/provider 확장을 위한 엔트리 분리
- PRD 방향에 맞는 최소 디렉터리 초깃값 생성
  - `src/features`
  - `src/lib`
  - `src/services`
  - 필요 시 `src/components/shared`
- Supabase 초기 설정용 placeholder 코드 생성
  - 환경 변수 읽기 경계
  - 클라이언트 생성 함수 또는 stub
- 공통 검증 스크립트 정리
  - `lint`
  - `typecheck`
  - 필요 시 기본 `test` 스크립트 자리 마련
- README 또는 관련 문서에 현재 부트스트랩 방향 반영

### 제외

- Supabase 프로젝트 실제 연결
- 로그인/회원가입 플로우 구현
- 구독 CRUD 구현
- 환율 Edge Function 구현
- 프리미엄 결제 구현
- 완성형 디자인 시스템 구축
- 스토어 배포 설정 마무리

## 산출물

- Step 1 계획 문서 2종
- 핵심 라이브러리가 추가된 프로젝트 설정
- 앱 provider 진입 구조
- feature-based 확장을 위한 최소 폴더 구조
- Supabase 연동용 안전한 초기 코드
- 향후 step에서 재사용 가능한 기반 유틸 초안

## 구현 단계

### 1. 현재 스타터 구조 유지 전략 확정

- Expo Router 기반 엔트리는 유지한다.
- 현재 화면은 제거하지 않고 "기반 확인용 scaffold"로 둔다.
- 아키텍처 재정렬은 기존 파일을 한 번에 대규모 이동하지 않고 점진적으로 진행한다.

### 2. 핵심 의존성 설치 및 스크립트 보강

- PRD Step 1에 필요한 핵심 패키지를 추가한다.
- `package.json`에 `typecheck` 스크립트를 추가한다.
- 테스트 러너는 도입 여부를 판단하되, 이번 step에서 실제 테스트를 많이 작성하지는 않는다.

### 3. 앱 전역 provider 레이어 도입

- `src/app/providers`를 만들고 Query Client provider를 분리한다.
- 루트 레이아웃에서 provider를 조합해 앱 전체에 주입한다.
- 이후 auth/session provider를 추가할 수 있도록 구조를 열어둔다.

### 4. 최소 아키텍처 초깃값 추가

- `src/features`, `src/lib`, `src/services` 폴더를 만든다.
- 공통 타입, 상수, 포맷터, env 접근 코드의 시작점을 만든다.
- 지금 당장 구현하지 않는 기능도 "들어갈 자리"는 명확히 보이게 한다.

### 5. Supabase 초기 연결 경계 설정

- `src/services/supabase` 또는 유사 위치에 클라이언트 초기화 코드를 둔다.
- URL, anon key는 환경 변수에서만 읽도록 한다.
- 값이 없을 경우 앱이 명확한 개발용 fallback 또는 안전한 오류 메시지를 사용하게 한다.

### 6. 문서와 검증 기준 정리

- README에 현재 개발 시작 방법과 필요한 환경 변수 개요를 반영한다.
- lint/typecheck가 통과하도록 맞춘다.
- test를 아직 본격 도입하지 않는다면 그 이유를 문서 또는 최종 기록에 남긴다.

## 리스크

### 구조를 너무 크게 앞당길 위험

Step 1에서 feature 구조를 과도하게 완성하려 하면 실제 기능 개발 전에 불필요한 추상화가 늘어날 수 있습니다.

대응:
- "최소 구조만 만든다"
- 실제 구현 전까지 빈 폴더/빈 레이어를 과도하게 늘리지 않는다

### Expo Router와 향후 구조 충돌 위험

폴더 구조를 PRD 기준으로만 밀어붙이면 Expo Router 파일 기반 라우팅과 어색하게 섞일 수 있습니다.

대응:
- 라우팅 진입은 `src/app`
- 도메인 로직은 `src/features`
- 외부 연동은 `src/services`
로 분리해 역할을 명확히 한다

### Supabase 준비 코드에 시크릿이 섞일 위험

초기 세팅 과정에서 샘플 키를 하드코딩하면 이후 보안 문제로 이어질 수 있습니다.

대응:
- 실제 키는 커밋하지 않는다
- env 계약과 예시만 남긴다
- 시크릿이 필요한 연동은 이후 서버/관리 콘솔 단계에서 처리한다

### 검증 명령 불일치 위험

현재 프로젝트에는 `typecheck`, `test`가 바로 실행되지 않을 수 있습니다.

대응:
- Step 1에서 최소한 `typecheck`는 명시적으로 추가한다
- `test`는 도입 여부와 범위를 분명히 기록한다

## 검증 방법

- `npm.cmd install`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- 필요 시 `npm.cmd run start`

가능하면 아래도 확인합니다.

- 앱이 기존 `Home`/`Plans` 화면까지는 정상 진입하는지
- Provider 도입 후 라우팅이 깨지지 않는지
- 환경 변수 미설정 상태에서 치명적 크래시 없이 동작하는지

## 완료 기준

아래를 만족하면 Step 1 완료로 봅니다.

- 프로젝트가 PRD 방향의 기반 구조를 갖춘다.
- 핵심 라이브러리가 정리된다.
- 앱 전역 provider 경계가 생긴다.
- Supabase와 상태 관리 도입 준비가 끝난다.
- lint/typecheck 기준이 정리된다.
- 다음 step에서 인증과 구독 도메인 구현을 시작할 수 있다.
