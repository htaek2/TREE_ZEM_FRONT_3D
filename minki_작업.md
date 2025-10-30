# 2025-10-17 작업내용


에너지 사용량 요청 조회시 하나의 요청함수안에서 3개의 fetch를 보내야하는 상황
- App.jsx TestFetch 함수 작성 

1️⃣ 순차 처리 (연이어 작성)

  const TestFetch = async () => {
    // 가스
    const gasResponse = await fetch(`api/energy/gas?start=${start}&end=${end}&datetimeType=0`);
    const gasJson = await gasResponse.json();
    console.log('가스:', gasJson);

    // 전력 (가스 끝날 때까지 기다림)
    const elecResponse = await fetch(`api/energy/elec?start=${start}&end=${end}&datetimeType=0`);
    const elecJson = await elecResponse.json();
    console.log('전력:', elecJson);

    // 물 (전력 끝날 때까지 기다림)
    const waterResponse = await fetch(`api/energy/water?start=${start}&end=${end}&datetimeType=0`);
    const waterJson = await waterResponse.json();
    console.log('물:', waterJson);
  }
  문제점: 가스 → 전력 → 물 순서로 하나씩 기다려야 함 (총 시간 = 3초 + 3초 + 3초 = 9초)


2️⃣ 병렬 처리 (Promise.all) 

  const TestFetch = async () => {
    try {
      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = dataFormat(today);
      const end = dataFormat(now);

      // 3개 동시에 요청!
      const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`api/energy/gas?start=${start}&end=${end}&datetimeType=0`),
        fetch(`api/energy/elec?start=${start}&end=${end}&datetimeType=0`),
        fetch(`api/energy/water?start=${start}&end=${end}&datetimeType=0`)
      ]);

      // 3개 동시에 JSON 파싱!
      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json()
      ]);

      console.log('가스:', gasJson);
      console.log('전력:', elecJson);
      console.log('물:', waterJson);

    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  장점: 3개가 동시에 요청됨 (총 시간 = max(3초, 3초, 3초) = 약 3초)



### 학습 
1. promise : promise는 3가지 상태를 가진다. (대기, 이행/완료, 거부/실패)

1️⃣ Pending (대기)

  const promise = fetch('api/data');
  // ⏳ 지금 서버에 요청 보냄 → 응답 기다리는 중 (Pending 상태)

  2️⃣ Fulfilled (이행/완료)

  const promise = fetch('api/data');
  // ✅ 서버 응답 성공! → Fulfilled 상태
  // → .then() 또는 await로 결과 받을 수 있음

  3️⃣ Rejected (거부/실패)

  const promise = fetch('api/data');
  // ❌ 서버 오류! → Rejected 상태
  // → .catch() 또는 try-catch로 에러 처리

  ---
  🔄 Promise.all()의 동작 원리

  const [res1, res2, res3] = await Promise.all([
    fetch('api/gas'),    // 요청1 시작 (Pending)
    fetch('api/elec'),   // 요청2 시작 (Pending)
    fetch('api/water')   // 요청3 시작 (Pending)
  ]);

  // 여기서 await는 3개 모두 Fulfilled될 때까지 대기!
  // 하나라도 Rejected되면 즉시 에러 발생

  타임라인 예시

  시간 0초: 3개 요청 동시 출발 🚀🚀🚀
    ├─ gas:   [Pending...]
    ├─ elec:  [Pending...]
    └─ water: [Pending...]

  시간 2초:
    ├─ gas:   [Fulfilled] ✅
    ├─ elec:  [Pending...]
    └─ water: [Pending...]

  시간 3초:
    ├─ gas:   [Fulfilled] ✅
    ├─ elec:  [Fulfilled] ✅
    └─ water: [Fulfilled] ✅

  → 모두 완료! await 끝나고 다음 코드 실행

  ---
  💡 순차 vs 병렬 비교

  순차 (await 3번)

  const res1 = await fetch('api/gas');    // 3초 기다림
  const res2 = await fetch('api/elec');   // 3초 기다림
  const res3 = await fetch('api/water');  // 3초 기다림
  // 총 9초

  병렬 (Promise.all)

  const [res1, res2, res3] = await Promise.all([
    fetch('api/gas'),
    fetch('api/elec'),
    fetch('api/water')
  ]);
  // 총 3초 (가장 오래 걸리는 것 기준)
  

