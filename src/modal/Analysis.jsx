import styled, { keyframes } from "styled-components";
import { format } from "date-fns";
import {
  Overlay,
  ModalHeader,
  TodayRatio,
  UpDownIcon,
  UpDownFont,
} from "./ModalComponents/EnergyStyle.jsx";
// [MOD] API 호출을 위해 useEffect 추가
import { useEffect, useState } from "react";
// OPEN AI 연결
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
// 차트 그리기
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js 설정 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);





// [ADD] 금액 천단위 콤마 유틸
const formatWon = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString("ko-KR")
    : "-";


// [ADD] 위에서 아래로 ‘툭’ 떨어지며 쌓이는 효과
const fallIn = keyframes`
  from {
    transform: translateY(12px);   /* 살짝 위에서 시작 */
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;


// [ADD] 번쩍(Flash) 효과
const flashOnce = keyframes`
  0%   { opacity: 0; transform: scale(0.98); }
  30%  { opacity: 0.35; transform: scale(1); }
  100% { opacity: 0; }
`;

// [ADD] 외곽선 그리기
const drawLine = keyframes`
  to { stroke-dashoffset: 0; }
`;

const FlashTri = styled.polygon`
  fill: #FFFFFF;
  opacity: 0;
  animation: ${flashOnce} 260ms ease-out 40ms both;
  pointer-events: none;
  transform-box: fill-box;        /* SVG에서 transform 기준 박스 명시 */
  transform-origin: 50% 50%;      /* 중앙 기준으로 확대/축소 → 모서리 깜빡임 완화 */
`;

const OutlineTri = styled.polygon`
  fill: none;
  stroke: #6E82FF;       /* 피라미드와 어울리는 라이트 블루 */
  stroke-width: 2.2;
  stroke-linejoin: round;
  stroke-linecap: round;      /* 선 끝 둥글게 → 꼭짓점 깜빡임 완화 */
  stroke-miterlimit: 1;       /* 과한 미터 피크 방지 */
  stroke-dasharray: ${({ $len }) => `${$len}px`};
  stroke-dashoffset: ${({ $len }) => `${$len}px`};
  animation: ${drawLine} 680ms ease-out forwards;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
  pointer-events: none;
