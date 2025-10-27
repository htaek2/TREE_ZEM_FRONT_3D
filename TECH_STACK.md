# TREE ZEM FRONT 3D - 기술 스택 문서

## 프로젝트 개요
- **프로젝트명**: TREE ZEM FRONT 3D
- **버전**: 0.0.0
- **프로젝트 타입**: 에너지 모니터링 3D 시각화 웹 애플리케이션

---

## 핵심 기술 스택

### 1. 프레임워크 및 라이브러리

#### React 생태계
- **React** `^19.1.1` - 최신 버전의 React 프레임워크
- **React DOM** `^19.1.1` - React 렌더링 엔진
- **React Router DOM** `^7.9.4` - SPA 라우팅 관리

#### 빌드 도구
- **Vite** `^7.1.7` - 차세대 프론트엔드 빌드 도구
  - 빠른 HMR (Hot Module Replacement)
  - ES 모듈 기반 개발 서버
  - 최적화된 프로덕션 빌드

### 2. 3D 그래픽스 및 시각화

#### Three.js 생태계
- **Three.js** `^0.180.0` - WebGL 기반 3D 그래픽스 라이브러리
- **@react-three/fiber** `^9.4.0` - React용 Three.js 렌더러
- **@react-three/drei** `^10.7.6` - React Three Fiber 유틸리티 컬렉션
- **@react-spring/three** `^10.0.3` - 3D 애니메이션 라이브러리

**주요 기능:**
- 3D 건물 모델 렌더링
- 카메라 제어 및 인터랙션
- 층별 장비 시각화
- 반응형 3D 뷰포트

### 3. UI/UX 라이브러리

#### Material-UI (MUI)
- **@mui/material** `^7.3.4` - Material Design 컴포넌트 라이브러리
- **@mui/x-date-pickers** `^8.14.1` - 날짜/시간 선택 컴포넌트

#### 스타일링
- **styled-components** `^6.1.19` - CSS-in-JS 스타일링 솔루션
- **@emotion/react** `^11.14.0` - CSS-in-JS 라이브러리
- **@emotion/styled** `^11.14.1` - Emotion 기반 스타일드 컴포넌트

**스타일링 전략:**
- styled-components를 주로 사용
- MUI의 Emotion 통합
- 컴포넌트 레벨 스타일 캡슐화

### 4. 데이터 시각화 및 차트

- **Chart.js** `^4.5.1` - 강력한 차트 라이브러리
- **react-chartjs-2** `^5.3.0` - React용 Chart.js 래퍼
- **react-animated-numbers** `^1.1.1` - 숫자 애니메이션 컴포넌트

**차트 활용:**
- 에너지 사용량 그래프
- 월별/일별 통계 시각화
- 실시간 데이터 모니터링

### 5. 유틸리티 라이브러리

- **dayjs** `^1.11.18` - 경량 날짜/시간 처리 라이브러리

---

## 개발 도구 (DevDependencies)

### 코드 품질 관리

#### ESLint
- **eslint** `^9.36.0` - JavaScript/JSX 린터
- **@eslint/js** `^9.36.0` - ESLint 기본 설정
- **eslint-plugin-react-hooks** `^5.2.0` - React Hooks 규칙
- **eslint-plugin-react-refresh** `^0.4.20` - React Fast Refresh 플러그인

### 타입 정의
- **@types/react** `^19.1.13` - React 타입 정의
- **@types/react-dom** `^19.1.9` - React DOM 타입 정의

### 빌드 및 개발
- **@vitejs/plugin-react** `^5.0.3` - Vite용 React 플러그인
- **globals** `^16.4.0` - 전역 변수 정의

---

## 프로젝트 구조

### 주요 디렉토리
```
src/
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── Login.jsx
│   ├── BrandClock.jsx
│   └── HiddenToggle.jsx
├── three/            # Three.js 3D 관련 컴포넌트
│   ├── SceneContainer.jsx
│   ├── CameraController.jsx
│   ├── Model.jsx
│   └── BackgroundManager.jsx
├── modal/            # 모달 컴포넌트
│   ├── Analysis.jsx
│   ├── Condition.jsx
│   ├── Emission.jsx
│   └── ModalComponents/
│       ├── Energy.jsx
│       └── EnergyStyle.jsx
├── data/             # 정적 데이터
│   └── nodeInfo.js
├── App.jsx           # 메인 애플리케이션
├── dashboard.jsx     # 대시보드
├── main.jsx          # 애플리케이션 진입점
└── constants.js      # 상수 정의
```

---

## 개발 환경 설정

### 개발 서버
- **Host**: 0.0.0.0 (네트워크 접근 허용)
- **Port**: 3000
- **Proxy**: `/api` 경로를 `http://localhost:7770/`로 프록시
  - SSE (Server-Sent Events) 지원
  - WebSocket 지원
  - 타임아웃 비활성화 (긴 연결 지원)

### 빌드 명령어
```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # 코드 린팅
```

---

## 주요 기능별 기술 스택 매핑

### 3D 시각화
- **Three.js** - 3D 렌더링 엔진
- **React Three Fiber** - React 통합
- **React Three Drei** - 3D 유틸리티 (카메라, 조명, 로더 등)
- **React Spring** - 3D 애니메이션

### 실시간 데이터 처리
- **SSE (Server-Sent Events)** - 실시간 에너지 데이터 수신
- **EventSource API** - 서버와의 지속적 연결

### 에너지 모니터링 대시보드
- **Chart.js** - 사용량 차트
- **React Animated Numbers** - 실시간 수치 애니메이션
- **Day.js** - 날짜/시간 처리

### UI 컴포넌트
- **Material-UI** - 기본 UI 컴포넌트
- **styled-components** - 커스텀 스타일링
- **React Router** - 페이지 네비게이션

---

## 브라우저 호환성

- **ES Module** 기반 - 모던 브라우저 지원
- **WebGL** 필수 - 3D 그래픽스 렌더링
- **EventSource API** - 실시간 데이터 스트리밍

---

## 성능 최적화

### Vite 최적화
- ESM 기반 개발 서버로 빠른 시작 시간
- HMR을 통한 즉각적인 업데이트
- 트리 쉐이킹을 통한 번들 크기 최적화

### React 최적화
- React 19의 최신 기능 활용
- useMemo, useCallback을 통한 렌더링 최적화
- React.Suspense를 통한 코드 스플리팅

### 3D 렌더링 최적화
- Three.js의 효율적인 메모리 관리
- React Three Fiber의 렌더링 최적화
- 필요한 경우에만 3D 씬 업데이트

---

## 보안 및 인증

- 로컬스토리지 기반 사용자 세션 관리
- API 프록시를 통한 CORS 문제 해결
- 인증된 사용자만 데이터 접근 가능

---

## 향후 개선 가능성

### 추가 고려사항
- TypeScript 도입 (현재 JSDoc 기반)
- 상태 관리 라이브러리 (Zustand, Redux 등)
- 테스트 프레임워크 (Jest, React Testing Library)
- PWA (Progressive Web App) 기능
- 3D 모델 LOD (Level of Detail) 최적화

---

## 참고 문서

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Three.js 공식 문서](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Material-UI](https://mui.com/)
- [Chart.js](https://www.chartjs.org/)
- [styled-components](https://styled-components.com/)

---

**작성일**: 2025-10-27
**프로젝트 버전**: 0.0.0