# 2025-10-21 깃관련 문제해결
# Git Pull 충돌 해결 기록

## 문제 발견
**날짜**: 2025-10-21
**상황**: `git pull` 실행 시 에러 발생

### 에러 메시지
```
error: Your local changes to the following files would be overwritten by merge:
	src/components/Wing.jsx
	vite.config.js
Please commit your changes or stash them before you merge.
Aborting
```

## 문제 진단

### 1단계: 현재 상태 확인
```bash
git status
```

**결과**:
- 로컬 브랜치가 원격(origin/main)보다 2개 커밋 뒤처짐
- 로컬에서 7개 파일 수정됨:
  - README.md
  - src/App.jsx
  - src/components/Wing.jsx
  - src/components/Wing2.jsx
  - src/modal/Condition.jsx
  - src/modal/ModalComponents/Energy.jsx
  - vite.config.js

### 2단계: 원격 변경사항 확인
```bash
git fetch
git diff HEAD..origin/main --name-status
```

**결과**:
- 원격에서 변경된 파일:
  - `Wing.jsx` (603줄 수정)
  - `vite.config.js` (3줄 수정)

### 충돌 원인
**동일한 파일이 로컬과 원격 양쪽에서 수정됨**:
- ⚠️ `Wing.jsx` - 로컬 수정 + 원격 수정
- ⚠️ `vite.config.js` - 로컬 수정 + 원격 수정

나머지 5개 파일은 로컬에서만 수정되어 충돌 없음:
- ✅ README.md
- ✅ App.jsx
- ✅ Wing2.jsx
- ✅ Condition.jsx
- ✅ Energy.jsx

## 해결 과정

### 상황 판단
- Wing.jsx의 로컬 변경사항은 별도 메모장에 백업되어 있음
- 일단 GitHub 최신 코드를 받아오는 것이 우선

### 해결 방법 선택
**옵션 1**: 로컬 변경사항 커밋 후 병합 (충돌 수동 해결 필요)
**옵션 2**: Stash 사용 (충돌 수동 해결 필요)
**옵션 3**: 충돌 파일만 원격 버전으로 복원 후 pull ✅ **선택됨**

### 실행 단계

#### 1. 충돌 파일을 원격 버전으로 복원
```bash
git restore src/components/Wing.jsx vite.config.js
```
- Wing.jsx와 vite.config.js의 로컬 변경사항을 버림
- 나머지 5개 파일의 로컬 변경사항은 유지

#### 2. 최신 코드 받아오기
```bash
git pull
```

**결과**:
```
Updating fd608ef..84920f1
Fast-forward
 src/components/Wing.jsx | 603 +++++++++++++++++++++---------------------------
 vite.config.js          |   3 +-
 2 files changed, 267 insertions(+), 339 deletions(-)
```

#### 3. 최종 상태 확인
```bash
git status
```

**결과**:
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
	modified:   README.md
	modified:   src/App.jsx
	modified:   src/components/Wing2.jsx
	modified:   src/modal/Condition.jsx
	modified:   src/modal/ModalComponents/Energy.jsx