`;


// [ADD] SVG <rect>에 애니메이션 부여 (지연시간으로 순서 제어)
const Band = styled.rect`
  will-change: transform, opacity;
  transform-origin: 50% 0%;
  /* 애니 시작 전(딜레이 동안)에도 from 상태로 고정 → 1프레임 플래시 제거 */
  transform: translateY(12px);
  opacity: 0;
  animation: ${fallIn} 420ms ease-out both;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
  shape-rendering: crispEdges;

  /* 사용자 OS가 ‘애니메이션 줄이기’ 설정이면 자동 비활성화 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;



    

//251023세구
function PyramidBands({
  highlightIndex = 2,
  gapPx = 4,
  width = 120,
  height = 100,
}) {
  const bands = 5;
  

  const COLOR_BASE = "#4B65E9"; // 기본 파랑
  const COLOR_HL   = "#FF9924"; // 강조 주황
  const clipId = "pyramid-clip";
  
  // 삼각형 좌우 경계 (y -> x)
  const xLeft  = (y) => (width / 2) * (1 - y / height);
  const xRight = (y) => width - xLeft(y);
  const APEX_EPS = 1;

  // 정수 기반 균일 레이아웃: 밴드 높이 합 + 간격 = 전체 높이
  const layout = [];
  {
    const totalGap = gapPx * (bands - 1);
    const rawBand = (height - totalGap) / bands;
    const hFloor = Math.floor(rawBand);
    const remainder = (height - totalGap) - hFloor * bands; // 나머지 픽셀들을 위에서부터 1px씩 배분
    let y = 0;
    for (let i = 0; i < bands; i++) {
      const h = hFloor + (i < remainder ? 1 : 0);
      layout.push({ y1: y, y2: y + h });
      y += h;
      if (i < bands - 1) y += gapPx;
    }
  }

  // ──[추가] 외곽선 애니메이션 타이밍(스파크용) + 삼각형 꼭짓점 정의──
  const bandDelay   = 140;
  const bandDur     = 420;
  const outlineDur  = 680;
  const outlineDelay = (bands - 1) * bandDelay + bandDur + 80;
  const innerStart   = outlineDelay + outlineDur - 40; // ‘두 번째 바퀴 전’ 살짝 앞당김

  const pTop   = `${width/2},${APEX_EPS}`;
  const pLeft  = `0,${height}`;
  const pRight = `${width},${height}`;

 

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="동업종 대비 피라미드 구간"
      style={{ display: "block" }}
    >
      <defs>
        {/* 삼각형 모양으로 잘라내는 마스크 */}
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <polygon points={`${pTop} ${pLeft} ${pRight}`} />
        </clipPath>
      </defs>

      <FlashTri
        points={`${pTop} ${pLeft} ${pRight}`}
        clipPath={`url(#${clipId})`}   /* 번쩍도 삼각형 내부로만 */
      />

      {layout.map(({ y1, y2 }, i) => {
        const isHL = i === highlightIndex;
        return (
          <Band
            key={i}
            x={0}
            y={y1}
            width={width}
            height={y2 - y1}
            clipPath={`url(#${clipId})`}
            fill={isHL ? COLOR_HL : COLOR_BASE}
            $delay={i * 140}
          />
        );
      })}


      {(() => {
        const i = highlightIndex;
        if (i < 0 || i >= bands) return null;
        // 현재 밴드의 y1/y2를 layout에서 가져와서 ‘내부(inset)’로 빨간 스트로크 만들기
        const { y1, y2 } = layout[i];
        const inset = 3;                 // 박스 안쪽으로 3px
        const yTop = y1 + inset;
        const yBot = y2 - inset;
        if (yBot <= yTop) return null;
        const tl = `${xLeft(yTop)},${yTop}`;
        const tr = `${xRight(yTop)},${yTop}`;
        const br = `${xRight(yBot)},${yBot}`;
        const bl = `${xLeft(yBot)},${yBot}`;
        return (
          <polygon
            points={`${tl} ${tr} ${br} ${bl}`}
            fill="none"
            stroke="#FF5A5A"
            strokeWidth="5"                // 3px로 두껍게
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0"
            clipPath={`url(#${clipId})`}   // 혹시 몰라서 안전하게 클립 유지
          >
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="260ms"
              begin={`${innerStart}ms`}     // 첫 바퀴 끝나기 직전 등장
              fill="freeze"
            />
          </polygon>
        );
      })()}

    </svg>
  );
}




const Titlediv = styled.div`
  display: flex;
  font: bold 24px "나눔고딕";
  color: #FAFAFA;
  padding: 8px;
`;
const Maindiv = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 671px;
  padding: 8px;
  gap: 8px;
`;
const AnalysisMain = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: calc(50% - 12px);
  height: 100%;
  gap: 8px;
`;

const AnalysisMainTop = styled.div`
  display: flex;
  width: 100%;
  height: calc(52% - 4px);
  gap: 8px;
`;
const AnalysisMainBottom = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(100% - 16px);
  height: calc(48% - 4px);
  padding: 8px;
`;

const MainTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(50% - 4px);
  height: calc(100% - 20px);
  padding: 8px;
  gap: 2px;

  > div:nth-child(1) {
    display: flex;
    font: bold 22px "나눔고딕";
  }
  > div:nth-child(2) {
    display: flex;
    font: bold 24px "나눔고딕";
    align-items: center;
    justify-content: flex-start;
  }
  > div:last-child {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 4px);
    height: 70%;
    border: 1px solid rgba(166, 166, 166, 0.2);
    margin-top: 8px;
  }
`;
const ExpectRatiodiv = styled(TodayRatio)`
  font: 700 15px "나눔고딕";
`;

const MainBottomTop = styled.div`
  display: flex;
  font: bold 22px "나눔고딕";
  height: 10%;
  width: 100%;
`;
const MainBottomMiddle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 75%;
  gap: 8px;
`;
const BottomMiddleLeft = styled.div`
  display: flex;
  /* [MOD] 중복 width 선언(40% vs 35%) 혼란 방지를 위해 최종 적용값만 남김 */
  flex: 0 0 42%;
  align-items: center;
  justify-content: center;

  height: calc(100% - 16px);
  min-width: 0;
