# CHIT (스트리머 방송 참여 지원 플랫폼)

한 줄 요약 : 방송 참여 줄세우기 시스템

이 프로젝트는 방송 스트리머가 시청자 참여 이벤트 등을 열 때, 시청자 참여자들을 줄세워 관리 할 수 있도록 지원하는 플랫폼입니다.
SSE 이벤트 기반으로 만들어져 실시간 입장/퇴장을 관리할 수 있습니다.


https://github.com/user-attachments/assets/df60d08e-f60b-4b1b-95b0-ba80538bb9a5


### 주 기능

1. 실시간 시청자 대기순서 표시
2. 원하는 시청자 고정 (FIXED PICK)
3. 시청자 강퇴 (BAN)
4. 게임 참여 리스트 확인 (myPage)

---

## 🚀 시작하기

### 1. 레포지토리 클론

```bash
git clone https://github.com/bananana0118/chit_frontend.git
cd chit_frontend
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 📁 폴더 구조

```
📦 public              # 정적 파일(이미지, 폰트 등) 위치
📦 src                 # 모든 소스코드의 루트
 ┣ 📂 app              # Next.js 13+ App Router 구성
 ┣ 📂 components
 ┃ ┣ 📂 atoms          # 가장 작은 단위의 UI 요소 (버튼, 인풋 등)
 ┃ ┣ 📂 layout         # 페이지 전체 레이아웃을 구성하는 컴포넌트
 ┃ ┣ 📂 molecules      # 둘 이상의 atom으로 이루어진 단위 (폼, 카드 등)
 ┃ ┣ 📂 organisms      # 복잡한 UI 블록 (헤더, 리스트 등)
 ┣ 📂 constants        # 상수 모음
 ┣ 📂 errors           # 에러 핸들링 관련 로직
 ┣ 📂 hooks            # 커스텀 React 훅
 ┣ 📂 lib              # 유틸 함수
 ┣ 📂 provider         # 전역 상태 관리 Provider
 ┣ 📂 services         # API 통신 및 비즈니스 로직
 ┃ ┣ 📂 auth           # 인증 관련 서비스
 ┃ ┣ 📂 axios          # Axios 인스턴스 및 설정
 ┃ ┣ 📂 common         # 공통 서비스 로직
 ┃ ┣ 📂 streamer       # 스트리머 관련 API 서비스
 ┃ ┗ 📂 viewer         # 뷰어 관련 API 서비스
 ┣ 📂 store            # 상태 관리(zustand Store 등)
 ┣ 📂 styles           # 전역 및 모듈 스타일 파일
 ┗ 📄 middleware.ts    # Next.js 미들웨어 설정


```

## 🛠 사용 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- ESLint / Prettier
- npm => pnpm 개선 예정

## 📌 커밋 컨벤션

- feat: 새로운 기능 추가

- fix: 버그 수정

- docs: 문서 변경

- style: 코드 스타일 변경 (포맷팅 등)

- refactor: 코드 리팩터링

- test: 테스트 코드 추가/수정

- chore: 기타 변경사항

- setting : 라이브러리 추가 및 설정 추가

```bash
# 예시 커밋 메시지
[feat]: 로그인 버튼 UI 구현

- 로그인 버튼 UI를 세부구현 했습니다. (옵션)
```

## 🔍 브랜치 전략

- main: 배포 브랜치

- dev: 개발 브랜치 (기능 병합 전용)

- feature/이름: 개별 기능 개발 브랜치

## PR 규칙

- PR 제목: [Feat] 기능 이름, [Fix] 버그 설명 등

- PR 생성 시 템플릿을 활용해 작업 내용 명확히 작성

- 리뷰어 지정 필수

- 본인 PR은 최소 1명 이상 리뷰 후 병합

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](./LICENSE)를 따릅니다.