```

## 해결 결과

### 성공적으로 업데이트된 파일
- ✅ `Wing.jsx` - GitHub 최신 버전으로 업데이트
- ✅ `vite.config.js` - GitHub 최신 버전으로 업데이트

### 로컬 변경사항이 유지된 파일
- ✅ `README.md`
- ✅ `App.jsx`
- ✅ `Wing2.jsx`
- ✅ `Condition.jsx`
- ✅ `Energy.jsx`

### 현재 상태
- 브랜치: main
- 원격과의 동기화: 완료
- 다음 작업: 백업된 Wing.jsx 내용을 최신 코드에 적용

## 교훈

### 이런 상황을 예방하려면
1. **작업 전 항상 최신 코드 받아오기**
   ```bash
   git pull
   ```

2. **작업 시 Feature 브랜치 사용**
   ```bash
   git checkout -b feature/wing-update
   ```

3. **자주 커밋하고 푸시하기**
   ```bash
   git add .
   git commit -m "작업 내용"
   git push
   ```

### 충돌 해결 방법 3가지
1. **로컬 변경사항이 중요한 경우**: Commit → Pull → 충돌 수동 해결
2. **일시적으로 보관**: Stash → Pull → Stash pop → 충돌 수동 해결
3. **로컬 변경사항 백업 있음**: Restore → Pull ✅ (가장 깔끔)

## 참고 명령어

### 상태 확인
```bash
git status                        # 현재 상태
git branch                        # 현재 브랜치
git log --oneline -5              # 최근 커밋 5개
git diff HEAD..origin/main        # 원격과의 차이점
```

### 충돌 해결
```bash
git restore <file>                # 특정 파일 원격 버전으로 복원
git restore .                     # 모든 파일 원격 버전으로 복원
git stash                         # 변경사항 임시 저장
git stash pop                     # 임시 저장 내용 다시 적용
```

### 안전한 작업 흐름
```bash
git fetch                         # 원격 정보 가져오기 (적용X)
git diff HEAD..origin/main        # 차이점 미리 확인
git pull                          # 원격 코드 받아오기
```

---

# 2025-10-30 Three.js 카메라 버그 트러블슈팅

## 문제 발견
**날짜**: 2025-10-30
**상황**: 전체보기 버튼 클릭 후 카메라 확대 정도가 초기 렌더링과 다르게 보임
**심각도**: 중간 (기능은 작동하나 UX 불일치)

### 증상
- ❌ **처음 모델을 그릴 때**: 건물 전체가 특정 각도로 조망됨
- ❌ **층 선택 → 전체보기 복귀 시**: 같은 위치인데 확대 정도와 각도가 다름
- ⚠️ 사용자가 "뭔가 이상하다"고 느끼는 상황

## 문제 진단

### 1단계: 카메라 상태 확인

**초기 렌더링 시**:
```javascript
Camera.position: [-60, 32, 22]
Camera.fov: 40
OrbitControls.target: [13, 5, -8]  ← 건물 중앙 하단
```

**2층 선택 후**:
```javascript
Camera.position: [-15, 150, 30]
Camera.fov: 35
OrbitControls.target: [0, 5, 0]  ← handleFloorButtonClick에서 변경됨
```

**전체보기 복귀 후**:
```javascript
Camera.position: [-60, 32, 22]  ← ✅ 복귀됨
Camera.fov: 40                  ← ✅ 복귀됨
OrbitControls.target: [0, 5, 0] ← ❌ 2층 설정 그대로!
```

### 2단계: 코드 분석

#### 층 선택 시 target 변경 (SceneContainer.jsx:56-60)
```javascript
const handleFloorButtonClick = (modelName) => {
  if (modelName === "top") return;

  // OrbitControls 타겟을 해당 층 위치로 변경
  if (controlsRef.current && constants.FLOOR_HEIGHTS[modelName] !== undefined) {
    const targetY = constants.FLOOR_HEIGHTS[modelName];
    controlsRef.current.target.copy(new THREE.Vector3(0, targetY, 0));
    controlsRef.current.update();  // ← target이 [13, 5, -8] → [0, 5, 0] 변경
  }

  setActive({ active: true, model: modelName });
  setSelectedDevice(null);
};
```

#### 전체보기 버튼 클릭 (Wing.jsx:1308)
```javascript
<FloorButton
  onClick={() => setActive({ active: false, model: null })}  // ← target 초기화 없음!
>
```

#### OrbitControls 설정 (SceneContainer.jsx:140-142)
```javascript
<OrbitControls
  ref={controlsRef}
  target={cameraSettings.target}  // ← props는 초기값일 뿐!
/>
```

### 버그의 핵심 원인

**React의 OrbitControls는 `target` prop 변경을 자동 추적하지 않음**

```javascript
// ❌ 잘못된 기대
// cameraSettings.target이 변경되면 OrbitControls.target도 자동 변경?
// → 아니다! 초기 설정 후에는 ref로만 제어됨

// ✅ 실제 동작
<OrbitControls target={...} />  // 마운트 시 한 번만 적용
controlsRef.current.target.copy(...)  // 수동 변경 시 ref로만 제어
// → prop 변경으로는 업데이트 안 됨!
```

### 왜 확대 정도가 달라 보이는가?

```
초기 렌더링:
Camera [-60, 32, 22] → Target [13, 5, -8]
         ↘
          └→ 건물 오른쪽 하단 방향을 중심으로 회전

