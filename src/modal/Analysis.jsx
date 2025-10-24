import styled, { keyframes } from "styled-components";
import {
  Overlay,
  ModalHeader,
  TodayRatio,
  UpDownIcon,
  UpDownFont,
} from "./ModalComponents/EnergyStyle.jsx";
// [MOD] API 호출을 위해 useEffect 추가
import { useEffect, useState } from "react";



// [ADD] 금액 천단위 콤마 유틸
const formatWon = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString("ko-KR")
    : "-";


// [ADD] 위에서 아래로 ‘툭’ 떨어지며 쌓이는 효과
const fallIn = keyframes`
  from {
    transform: translateY(-12px);   /* 살짝 위에서 시작 */
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
`;

const OutlineTri = styled.polygon`
  fill: none;
  stroke: #6E82FF;       /* 피라미드와 어울리는 라이트 블루 */
  stroke-width: 2.2;
  stroke-linejoin: round;
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
  animation: ${fallIn} 420ms ease-out both;
  animation-delay: ${({ $delay }) => `${$delay}ms`};

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
  const bandHeight = (height - gapPx * (bands - 1)) / bands;

  const COLOR_BASE = "#4B65E9"; // 기본 파랑
  const COLOR_HL   = "#FF9924"; // 강조 주황
  const clipId = "pyramid-clip";

  // [ADD] 삼각형 3점과 외곽선 둘레 길이 계산
  const pTop = `${width/2},0`;
  const pLeft = `0,${height}`;
  const pRight = `${width},${height}`;
  const base = width;
  const side = Math.hypot(width / 2, height); // sqrt((w/2)^2 + h^2)
  const perimeter = base + side * 2;          // 외곽선 길이
  // [ADD] 외곽선은 "밴드가 다 떨어지고 난 뒤" 시작
  const bandDelay = 140;   // 각 밴드 지연(현재 코드와 동일)
  const bandDur   = 420;   // 각 밴드 지속
  const outlineDelay = (bands - 1) * bandDelay + bandDur + 80; // 총합 + 살짝 여유

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
          <polygon points={`${width/2},0 0,${height} ${width},${height}`} />
          <polygon points={`${pTop} ${pLeft} ${pRight}`} />
        </clipPath>
      </defs>

      <FlashTri points={`${pTop} ${pLeft} ${pRight}`} />

      {/* 위→아래로 5개의 가로 밴드를 그리고, 클리핑으로 삼각형 안에만 보이게 합니다 */}
      {Array.from({ length: bands }).map((_, i) => {
        const y = i * (bandHeight + gapPx);
        const isHL = i === highlightIndex;
        return (
          <Band
            key={i}
            x={0}
            y={y}
            width={width}
            height={bandHeight}
            clipPath={`url(#${clipId})`}
            fill={isHL ? COLOR_HL : COLOR_BASE}
            
            $delay={i * bandDelay}
          />
        );
      })}
      {/* [ADD] 외곽선 그리기: 밴드 애니메이션 종료 후 둘레를 따라 한 바퀴 그려짐 */}
      <OutlineTri
        points={`${pTop} ${pRight} ${pLeft}`}  // 시계방향으로 그려 ‘한 바퀴’ 느낌
        $len={perimeter}
        $delay={outlineDelay}
      />
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
  height: 672px;
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
    font: bold 18px "나눔고딕";
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
    width: 100%;
    height: 70%;
    border: 1px solid rgba(166, 166, 166, 0.2);
    margin-top: 8px;
  }
`;
const ExpectRatiodiv = styled(TodayRatio)`
  font: 700 12px "나눔고딕";
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
  width: 50%;
  align-items: center;
  justify-content: center;

  height: calc(100% - 16px);
`;

const BottomMiddleRight = styled.div`
  display: flex;
  width: calc(60% - 4px);
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  gap: 16px;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: rgba(255, 153, 36, 0.1);
  height: 65%;
  
`;

const BuildingAverageleft = styled.div`
  display: flex;
  flex-direction: column;
  width: 48%;
  gap: 18px;

  > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font: bold 17px "나눔고딕";
    line-height: 1.2; 
    white-space: nowrap; 
  }
`;
const BuildingAverageright = styled.div`
  display: flex;
  flex-direction: column;
  width: 60%;
  gap: 18px;

  > div {
    display: flex;
    justify-content: flex-end;
    align-items: center;    
    font: bold 18px "나눔고딕";
    line-height: 1.2;
    white-space: nowrap;
  }
`;

const BottomBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;    
  font: bold 20px "나눔고딕";
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
    align-items: center;
    width: 100%;
    height: 10%;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;

  }

`;  

const MachineDiv = styled.div`
    background: ${({ title }) => 
    title === 'usage' ? 'rgba(37, 127, 255, 0.3)' :
    title === 'warning' ? 'rgba(251, 44, 54, 0.3)' :
    'rgba(35, 212, 147, 0.3)'};    

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

function Analysis({ onClose }) {
    const [ExpectRatio, setExpectRatio] = useState([20, -30]);
    // MachinePlan 예시 데이터는 8개까지 가능
    const [MachineTitle, setMachineTitle] = useState(["greenCom", "usage", "warning", "greenAircon"]);
    const [MachinePlan, setMachinePlan] = useState(["test1", "test2", "test3", "test4"]);

    // [ADD] 분석 API 응답 상태
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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




    const AlertIcon = (index) =>
      MachineTitle[index] === "greenCom" ? "/Icon/GreenComIcon.svg"
      : MachineTitle[index] === "greenAircon" ? "/Icon/GreenAirconIcon.svg"
      : MachineTitle[index] === "usage" ? "/Icon/UsageAiconIcon.svg"
      : MachineTitle[index] === "warning" ? "/Icon/WarningIcon.svg" : null;

  
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
                    <div>0,000,000 원</div>
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
                    <div>표</div>
                  </MainTop>

                  <MainTop>
                    <div>금년 예상 비용</div>
                    <div>00,000,000 원</div>
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
                    <div>표</div>
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
                  {MachinePlan.map((Plan, index) => (
                    <MachineDiv key={index} title={MachineTitle[index]}>
                      <div>
                        <div>{MachineTitle[index]}</div>
                        <div>{Plan}</div>
                      </div>
                      <div className={`MachineImg${index}`}>
                        <img src={AlertIcon(index)} alt={MachineTitle[index]} />
                      </div>
                    </MachineDiv>
                  ))}
                </PlanMain>
              </AnalysisPlan>
            </Maindiv>
        </Overlay>
    );
}

export default Analysis;
