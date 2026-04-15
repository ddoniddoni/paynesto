# Step 02 Exec Plan: Design System Foundation

## 목표

`step/02-design-system-foundation`의 목표는 현재 Expo 기반 스타터 UI를 PRD의 Step 2 방향에 맞춰 제품용 공통 디자인 시스템으로 정리하는 것입니다.

이 step이 끝나면 아래가 가능해야 합니다.

- 색상, 간격, 타이포그래피 토큰이 제품 기준으로 일관되게 정의된다.
- 공통 화면에서 재사용할 수 있는 card / button / input 기본 컴포넌트가 준비된다.
- `ThemedText`, `ThemedView`, `theme.ts`가 임시 스타일 묶음이 아니라 디자인 시스템 진입점 역할을 하게 된다.
- 이후 인증, 구독, 머니 플랜 화면이 같은 시각 언어와 상태 규칙 위에서 구현될 수 있다.

## 현재 상태

현재 저장소에는 아래 기반이 이미 존재합니다.

- `src/constants/theme.ts`에 light/dark 색상과 spacing 상수 존재
- `ThemedText`, `ThemedView`, `SectionCard` 등 기초 UI 조각 존재
- `Home`, `Plans` 화면이 같은 토큰 일부를 공유하고 있음

하지만 아직 아래 한계가 있습니다.

- 색상 역할이 제품 관점의 semantic token 수준으로 충분히 정리되어 있지 않음
- typography가 현재 `ThemedText` 내부 style 분기 중심이라 확장성이 낮음
- button / input 기본 컴포넌트가 없음
- 공통 상호작용 상태(pressed, disabled, error, focus)의 기준이 문서화되어 있지 않음
- 화면별 스타일이 일부 직접 정의돼 있어 도메인 화면 확장 시 일관성이 흔들릴 수 있음

## 가정

- Step 2에서는 기존 Expo Router 구조와 현재 mock 화면을 유지한다.
- Step 2의 목적은 "공통 UI 기반 정리"이며, 실제 인증/구독 기능 구현은 포함하지 않는다.
- light/dark 모드는 유지하되, 초기 제품 톤은 한국 사용자 대상 돈 관리 앱에 맞는 안정적인 시각 체계로 정리한다.
- 복잡한 외부 UI 라이브러리는 도입하지 않고 현재 코드베이스 위에서 자체 컴포넌트를 확장한다.
- 접근성 라벨, 명확한 상태 표현, 입력 오류 표시 기준을 이번 step에서 최소 수준으로 함께 정의한다.

## 범위

### 포함

- theme token 재정리
  - semantic color token 확장
  - spacing scale 점검
  - radius / border / surface tone 기준 추가 검토
- typography 정리
  - text variant 체계 정리
  - heading / body / caption / label 역할 구분
  - 필요 시 공통 typography map 추출
- 공통 UI 컴포넌트 추가 또는 개편
  - `Card`
  - `Button`
  - `TextInput` 또는 `FormInput`
- 공통 상태 기준 반영
  - disabled
  - pressed
  - error
  - helper text
  - loading 표현 가능성
- 기존 `Home`, `Plans` 또는 샘플 화면 일부에 새 공통 컴포넌트 적용
- 문서 보강
  - 디자인 토큰과 컴포넌트 사용 방향 정리

### 제외

- 실제 인증 폼 구현
- 실제 구독 생성/수정 화면 구현
- 실제 폼 검증 플로우 완성
- 디자인 QA 전체 마감
- 아이콘 시스템 확장
- 애니메이션 시스템 구축

## 산출물

- Step 2 계획 문서 2종
- 공통 디자인 토큰 정리 결과
- 재사용 가능한 `Card`, `Button`, `Input` 계열 컴포넌트
- typography variant 정리
- 최소 1~2개 샘플 화면의 토큰/컴포넌트 적용 결과

## 구현 단계

### 1. 기존 토큰과 UI 역할 정리

