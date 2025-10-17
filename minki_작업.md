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
  