전체보기 복귀:
Camera [-60, 32, 22] → Target [0, 5, 0]
         ↘
          └→ 건물 정중앙을 중심으로 회전

결과: 같은 카메라 위치여도 바라보는 중심이 달라 각도/확대 정도가 다르게 보임
```

## 해결 과정

### 해결 방법 선택

**옵션 1**: 전체보기 시 target 명시적 초기화 ✅ **선택됨**
- 장점: 명확하고 직관적, 의도대로 동작
- 단점: 코드 추가 필요

**옵션 2**: useEffect로 active 변경 감지
- 장점: 자동화
- 단점: 의존성 추가, 예상치 못한 재실행 가능

**옵션 3**: OrbitControls 재마운트 (key prop 사용)
- 장점: React스러운 방식
- 단점: 사용자의 수동 회전/줌 상태 초기화됨

### 구현 코드

#### 방법 1: useEffect로 전체보기 시 target 복원

**SceneContainer.jsx에 추가**:
```javascript
// OrbitControls target을 active 상태와 동기화
useEffect(() => {
  if (controlsRef.current && !active.active) {
    // 전체보기 상태일 때만 target 복원
    const initialTarget = new THREE.Vector3(
      cameraSettings.target[0],
      cameraSettings.target[1],
      cameraSettings.target[2]
    );
    controlsRef.current.target.copy(initialTarget);
    controlsRef.current.update();

    console.log('🔄 Target 초기화:', initialTarget.toArray());
  }
}, [active.active, cameraSettings.target]);
```

#### 방법 2: 전체보기 전용 함수 생성 (대안)

**SceneContainer.jsx**:
```javascript
const handleResetToDefaultView = () => {
  // OrbitControls target 초기화
  if (controlsRef.current) {
    const initialTarget = new THREE.Vector3(...cameraSettings.target);
    controlsRef.current.target.copy(initialTarget);
    controlsRef.current.update();
  }

  // Active 상태 초기화
  setActive({ active: false, model: null });
  setSelectedDevice(null);
};

// Wing에 전달
useEffect(() => {
  if (onFloorButtonClick) {
    onFloorButtonClick.current = handleFloorButtonClick;
  }
  if (onResetView) {
    onResetView.current = handleResetToDefaultView;
  }
}, [onFloorButtonClick, onResetView, cameraSettings]);
```

**App.jsx**:
```javascript
const onResetView = useRef(null);

<SceneContainer
  // ... 기존 props
  onResetView={onResetView}
/>

<Wing
  // ... 기존 props
  onResetView={onResetView}
/>
```

**Wing.jsx**:
```javascript
<FloorButton
  onClick={() => {
    if (onResetView?.current) {
      onResetView.current();
    } else {
      // fallback
      setActive({ active: false, model: null });
    }
  }}
>
  <FloorImg src="public/Icon/Home_logo.svg" alt="전체보기" />
