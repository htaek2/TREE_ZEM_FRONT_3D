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
