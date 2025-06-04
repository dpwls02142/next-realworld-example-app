# ![Next.js + SWR Example App](project-logo.png)

## 🐿️ 소개
본 프로젝트는 [Next.js + SWR](https://github.com/reck1ess/next-realworld-example-app) 레포를 베이스로 Next.js를 공부하기 위해 만들어진 레포입니다.</br>
공부 내용은 [해당 사이트](https://growth-log-kappa.vercel.app/blog/projects/realworld/%EB%93%A4%EC%96%B4%EA%B0%80%EB%A9%B0)에서 볼 수 있습니다.

## 🐿️ 계획
### **1단계: 프로젝트 구조 분석 및 API 이해**
- 아키텍처 구조 분석
- 상태 관리 방식 이해 및 API 통신 디버깅
### **2단계: 코드 분석**
- [토스의 frontend-fundamentals](https://frontend-fundamentals.com/code-quality/code/) 문서를 보며 코드 톺아보기
### **3단계: UI/UX 개선**
1. **댓글 삭제시 경고**
    - `window.confirm()` 또는 커스텀 모달
2. **태그 입력**
    - 공백만 입력 시 알림
    - 중복 태그 방지
    - 키보드 처리 뿐만 아니라 시각적으로도 입력 보조
3. **마크다운 에디터**
    - WYSIWYG 에디터 (`React Quill`, `TipTap` 등) 도입
4. **프로필 화면**
	- 각 Form별로 label 추가
    - Bio 입력창: 크기 고정 + `overflow: auto`
    - Reset 버튼 추가
5. **홈/피드**
    - Global Feed가 홈임을 명확히 표현하거나,
    - Home navigation 자체를 삭제
6. **404 페이지 커스터마이징**

### **4단계: 심화학습 및 마이그레이션**

1. **Form 관리 개선**
    - **현재**: 수동으로 폼 상태를 관리
    - **학습 대상**: TanStack Form 및 React Hook Form 비교 분석

2. **서버 상태 관리 개선**
    - **현재**: SWR 사용 중
    - **학습 대상**: TanStack Query와 비교 분석

3. **클라이언트 상태 관리 개선**
    - **현재**: 컴포넌트별 로컬 상태 관리 (useState/useReducer)
    - **학습 대상**: Zustand, Jotai 등 상태 관리 라이브러리 비교 분석

4. **공통 학습 사항**
    - 각 라이브러리별 장단점 비교
    - 마이그레이션 과정에서 겪은 문제점과 해결책
    - 최종 선택 근거 및 적용 결과 정리

## 🐿️ 실행 방법
### 준비사항
- Node.js 14.x 버전
- Docker (백엔드 실행용)

### Backend 실행
```bash
# Docker 설치 후 실행
docker run -d -p 8000:8000 --name realworld-backend realworldio/django-drf
# 서버 확인
curl http://localhost:8000/api/
```

### Frontend 실행
```bash
# 의존성 설치
npm install
# 개발 서버 실행 (포트: 4000)
npm run dev
# 빌드
npm run build
# 프로덕션 실행
npm run start
```

프로젝트 세팅과 관련 된 자세한 글은 [여기서](https://growth-log-kappa.vercel.app/blog/projects/realworld/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%84%B8%ED%8C%85) 보실 수 있습니다.

## 🐿️ 기술 스택
- Next.js (v9.5.1)
- React (v16.13.1)
- TypeScript (v3.9.7)
- SWR (v0.3.0)

## 🐿️ 원본 README
<details>
<summary><span style="font-size: 18px;">README</span></summary>

  # ![Next.js + SWR Example App](project-logo.png)

  > ### Next.js + SWR codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

  ### [Demo](https://next-realworld.now.sh/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

  Originally created for this [GH issue](https://github.com/gothinkster/realworld/issues/336). The codebase is now feature complete; please submit bug fixes via pull requests & feedback via issues.

  We're currently working on some docs for the codebase (explaining where functionality is located, how it works, etc) but most things should be self explanatory if you have a minimal understanding of Next.js/SWR.

  ## Getting started

  You can view a live demo over at [https://next-realworld.now.sh/](https://next-realworld.now.sh/)

  To get the frontend running locally:

  - Clone this repo
  - `npm install` to install all dependencies
  - `npm run dev` to start the local server

  ### Making requests to the backend API

  For convenience, we have a live API server running at `https://conduit.productionready.io/api` for the application to make requests against. You can view [the API spec here](https://github.com/GoThinkster/productionready/blob/master/api) which contains all routes & responses for the server.

  The source code for the backend server (available for Node, Rails and Django) can be found in the [main RealWorld repo](https://github.com/gothinkster/realworld).

  If you want to change the API URL to a local server, simply edit `lib/utils/constant.js` and change `SERVER_BASE_URL` to the local server's URL (i.e. `localhost:3000/api`)

  ## Functionality overview

  The example application is a social blogging site (i.e. a Medium.com clone) called "Conduit". It uses a custom API for all requests, including authentication. You can view a live demo over at [https://next-realworld.now.sh/](https://next-realworld.now.sh/)

  **General functionality:**

  - Authenticate users via JWT (login/register pages + logout button on settings page)
  - CRU\* users (sign up & settings page - no deleting required)
  - CRUD Articles
  - CR\*D Comments on articles (no updating required)
  - GET and display paginated lists of articles
  - Favorite articles
  - Follow other users

  **The general page breakdown looks like this:**

  - Home page (URL: /)
    - List of tags
    - List of articles pulled from either Feed, Global, or by Tag
    - Pagination for list of articles
  - Sign in/Sign up pages (URL: /user/login, /user/register)
    - Use JWT (store the token in localStorage)
  - Settings page (URL: /user/settings )
  - Editor page to create/edit articles (URL: /editor/new, /editor/article-slug-here)
  - Article page (URL: /article/article-slug-here)
    - Delete article button (only shown to article's author)
    - Render markdown from server client side
    - Comments section at bottom of page
    - Delete comment button (only shown to comment's author)
  - Profile page (URL: /profile/username-here, /profile/username-here?favorite=true)
    - Show basic user info
    - List of articles populated from author's created articles or author's favorited articles

  <br />

  [![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)

</details>