`;

const BottomMiddleRight = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  gap: 16px;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: rgba(255, 153, 36, 0.1);
  height: 65%;
  min-width: 0; 
`;

const BuildingAverageleft = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 130px;

  gap: 25px;

  > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font: bold 18px "나눔고딕";
    line-height: 1.2; 
    white-space: nowrap; 
  }
  /* 라벨 중 마지막 줄 = '우리 빌딩' */
  > div:last-child {
    color: #FF5A5A;
    font-weight: 800;                   /* 굵기 고정 */
    font-synthesis: none;               /* 가짜 볼드 합성 금지 */
    -webkit-font-smoothing: auto;       /* 서브픽셀 AA 사용 */
    text-rendering: geometricPrecision; /* 렌더링 안정화 */
    letter-spacing: 0.2px;              /* 시각적 두께 보정(선택) */
    transform: translateZ(0);           /* 레이어 고정으로 재래스터 최소화 */
  }
`;
const BuildingAverageright = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0; 
  gap: 25px;

  > div {
    display: flex;
    justify-content: flex-end;
    align-items: center;    
    font: bold 18px "나눔고딕";
    line-height: 1.2;
    white-space: nowrap;
  }
  /* 우리 빌딩(마지막 줄)만 굵기 고정 */
  > div:last-child {
    font-weight: 800;              /* 굵게 고정 */
    letter-spacing: 0.2px;         /* 숫자 시인성 살짝 보정(선택) */
  }
`;

const BottomBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;    
  font: bold 19px "나눔고딕";
  height: 15%;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: rgba(255, 153, 36, 0.1);
  border-radius: 10px;
  gap: 6px; /* [ADD] 강조 span 간격 */
`;

const AnalysisPlan = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(50% - 28px);
  height: calc(100% - 16px);
  gap: 8px;  
  padding: 8px;
`;
const PlanTop = styled.div`
  display: flex;
  font: bold 22px "나눔고딕";
  width: 100%;
  height: 5%;
`;
const PlanMain = styled.div`
  display: flex;
  width: 100%;
  height: calc(95% - 8px);
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;

  > div {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    min-height: 64px;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    white-Space: pre-line;

    flex-wrap: wrap;
    padding: 8px;
    word-break: break-word; /* 긴 단어 줄바꿈 */
    box-sizing: border-box; /* 패딩 포함 계산 */
  }

`;  

const MachineDiv = styled.div`
    background: ${({ title }) => 
    title === 'report1' ? 'rgba(37, 127, 255, 0.3)' :
    title === 'report2' ? 'rgba(251, 44, 54, 0.3)' :
    'rgba(35, 212, 147, 0.3)'};  
    overflow: auto;  

    > div:first-child {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: calc(90% - 24px);
      height: calc(100% - 16px);
      font: 400 14px "나눔고딕";
      color: #FAFAFA;
      padding: 0px 8px;

      > div:first-child {
        font: bold 18px "나눔고딕";
      }
    }
    > div:last-child {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 10%;
      height: 100%;

      > img {
        width: 38px;
      }
    }
`;

const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(37, 127, 255, 0.3);
  animation: ${shimmer} 1.2s infinite linear;
`;

const SkeletonTitle = styled.div`
  width: 60%;
  height: 18px;
  background: #333;
  border-radius: 4px;
  animation: ${shimmer} 1.2s infinite linear;
`;

const SkeletonText = styled.div`
  width: ${({ short }) => (short ? "80%" : "100%")};
  height: 12px;
  background: #333;
  border-radius: 4px;
  animation: ${shimmer} 1.2s infinite linear;
