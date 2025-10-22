# 카메라 이동 및 움직임 시스템 문서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [주요 컴포넌트](#주요-컴포넌트)
3. [카메라 상태 관리](#카메라-상태-관리)
4. [카메라 이동 트리거](#카메라-이동-트리거)
5. [카메라 이동 흐름](#카메라-이동-흐름)
6. [반응형 카메라 설정](#반응형-카메라-설정)
7. [알려진 이슈](#알려진-이슈)

---

## 시스템 개요

3D 건물 뷰어의 카메라 시스템은 사용자 인터랙션에 따라 **전체 뷰**와 **층별 상세 뷰** 간 부드러운 전환을 제공합니다.

### 핵심 기능
- ✅ 플로어 버튼 클릭 시 해당 층으로 카메라 이동
- ✅ 3D 모델 직접 클릭 시 해당 층으로 카메라 이동
- ✅ 전체보기(Home) 버튼으로 초기 위치 복귀
- ✅ 반응형 화면 크기별 카메라 위치 자동 조정
- ✅ OrbitControls를 통한 수동 카메라 조작

---

## 주요 컴포넌트

### 1. App.jsx
**역할**: 최상위 상태 관리 및 카메라 설정 제공

```javascript
// 반응형 카메라 설정 생성
const getResponsiveCameraSettings = (isAuthenticated) => {
  const width = window.innerWidth;

  if (width >= 768) {
    return {
      defaultPosition: [-60, 32, 22],      // 전체 뷰 위치
      f1activePosition: [-15, 80, 10],     // 1층 상세 뷰
      f2activePosition: [-15, 15, 10],     // 2층 상세 뷰
      f3activePosition: [-15, 20, 10],     // 3층 상세 뷰
      f4activePosition: [-15, 25, 10],     // 4층 상세 뷰
      defaultFov: 40,                       // 전체 뷰 시야각
      activeFov: 30,                        // 상세 뷰 시야각
      minDistance: 35,
      maxDistance: 55,
      target: [13, 5, -8],                  // 카메라가 바라보는 지점
    };
  }
};
```

**주요 상태**:
- `cameraSettings`: 현재 화면 크기에 맞는 카메라 설정
- `active`: `{ active: boolean, model: string }` - 현재 선택된 층 정보

---

### 2. CameraController.jsx
**역할**: 카메라 위치 애니메이션 및 FOV 제어

```javascript
function CameraController({ active, cameraSettings }) {
  const { camera } = useThree();

  useEffect(() => {
    // 1. 목표 위치 결정
    const targetPosition = active.active && active.model === 'f1'
      ? cameraSettings.f1activePosition
      : active.active && active.model === 'f2'
      ? cameraSettings.f2activePosition
      : active.active && active.model === 'f3'
      ? cameraSettings.f3activePosition
      : active.active && active.model === 'f4'
      ? cameraSettings.f4activePosition
      : cameraSettings.defaultPosition;

    // 2. FOV 업데이트
    const targetFov = active.active
      ? cameraSettings.activeFov
      : cameraSettings.defaultFov;

    // 3. 부드러운 애니메이션 (lerp)
    const animateCamera = () => {
      progress += 0.04;
      if (progress < 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress);
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  }, [active, cameraSettings, camera]);
}
```

**애니메이션 방식**:
- `Vector3.lerpVectors()`: 선형 보간법으로 부드러운 이동
- `progress += 0.04`: 초당 약 1.5초 소요 (60fps 기준)
- `requestAnimationFrame`: 브라우저 렌더링 사이클과 동기화

---

### 3. SceneContainer.jsx
**역할**: 3D 씬 구성 및 모델 클릭 이벤트 처리

```javascript
const handleModelClick = (e, modelName) => {
  if (modelName === "top") return; // 옥상은 클릭 무시

  // OrbitControls 타겟 업데이트
  const pos = e.object.position;
  controlsRef.current.target.copy(pos);
  controlsRef.current.update();

  // 상태 토글
  setActive({
    active: !active.active,
    model: active.model === modelName ? null : modelName,
  });
};
```

**OrbitControls 설정**:
```javascript
<OrbitControls
  ref={controlsRef}
  target={cameraSettings.target}
  enableRotate={true}
  enableZoom={true}
  enablePan={true}
  enableDamping={true}
  dampingFactor={0.05}
  minDistance={35}
  maxDistance={55}
  maxPolarAngle={80°}  // 카메라가 바닥 아래로 내려가지 않도록 제한
/>
```

---

### 4. Wing.jsx
**역할**: UI 버튼 클릭 이벤트 처리

```javascript
// 플로어 버튼 클릭 핸들러
const handleModelButtonClick = (modelName) => {
  if (modelName === "top") return;
  setActive({ active: true, model: modelName });
  setSelectedDevice(null);
};

// 전체보기 버튼
<FloorButton onClick={() => setActive({ active: false, model: null })}>
  <img src="Icon/Home_logo.svg" alt="전체보기" />
</FloorButton>

// 층별 버튼
{MODELS.filter(m => m !== "top").map(modelName => (
  <FloorButton onClick={() => handleModelButtonClick(modelName)}>
    {MODEL_TO_FLOOR[modelName] + 1}F
  </FloorButton>
))}
```

---

## 카메라 상태 관리

### Active 상태 구조
```javascript
{
  active: boolean,  // true: 층 선택됨, false: 전체 뷰
  model: string     // 'f1' | 'f2' | 'f3' | 'f4' | null
}
```

### 상태 변화 예시
```javascript
// 초기 상태 (전체 뷰)
{ active: false, model: null }

// 1층 선택
{ active: true, model: 'f1' }

// 동일 층 다시 클릭 (토글)
{ active: false, model: null }

// 다른 층 선택
{ active: true, model: 'f2' }
```

---

## 카메라 이동 트리거

### 1. 플로어 버튼 클릭
**위치**: `Wing.jsx:788`
```
사용자 클릭 → handleModelButtonClick()
            ↓
      setActive({ active: true, model: 'f1' })
            ↓
      CameraController useEffect 감지
            ↓
      카메라 애니메이션 시작
```

### 2. 3D 모델 직접 클릭
**위치**: `SceneContainer.jsx:13`
```
사용자 클릭 → handleModelClick()
            ↓
      OrbitControls target 업데이트
            ↓
      setActive({ active: true, model: 'f1' })
            ↓
      CameraController useEffect 감지
            ↓
      카메라 애니메이션 시작
```

### 3. 전체보기 버튼 클릭
**위치**: `Wing.jsx:780`
```
사용자 클릭 → setActive({ active: false, model: null })
            ↓
      CameraController useEffect 감지
            ↓
      defaultPosition으로 애니메이션
```

### 4. 화면 크기 변경
**위치**: `App.jsx:75-76`
```
창 크기 변경 → getResponsiveCameraSettings() 재실행
            ↓
      새로운 cameraSettings 생성
            ↓
      CameraController 두 번째 useEffect 감지
            ↓
      카메라 즉시 이동 (애니메이션 없음)
```

---

## 카메라 이동 흐름

### 전체 흐름도

```
┌─────────────────────────────────────────────────────┐
│                    App.jsx                          │
│  - cameraSettings 생성 및 관리                       │
│  - active 상태 관리                                  │
└─────────────┬───────────────────────────────────────┘
              │
              ├─ cameraSettings ──┐
              │                   │
              ├─ active ──────────┤
              │                   ↓
┌─────────────▼─────────┐   ┌────────────────────────┐
│   SceneContainer      │   │  CameraController      │
│  - 3D 모델 렌더링      │   │  - 카메라 위치 제어     │
│  - 클릭 이벤트 처리    │   │  - FOV 제어            │
│  - OrbitControls      │   │  - 애니메이션 처리      │
└──────┬────────────────┘   └────────────────────────┘
       │
       ├─ handleModelClick()
       │
       ▼
┌─────────────────────┐
│      Wing.jsx       │
│  - UI 버튼 렌더링    │
│  - 버튼 클릭 처리    │
└─────────────────────┘
```

### 상세 실행 흐름

#### Step 1: 사용자 인터랙션
```
[플로어 버튼] 또는 [3D 모델 클릭]
       ↓
handleModelButtonClick('f2') 또는 handleModelClick(event, 'f2')
       ↓
setActive({ active: true, model: 'f2' })
```

#### Step 2: 상태 전파
```
App.jsx의 active 상태 업데이트
       ↓
props를 통해 CameraController에 전달
       ↓
CameraController의 useEffect 트리거
```

#### Step 3: 카메라 애니메이션
```
CameraController useEffect 실행
       ↓
1. targetPosition 계산
   - active.model === 'f2' ? f2activePosition : ...
       ↓
2. targetFov 계산
   - active.active ? activeFov : defaultFov
       ↓
3. camera.fov 업데이트
   - camera.updateProjectionMatrix() 호출
       ↓
4. 애니메이션 시작
   - startPosition = 현재 위치
   - endPosition = 목표 위치
   - progress = 0
       ↓
5. requestAnimationFrame 루프
   - progress += 0.04 (25 프레임 = 약 1.5초)
   - camera.position.lerpVectors(start, end, progress)
   - progress < 1이면 계속 반복
       ↓
6. 애니메이션 완료
   - camera.position.copy(endPosition)
```

#### Step 4: OrbitControls 동기화
```
SceneContainer의 OrbitControls
       ↓
target = cameraSettings.target
       ↓
사용자 마우스 드래그 시 카메라 수동 제어 가능
```

---

## 반응형 카메라 설정

### 화면 크기별 설정

#### 모바일 (width < 768px)
```javascript
{
  defaultPosition: [-50, 30, 20],
  activePosition: [15, 8, 0],
  defaultFov: 50,
  activeFov: 60,
  minDistance: 30,
  maxDistance: 60,
  target: [13, 8, -8]
}
```

#### 태블릿/PC (width >= 768px)
```javascript
{
  defaultPosition: [-60, 32, 22],
  f1activePosition: [-15, 80, 10],
  f2activePosition: [-15, 15, 10],
  f3activePosition: [-15, 20, 10],
  f4activePosition: [-15, 25, 10],
  defaultFov: 40,
  activeFov: 30,
  minDistance: 35,
  maxDistance: 55,
  target: [13, 5, -8]
}
```

### 위치 좌표 해석
```
카메라 위치: [X, Y, Z]
- X: 좌(-)/우(+), 음수 = 건물 왼쪽에서 바라봄
- Y: 아래(-)/위(+), 양수 = 건물 위에서 내려다봄
- Z: 앞(-)/뒤(+), 양수 = 건물 앞에서 바라봄

예시: [-60, 32, 22]
→ 건물 왼쪽 앞에서, 약간 높은 곳에서 바라보는 시점
```

### FOV (시야각) 영향
```
FOV 작을수록 (30) → 망원 렌즈 효과 (확대됨)
FOV 클수록 (50) → 광각 렌즈 효과 (축소됨)

전체 뷰: 40° → 건물 전체가 보이도록
상세 뷰: 30° → 특정 층에 집중하도록
```

---

## 알려진 이슈

### 1. CameraController의 중복 useEffect

**문제**:
```javascript
// 첫 번째 useEffect (line 8-47)
useEffect(() => {
  // 애니메이션으로 이동
  animateCamera();
}, [active, cameraSettings, camera]);

// 두 번째 useEffect (line 50-69)
useEffect(() => {
  // 즉시 이동 (애니메이션 없음)
  camera.position.set(...targetPosition);
}, [cameraSettings]);
```

**영향**:
- 화면 크기 변경 시 두 useEffect가 모두 실행됨
- 두 번째 useEffect가 첫 번째의 애니메이션을 덮어쓸 수 있음
- 카메라 움직임이 의도와 다를 수 있음

**해결 방안**:
```javascript
// 통합된 단일 useEffect
useEffect(() => {
  const targetPosition = /* ... 위치 계산 ... */;
  const targetFov = /* ... FOV 계산 ... */;

  // 화면 크기 변경인지 active 변경인지 구분
  const isResizeEvent = prevCameraSettings !== cameraSettings;

  if (isResizeEvent) {
    // 즉시 이동
    camera.position.set(...targetPosition);
  } else {
    // 애니메이션 이동
    animateCamera();
  }
}, [active, cameraSettings, camera]);
```

### 2. 층별 activePosition 불일치

**문제**:
- 모바일에서는 `activePosition` 하나만 존재
- PC에서는 `f1activePosition`, `f2activePosition` 등 층별 위치 존재
- 조건문에서 fallback이 `cameraSettings.defaultPosition`으로 되어 있음

**영향**:
- 모바일에서 층 선택 시 의도한 위치로 이동하지 않을 수 있음

**해결 방안**:
```javascript
const targetPosition = active.active
  ? (cameraSettings[`${active.model}activePosition`] ||
     cameraSettings.activePosition ||
     cameraSettings.defaultPosition)
  : cameraSettings.defaultPosition;
```

### 3. OrbitControls target 업데이트 타이밍

**문제**:
```javascript
// SceneContainer.jsx:19-21
const pos = e.object.position;
controlsRef.current.target.copy(pos);  // 클릭한 모델 위치로 target 변경
controlsRef.current.update();
```

- 클릭 시마다 OrbitControls의 target이 모델 위치로 변경됨
- 그러나 OrbitControls props의 `target={cameraSettings.target}`과 충돌 가능
- props의 target이 다시 적용되어 의도한 동작이 무시될 수 있음

**해결 방안**:
- OrbitControls를 비제어 컴포넌트로 사용 (props에서 target 제거)
- 또는 handleModelClick에서 target 업데이트 제거

### 4. 애니메이션 중 사용자 조작 충돌

**문제**:
- 카메라 애니메이션 진행 중에도 OrbitControls가 활성화되어 있음
- 사용자가 마우스로 드래그하면 애니메이션과 충돌

**해결 방안**:
```javascript
// 애니메이션 중 OrbitControls 일시 비활성화
const animateCamera = () => {
  if (progress === 0) {
    controlsRef.current.enabled = false;
  }

  progress += 0.04;

  if (progress < 1) {
    camera.position.lerpVectors(startPosition, endPosition, progress);
    requestAnimationFrame(animateCamera);
  } else {
    camera.position.copy(endPosition);
    controlsRef.current.enabled = true;  // 애니메이션 완료 후 재활성화
  }
};
```

---

## 성능 최적화 팁

### 1. 애니메이션 속도 조절
```javascript
// 현재: progress += 0.04 (약 1.5초)
// 빠르게: progress += 0.08 (약 0.75초)
// 느리게: progress += 0.02 (약 3초)
```

### 2. Easing 함수 적용
```javascript
// 선형 보간 대신 easeInOutCubic 사용
const easeInOutCubic = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const easedProgress = easeInOutCubic(progress);
camera.position.lerpVectors(startPosition, endPosition, easedProgress);
```

### 3. 불필요한 리렌더링 방지
```javascript
// useMemo로 targetPosition 계산 최적화
const targetPosition = useMemo(() => {
  if (active.active && active.model === 'f1') {
    return cameraSettings.f1activePosition;
  }
  // ... 나머지 조건
  return cameraSettings.defaultPosition;
}, [active, cameraSettings]);
```

---

## 디버깅 가이드

### 카메라 위치 확인
```javascript
// CameraController.jsx에 로그 추가
console.log("카메라 위치 변경:", {
  from: camera.position.toArray(),
  to: targetPosition,
  fov: targetFov,
  active: active
});
```

### 애니메이션 진행 상황 추적
```javascript
const animateCamera = () => {
  console.log(`애니메이션 진행: ${Math.round(progress * 100)}%`);
  // ... 나머지 코드
};
```

### OrbitControls 상태 확인
```javascript
// SceneContainer.jsx에 추가
useEffect(() => {
  console.log("OrbitControls 상태:", {
    target: controlsRef.current?.target.toArray(),
    enabled: controlsRef.current?.enabled,
    enableRotate: controlsRef.current?.enableRotate
  });
}, [active]);
```

---

## 참고 자료

### 관련 파일
- `src/App.jsx` - 카메라 설정 생성 및 상태 관리
- `src/three/CameraController.jsx` - 카메라 애니메이션 제어
- `src/three/SceneContainer.jsx` - 3D 씬 구성 및 이벤트 처리
- `src/components/Wing.jsx` - UI 버튼 및 클릭 핸들러
- `src/constants.js` - 카메라 관련 상수 정의

### Three.js 문서
- [PerspectiveCamera](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera)
- [Vector3.lerpVectors](https://threejs.org/docs/#api/en/math/Vector3.lerpVectors)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)

### React Three Fiber 문서
- [useThree Hook](https://docs.pmnd.rs/react-three-fiber/api/hooks#usethree)
- [useFrame Hook](https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe)
