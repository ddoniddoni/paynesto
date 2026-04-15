# step-01-bootstrap-react-native-submoney

## 목표
React Native + TypeScript 기반의 SubMoney 프로젝트를 초기 부트스트랩하고, Codex가 이후 step 작업을 안정적으로 이어갈 수 있는 기반을 만든다.

## 가정
- 패키지 매니저는 npm을 사용한다.
- React Native 환경 또는 Expo 환경 중 하나를 선택하되, 문서와 실제 구현은 일관되게 유지한다.
- 백엔드는 초기 MVP에서 Firebase를 우선 검토한다.
- 환율 데이터는 클라이언트에서 직접 제3자 API를 호출하지 않고 서버 함수 또는 프록시를 통해 받는다.

## 범위
이번 step에서는 아래를 포함한다.
- React Native TypeScript 프로젝트 초기화
- 기본 디렉터리 구조 생성
- navigation / query / state 기본 세팅
- 공통 디자인 토큰 초안 작성
- auth / subscriptions / money-plan / exchange-rate feature 폴더 생성
- 환경변수 및 서비스 경계 초안 작성
- AGENTS.md, README.md, 계획 문서 정리

이번 step에서는 아래를 제외한다.
- 실제 인앱결제 연동
- 실제 푸시 알림 발송
- 실제 환율 API 연동 완료
- 실제 구독 CRUD 완성

## 구현 단계
1. React Native TypeScript 프로젝트 생성
2. lint / typecheck / test 스크립트 정리
3. src 디렉터리 및 feature-based 구조 생성
4. navigation root 구성
5. 공통 UI 컴포넌트 기본 골격 생성
6. 도메인 타입 파일 생성
7. exchange-rate service interface 정의
8. 홈 / 구독 / 돈관리 / 마이페이지 placeholder screen 연결
9. 문서 정리 및 실행 규칙 반영

## 리스크
- Expo와 React Native CLI 선택이 늦어지면 네이티브 연동 범위가 흔들릴 수 있다.
- 환율 기능의 서버 구조를 늦게 정하면 추후 secret 관리 방식이 어긋날 수 있다.
- 초기 구조가 과도하게 복잡하면 MVP 속도가 떨어질 수 있다.

## 검증 방법
- 앱이 기본 탭 구조로 실행된다.
- TypeScript strict 설정이 유지된다.
- lint / typecheck / test가 실패 없이 동작하거나, 미구현 항목의 이유가 문서에 기록된다.
- feature 폴더 구조와 서비스 인터페이스가 이후 step 확장에 무리 없게 배치된다.