`;













function Analysis({ 
  onClose,
  elecUsage,
  waterUsage,
  gasUsage,
  yesterdayUsage,
  monthElecUsage,
  monthWaterUsage,
  monthGasUsage,
  lastMonthUsage,
  buildingInfo,
  // 🍪 -백 10-20
  billInfo,
  todayComparisonRatio = { gas: 0, elec: 0, water: 0 },
  monthComparisonRatio = { gas: 0, elec: 0, water: 0 },
  AvgFee ={ national: 0, location: 0 },
  weatherNow
 }) {
    const [ExpectRatio, setExpectRatio] = useState([20, -30]);
    // MachinePlan 예시 데이터는 8개까지 가능
    const [MachineTitle, setMachineTitle] = useState([]);
    // useState(["usage", "warning",]);
    const [MachinePlan, setMachinePlan] = useState([]);
    const [machineReports, setMachineReports] = useState([]);
    const [typingPlans, setTypingPlans] = useState([]);
    // [ADD] 분석 API 응답 상태
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // 예측 데이터
    const [monthData, setMonthData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [VSmonthData, setVSMonthData] = useState([]);
    const [VSyearData, setVSYearData] = useState([]);

    // [ADD] GET /api/bill/analysis (Request Body 없음)
    useEffect(() => {
      const ctrl = new AbortController();
      let ignore = false;

      (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch("/api/bill/analysis", {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status} /api/bill/analysis`);
          const data = await res.json();
          if (!ignore) setAnalysis(data);
        } catch (e) {
          if (!ignore && e.name !== "AbortError") setError(e);
        } finally {
          if (!ignore) setLoading(false);
        }
      })();

      return () => {
        ignore = true;
        ctrl.abort();
      };
    }, []);

    // [ADD] 렌더링 파생값(안전 기본값 포함)
    const total = analysis?.total ?? 0;
    const topAvg = analysis?.rowYearyPriceTop ?? 0;
    const allAvg = analysis?.avgYearyPrice ?? 0;
    const ourYeary = analysis?.ourYearyPrice ?? 0;
    // ourPercentage 가 0~100인지 0~1인지 모호할 수 있어 1 이하면 % 환산
    const rawPct = analysis?.ourPercentage ?? 0;
    const pct = rawPct <= 1 ? Math.round(rawPct * 100) : Math.round(rawPct);
    const highlightIndex = Math.max(0, Math.min(4, Math.floor(pct / 20)));




    const AlertIcon  = {
      "report1" : "/Icon/UsageAiconIcon.svg",
      "report2" : "/Icon/WarningIcon.svg"
    }
  




  const Openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // 브라우저 직접 호출
  });

  
  useEffect(()=>{
    const fetchAI = async () => {
      try {
        const prompt = `
          너는 에너지 사용량을 줄이기 위한 에너지 분석 및 솔루션 전문가야.

          아래 JSON 데이터를 기반으로 건물의 에너지 사용 현황을 분석하고,
          두 개의 보고서를 작성해줘.

---

### 📘 보고서1
- "title": 전반적 에너지 사용 요약 제목 (한 줄)
- "plan": 다음 4개 항목을 포함
  1. 전기·가스·수도 사용량을 종합한 3줄 요약 (줄바꿈 금지, 각 줄은 '## **내용**' 형식)
  2. 아래 예시와 같은 표를 문자열로 출력 (문자 그대로)
        ----------| 전기 | 가스 | 수도
        ----------|-------|-------|-------
        전일 증감률 | 17% 감소 | 238% 증가 | 34% 감소
        전월 증감률 | 18% 감소 | 7% 감소 | 변화 없음
        전월 비용증감률 | 25,000 원 감소 | 12,000 원 감소 | 변화 없음
  3. 건물 관리자용 권고문 (전기·가스·수도 증감률 및 비용 반영, 구체적 점검 방법과 기대효과 포함, LED 교체 제외)
  4. 외부 온도·날씨에 따른 냉난방 절감 가능성 또는 추천 온도

---

### ⚡ 보고서2
- "title": 패턴 기반 분석 요약 제목 (한 줄)
- "plan": 
  1. 피크 시간대·이상 패턴·층/장비별 이상 탐지
  2. 전반적 절감 방향 또는 개선 방안을 한 줄로 제시
  (가스는 층별 분석 제외)

---

          보고서안 번호별 단락 끝에 '\\n\\n'을 넣어 JSON 문자열 내에서도 줄바꿈 처리해줘.
          그리고 번호는 없애줘.
          ---
          ### 출력 형식 (반드시 유효한 JSON으로, 속성 이름은 항상 큰따옴표 사용)
          [
            {"num": "report1", "title": "제목", "plan": "내용"},
            {"num": "report2", "title": "제목", "plan": "내용"}
          ]

          ### 데이터 목록
          {
          "elecUsage" : ${JSON.stringify(elecUsage || {}, null, 2)},
          "waterUsage" : ${JSON.stringify(waterUsage || {}, null, 2)}, 
          "gasUsage" : ${JSON.stringify(gasUsage || {}, null, 2)},
          "yesterdayUsage" : ${JSON.stringify(yesterdayUsage || {}, null, 2)},
          "monthElecUsage" : ${JSON.stringify(monthElecUsage || {}, null, 2)},
          "monthWaterUsage" : ${JSON.stringify(monthWaterUsage || {}, null, 2)},
          "monthGasUsage" : ${JSON.stringify(monthGasUsage || {}, null, 2)},
          "lastMonthUsage" : ${JSON.stringify(lastMonthUsage || {}, null, 2)},
          "buildingInfo" : ${JSON.stringify(buildingInfo || {}, null, 2)},
          "billInfo" : ${JSON.stringify(billInfo || {}, null, 2)},
          "todayComparisonRatio" : ${JSON.stringify(todayComparisonRatio || {}, null, 2)},
          "monthComparisonRatio" : ${JSON.stringify(monthComparisonRatio || {}, null, 2)},
          "AvgFee" : ${JSON.stringify(AvgFee || {}, null, 2)},
          "weatherNow" : ${JSON.stringify(weatherNow || {}, null, 2)}
          }
        `;

        const completion = await Openai.chat.completions.create({
          model : "gpt-4o-mini",
          messages : [
            {role: "system", content: ""},
            {role: "user", content: prompt},
          ],
          temperature: 0.5, // 0.0 (항상 비슷 답변) , 0.3 ~ 0.7 (설명, 보고서용), 1.0 이상 (답변 다양, 일관성x)
        });

        let text = completion.choices[0].message.content;
        text = text.replace(/```json|```/g, "").trim();
        console.log("AI 응답:", text);

        // JSON 파싱 시도
        const parsed = JSON.parse(text);
        setMachineReports(parsed);
        console.log("💸 OpenAI 사용량:", completion.usage);

        // 화면 타이핑 애니메이션
        parsed.forEach((d, idx) => {
          const fullText = d.plan;
          
          const typeWriter = (i = 0) => {
            if (i > fullText.length) return; // 종료 조건
            setTypingPlans((prev) => {
              const newArr = [...prev];
              newArr[idx] = fullText.slice(0, i); // 0~i까지 출력
              return newArr;
            });
            setTimeout(() => typeWriter(i + 1), 25); // 25ms 간격으로 재귀 호출
          };

          typeWriter(); // 시작
        });

        const reports = parsed.reduce(
          (acc, d) => {
            if (d.num === "report1") {
              acc.report1 = { title: d.title, plan: d.plan };
            } else if (d.num === "report2") {
              acc.report2 = { title: d.title, plan: d.plan };
            }
            return acc;
          }, {});

        // 상태 업데이트
        setMachineTitle([reports.report1.title, reports.report2.title]);
        setMachinePlan([reports.report1.plan, reports.report2.plan]);
      } catch (err) {
        console.error("AI 호출 실패:", err);

        // if (err.status === 429) { // RateLimitError
        //   console.warn("Rate limit, 60초 후 재시도...");
        //   setTimeout(fetchAI, 60000);
        // } else {
        //   setMachineTitle(["error"]);
        //   setMachinePlan(["AI 응답을 불러오지 못했습니다."]);
        // }
      } 
    };


      // fetchAI();🍪🍪

  }, []); // 🍪 무슨 데이터로 ?? useState 바꿔야함

  const nowdate = new Date()
  const formatted = format(nowdate, "yyyy-MM-dd HH:mm:ss");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/predict/bill");
        const json = await res.json();
        setMonthData(json.month || []);
        setYearData(json.year || []);
        console.log("📦 서버 응답:", json);
        

        const res2 = await fetch(`/api/energy/bill?start=2025-10-01 00:00:00&end=${formatted}&datetimeType=1`);
        const json2 = await res2.json();

        const dailySumMap = {};
        // 2. 모든 energyType과 datas를 순회
        json2.forEach(item => {
          item.datas.forEach(({ timestamp, usage }) => {
            const date = timestamp.split(" ")[0]; // "YYYY-MM-DD"만 추출
            if (!dailySumMap[date]) dailySumMap[date] = 0;
            dailySumMap[date] += usage;
          });
        });

        // 3. 객체를 배열로 변환
        const dailySum = Object.entries(dailySumMap).map(([date, usage]) => ({
          date,
          usage
        }));

        

        setVSMonthData(dailySum || []);
        setVSYearData(dailySum || []);

      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    };
    fetchData();
  }, []);


  const totalUsage = (VSmonthData || []).reduce((acc, energy) => {
    const sum = (energy.datas || []).reduce((s, item) => s + Math.floor(item.usage), 0);
    return acc + sum;
  }, 0);



  const data1 = {
    labels: VSmonthData, // X축
    datasets: [
      {
        data: [5, 15, 10, 20, 10, 15],
        borderColor: "#00b894", // 라인 색
        backgroundColor: "#00b894",
        tension: 0.3, // 선 곡선 정도
        fill: false,
        pointRadius: 5, // 데이터 포인트 크기
        pointBackgroundColor: "#fff", // 원 내부 색
        pointBorderColor: "#00b894", // 원 테두리 색
        pointBorderWidth: 2,
      },
      {
        data: monthData.map((d) => d.value),
        borderColor: "#dfe6e9",
        borderDash: [5, 5], // 점선
        backgroundColor: "#dfe6e9",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#dfe6e9",
        pointBorderWidth: 2,
      },
    ],
  };

  const data2 = {
    labels: yearData.map((d) => d.quarter), // X축
    datasets: [
      {
        data: yearData.map((d) => d.value),
        borderColor: "#00b894", // 라인 색
        backgroundColor: "#00b894",
        tension: 0.3, // 선 곡선 정도
        fill: false,
        pointRadius: 5, // 데이터 포인트 크기
        pointBackgroundColor: "#fff", // 원 내부 색
        pointBorderColor: "#00b894", // 원 테두리 색
        pointBorderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 범례 숨기기
      },
    },
    scales: {
      x: {
        grid: {
          color: "#2d3436",
        },
      },
      y: {
        grid: {
          color: "#2d3436",
        },
      },
    },
  };



  
    return (
        <Overlay>
            <ModalHeader>
                <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
                <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
            </ModalHeader>

            <Titlediv>통합 분석</Titlediv>
            <Maindiv>
              <AnalysisMain>
                <AnalysisMainTop>
                  <MainTop>
                    <div>금월 예상 비용</div>
                    <div>{totalUsage.toLocaleString()} 원</div>
                    {/* [FIX] ExpectRatio prop 미전달 + 조건부 렌더 */}
                    <ExpectRatiodiv
                      style={{ color: ExpectRatio[0] >= 0 ? "#5AD" : "#F55" }} // 기존 TodayRatio 색상 논리 대체
                    >
                      <UpDownIcon>
                        {ExpectRatio[0] >= 0 ? (
                          <img className="up" src="/Icon/up_icon.svg" alt="오름세" />
                        ) : (
                          <img className="down" src="/Icon/down_icon.svg" alt="내림세" />
                        )}
                      </UpDownIcon>
                      작년 동월 대비 {ExpectRatio[0]} %
                      <UpDownFont>
                        {ExpectRatio[0] >= 0 ? <div>증가</div> : <div>감소</div>}
                      </UpDownFont>
                    </ExpectRatiodiv>
                    <div><Line data={data1} options={options} /></div>
                  </MainTop>

                  <MainTop>
                    <div>금년 예상 비용</div>
                    <div>{Math.floor(yearData.reduce((sum, item) => sum + item.value, 0)).toLocaleString()} 원</div>
                    {/* [FIX] ExpectRatio prop 미전달 + 조건부 렌더 */}
                    <ExpectRatiodiv
                      style={{ color: ExpectRatio[1] >= 0 ? "#5AD" : "#F55" }}
                    >
                      <UpDownIcon>
                        {ExpectRatio[1] >= 0 ? (
                          <img className="up" src="/Icon/up_icon.svg" alt="오름세" />
                        ) : (
                          <img className="down" src="/Icon/down_icon.svg" alt="내림세" />
                        )}
                      </UpDownIcon>
                      작년 동월 대비 {ExpectRatio[1]} %
                      <UpDownFont>
                        {ExpectRatio[1] >= 0 ? <div>증가</div> : <div>감소</div>}
                      </UpDownFont>
                    </ExpectRatiodiv>
                    <div><Line data={data2} options={options} /></div>
                  </MainTop>
                </AnalysisMainTop>

                <AnalysisMainBottom>
                  <MainBottomTop>동 업종 대비 저비용 지출 분석</MainBottomTop>
                  
                  <MainBottomMiddle>
                    {/* [MOD-3] 로딩/에러 안내 + 피라미드 렌더 */}
                  <BottomMiddleLeft>
                  {loading ? (
                    // [MOD] 텍스트 대신 로딩 GIF 표시 (public/icon/loading_icon.gif)
                    <img
                      src="/Icon/loading_icon.gif"
                      alt="로딩 중"
                      width={53}
                      height={53}
                      style={{ objectFit: "contain" }}
                    />
                  ) : error ? (
                    "데이터 오류"
                  ) : (
                    <PyramidBands
                      width={190}
                      height={165}
                      gapPx={4}
                      highlightIndex={highlightIndex}
                    />
                  )}
                </BottomMiddleLeft>


                    <BottomMiddleRight>
                      <BuildingAverageleft>
                        <div>상위 5% 평균</div>
                        <div>전체 평균</div>
                        <div style={{ color: "#FF5A5A" }}>우리 빌딩</div>
                      </BuildingAverageleft>

                      <BuildingAverageright>
                        {/* [MOD] API 데이터 바인딩 */}
                        <div>{formatWon(topAvg)} 원</div>
                        <div>{formatWon(allAvg)} 원</div>
                        <div style={{ color: "#FF5A5A" }}>{formatWon(ourYeary)} 원</div>
                      </BuildingAverageright>
                    </BottomMiddleRight>
                  </MainBottomMiddle>

                  {/* [MOD] 하단 요약 문구 실데이터 바인딩 + 강조색상 */}
                  <BottomBottom>
                    동 업종{" "}
                    <span style={{ color: "#FF9924", fontWeight: 800 }}>
                      {formatWon(total)}
                    </span>
                    개 중 상위{" "}
                    <span style={{ color: "#FF9924", fontWeight: 800 }}>
                      {pct}
                    </span>
                    % 평균 오차 범위에 속해요.
                  </BottomBottom>
                </AnalysisMainBottom>
              </AnalysisMain>

              <AnalysisPlan>
                <PlanTop>에너지 절감 방안 제시</PlanTop>
                <PlanMain>
                  {loading ? (
                        // 로딩 중 표시 (GIF, Skeleton 등 선택 가능)
                        <LoadingPlaceholder>
                          <SkeletonTitle />
                          <SkeletonText />
                          <SkeletonText short />
                          <SkeletonText />
                        </LoadingPlaceholder>
                        
                      ) : error ? (
                        // 에러 표시
                        <div>데이터를 불러오지 못했습니다.</div>
                      ) : (
                        // 데이터가 준비된 경우 기존 렌더
                        machineReports.map((d, index) => (
                          <MachineDiv key={index} title={d.num}>
                            <div>
                              <div>{d.title}</div>
                              <div>
                                <ReactMarkdown
                                  components={{
                                    h2: ({ node, ...props }) => (
                                      <h2
                                        style={{
                                          fontSize: "1.0rem",
                                          fontWeight: "bold",
                                          color: "#FAFAFA",
                                        }}
                                        {...props}
                                      />
                                    ),
                                  }}
                                >
                                  {typingPlans[index]}
                                </ReactMarkdown>
                              </div>
                            </div>

                            <div className={`MachineImg${index}`}>
                              <img src={AlertIcon[d.num]} alt={AlertIcon[d.num]} />
                            </div>
                          </MachineDiv>
                        ))
                    )}
                </PlanMain>
              </AnalysisPlan>
            </Maindiv>
        </Overlay>
    );
}

export default Analysis;