- 현재 `theme.ts`, `ThemedText`, `ThemedView`, `SectionCard`의 역할을 명확히 정리한다.
- 현재 이미 있는 값은 최대한 살리고, 이름과 책임을 제품 기준으로 재정렬한다.

### 2. semantic theme 확장

- `text`, `background` 같은 단순 토큰 외에 surface / border / accent / danger / success / muted 계열을 검토한다.
- 이후 폼과 상태 UI에서 바로 재사용할 수 있도록 색상 역할을 분리한다.

### 3. typography 체계 정리

- 현재 `default`, `title`, `smallBold` 등의 variant를 heading/body/label 관점으로 재설계한다.
- line-height, weight, size를 일관 규칙으로 묶는다.
- 한국어 우선 UI에서 가독성을 해치지 않는 범위로 유지한다.

### 4. 공통 컴포넌트 구축

- `Card`는 `SectionCard`를 대체하거나 그 상위 공통 컴포넌트로 정리한다.
- `Button`은 variant와 상태를 지원하는 기본 컴포넌트로 만든다.
- `Input`은 label, helper, error, placeholder를 다룰 수 있는 최소 폼 기반 컴포넌트로 만든다.

### 5. 화면 적용으로 기준 검증

- 기존 `Home`, `Plans` 화면 일부에 공통 컴포넌트를 적용한다.
- 토큰만 예쁘게 만드는 데서 끝내지 않고 실제 화면 조합이 자연스러운지 확인한다.

### 6. 문서 및 사용 규칙 정리

- README 또는 별도 문서에 토큰/컴포넌트 사용 방향을 간단히 남긴다.
- 이후 step에서 화면별 ad-hoc 스타일이 늘어나지 않도록 기준을 남긴다.

## 리스크

### 너무 이른 과설계 위험

Step 2에서 컴포넌트 API를 과하게 일반화하면 실제 도메인 화면이 나오기 전에 유지비만 커질 수 있습니다.

대응:
- 현재 PRD에서 확실히 필요한 `card / button / input / typography`까지만 다룬다
- variant 수를 최소화한다

### 기존 화면과 새 토큰 간 충돌 위험

현재 `Home`, `Plans` 화면이 이미 일부 스타일을 직접 들고 있어서 새 공통 컴포넌트 도입 시 시각 차이가 발생할 수 있습니다.

대응:
- 한 번에 전면 교체하지 않는다
- 핵심 반복 요소부터 순차적으로 교체한다

### 모바일/웹 표현 차이 위험

Expo web과 native에서 폰트, focus, pressed 표현 차이가 있어 컴포넌트가 완전히 동일하게 보이지 않을 수 있습니다.

대응:
- 공통 규칙은 유지하되 플랫폼 차이는 스타일 레벨에서 수용한다
- 특히 input/focus 표현은 웹과 네이티브 차이를 염두에 둔다

### 접근성 누락 위험

디자인 시스템 구축에 집중하다 보면 label, helper text, disabled semantics가 빠질 수 있습니다.

대응:
- Button/Input의 최소 접근성 계약을 이번 step의 완료 기준에 포함한다

## 검증 방법

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- 가능하면 `npm.cmd run start`

가능하면 아래도 함께 확인합니다.

- `Home`, `Plans` 화면에서 새 토큰/컴포넌트 적용 후 시각 일관성이 유지되는지
- Button/Input 상태가 최소한 pressed/disabled/error를 표현하는지
- 기존 theme hook과 provider 구조 위에서 자연스럽게 동작하는지

## 완료 기준

아래를 만족하면 Step 2 완료로 봅니다.

- 디자인 토큰이 제품 기준으로 더 명확해진다.
- typography 역할 체계가 정리된다.
- `Card`, `Button`, `Input` 공통 컴포넌트가 준비된다.
- 적어도 일부 기존 화면이 새 기준으로 정리된다.
- lint/typecheck가 유지된다.
- Step 3 인증 화면을 새 UI 기반 위에서 시작할 수 있다.