</FloorButton>
```

## 검증 방법

### 콘솔 디버깅 추가

```javascript
// SceneContainer.jsx에 임시 디버깅 코드
useEffect(() => {
  if (controlsRef.current) {
    console.log('🎯 카메라 상태:', {
      'cameraSettings.target': cameraSettings.target,
      'OrbitControls.target': controlsRef.current.target.toArray(),
      'Camera.position': controlsRef.current.object.position.toArray(),
      'active.active': active.active,
      'active.model': active.model
    });
  }
}, [active, cameraSettings]);
```

### 테스트 시나리오

1. ✅ **초기 로딩**
   - target이 [13, 5, -8]인지 확인

2. ✅ **2층 선택**
   - target이 [0, 5, 0]으로 변경되는지 확인

3. ✅ **전체보기 클릭**
   - target이 [13, 5, -8]로 복원되는지 확인
   - 초기 렌더링과 동일한 화면인지 확인

### 예상 결과

**수정 전**:
```
초기: props target [13, 5, -8] | actual target [13, 5, -8] ✅
2층: props target [13, 5, -8] | actual target [0, 5, 0] ⚠️ 불일치
전체: props target [13, 5, -8] | actual target [0, 5, 0] ❌ 불일치
```

**수정 후**:
```
초기: props target [13, 5, -8] | actual target [13, 5, -8] ✅
2층: props target [13, 5, -8] | actual target [0, 5, 0] ⚠️ 불일치 (의도된 동작)
전체: props target [13, 5, -8] | actual target [13, 5, -8] ✅ 일치!
```

## 해결 결과

### 적용된 수정사항
- ✅ **방법 1 적용**: useEffect로 전체보기 시 target 자동 복원
- ✅ **디버깅 로그 추가**: 콘솔에서 target 상태 추적 가능
- ✅ **테스트 완료**: 초기 렌더링과 전체보기 복귀 화면 일치

### 수정 전후 비교

| 상황 | 수정 전 | 수정 후 |
|------|---------|---------|
| **초기 렌더링** | 건물 전체 조망 | 동일 |
| **2층 선택** | 2층 중심 확대 | 동일 |
| **전체보기 복귀** | ❌ 약간 다른 각도/확대 | ✅ 초기 렌더링과 동일 |
| **사용자 경험** | ⚠️ "뭔가 이상함" | ✅ 일관된 동작 |

### 기대 효과
- ✅ 전체보기 버튼이 진정한 "초기 상태 복귀" 역할 수행
- ✅ 일관된 사용자 경험 제공
- ✅ 예측 가능한 카메라 동작

## 교훈

### Three.js OrbitControls 사용 시 주의사항

1. **Props는 초기값일 뿐**
   ```javascript
   <OrbitControls target={[0, 0, 0]} />
   // ← 마운트 시에만 적용됨, 이후 prop 변경 무시됨
   ```

2. **ref로 직접 제어 필요**
   ```javascript
   controlsRef.current.target.copy(new THREE.Vector3(...));
   controlsRef.current.update();  // ← 반드시 update() 호출!
   ```

3. **상태 동기화 필수**
   - React state 변경 ≠ Three.js 객체 변경
   - useEffect로 명시적 동기화 필요

### React + Three.js 통합 시 고려사항

1. **Declarative vs Imperative**
   - React: 선언적 (props 변경 → 자동 반영)
   - Three.js: 명령형 (메서드 직접 호출)
   - → 수동 동기화 로직 필요

2. **상태 관리 전략**
   ```javascript
   // ❌ 나쁜 예: Three.js 객체를 state로 관리
   const [controls, setControls] = useState(null);

   // ✅ 좋은 예: ref로 관리, state는 React 영역만
   const controlsRef = useRef();
   const [active, setActive] = useState(...);
   ```

3. **디버깅 팁**
   - 콘솔에 props vs actual 상태 비교 로그 필수
   - Three.js Inspector 확장 프로그램 활용
   - toArray()로 Vector3/Quaternion 가독성 향상

### 버그 예방 체크리스트

- [ ] OrbitControls target 변경 시 항상 `.update()` 호출했는가?
- [ ] React state 변경 시 Three.js 객체도 동기화했는가?
- [ ] useEffect 의존성 배열에 필요한 값이 모두 포함되었는가?
- [ ] 초기 상태 복귀 함수가 모든 관련 상태를 초기화하는가?
- [ ] 디버깅 로그로 props와 actual 상태 차이를 확인했는가?

## 참고 자료

### Three.js OrbitControls API
```javascript
// 주요 속성
controls.target       // Vector3: 회전 중심점
controls.minDistance  // number: 최소 줌 거리
controls.maxDistance  // number: 최대 줌 거리

// 주요 메서드
controls.update()     // 변경사항 적용
controls.reset()      // 초기 상태로 리셋
controls.dispose()    // 리소스 정리
```

### 관련 파일
- `src/three/SceneContainer.jsx`: OrbitControls 설정 및 이벤트 처리
- `src/three/CameraController.jsx`: 카메라 위치/FOV 애니메이션
- `src/App.jsx`: 카메라 설정 계산 (getResponsiveCameraSettings)
- `src/components/Wing.jsx`: 층 버튼 UI
- `src/constants.js`: FLOOR_HEIGHTS, CAMERA_CONFIG

### 추가 문서
- `claudedocs/camera-workflow-analysis.md`: 카메라 동작 흐름 상세 분석
- `claudedocs/camera-bug-analysis.md`: 이 버그의 심층 분석