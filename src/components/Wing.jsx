import { useEffect, useState } from "react";
import styled from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";
// Emission은 파일이 없으므로 import하지 않습니다.

/* ⬅️ 좌측 날개 컨테이너 */
const LeftWing = styled.aside`
  position: absolute;
  left: ${({ $open }) =>
    $open
      ? "var(--wing-left)"
      : "calc(-1 * (var(--wing-left) + var(--wing-width) + 40px))"};
  top: 56px;
  bottom: 20px;
  width: var(--wing-width);
  display: grid;

  /* 위에서부터: 실시간 사용량 / 전일 대비 / 전년 대비 / 버튼Dock */
  grid-template-rows: var(--wing-card-h) var(--wing-card-h) var(--wing-card-h) auto;

  gap: 12px;
  z-index: 950;

  min-height: 0;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
    left 360ms cubic-bezier(0.22,0.61,0.36,1),
    opacity 260ms ease-out;
`;

/* 공통 카드 */
const WingCard = styled.div`
  position: relative;
  background: rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  color: #fff;
  padding: 10px 12px;
  overflow: hidden;
  width: var(--wing-card-w);
  height: var(--wing-card-h);
  box-sizing: border-box;
`;

/* 상단 칩 — 184×35 절대 고정 */
const CardTitle = styled.div`
  width: 184px;
  height: 35px;
  flex: 0 0 35px;    /* 플렉스 부모에서도 줄어들지 않게 고정 */
  min-height: 35px;  /* 안전핀 */
  line-height: 35px;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 0 14px;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: 'Nanum Gothic', system-ui, sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;

  border: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -1px 0 rgba(0,0,0,0.45);

  background:
    radial-gradient(40px 48px at -10% 50%, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%),
    linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(90deg, #2f2f2f 0%, #1a1a1a 60%, #0a0a0a 100%);

  &::before{
    content:"";
    position:absolute;
    top:-20%;
    right:-8px;
    width:72px;
    height:140%;
    pointer-events:none;
    background:
      radial-gradient(6px 6px at 85% 50%, rgba(255,255,255,0.16) 0, rgba(255,255,255,0) 60%),
      radial-gradient(4px 4px at 70% 45%, rgba(255,255,255,0.14) 0, rgba(255,255,255,0) 60%),
      radial-gradient(3px 3px at 60% 55%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 60%),
      radial-gradient(2px 2px at 75% 60%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0) 60%),
      linear-gradient(90deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%);
    filter: blur(.2px);
  }
  &::after{
    content:"";
    position:absolute;
    top:0; right:0;
    width:28px;
    height:100%;
    pointer-events:none;
    background: linear-gradient(
      to right,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0.35) 60%,
      rgba(0,0,0,0.85) 100%
    );
  }
`;

/* 실시간 사용량의 행들 */
const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  &:last-child { border-bottom: 0; }
`;
const StatIcon = styled.img`
  width: 16px; height: 16px; display: block;
  filter: brightness(0) invert(1);
`;
const StatLabel = styled.span` opacity: .95; `;
const StatValue = styled.span` margin-left: auto; font-weight: 800; `;

/* 차트 카드 */
const ChartCard = styled(WingCard)`
  padding: 12px 12px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

/* 카드 높이 합계가 딱 맞도록 여유값 조정 */
const ChartCanvas = styled.div`
  flex: 1;
  min-height: 135px;   /* 135 + 8(margin-top) + 35(title) + 24(padding) ≈ 202 → 210 내 안정 */
  border-radius: 10px;
  margin-top: 8px;
  background: rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
    linear-gradient(to top,   rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 16px 100%, 100% 16px;
  overflow: hidden;
`;

/* 하단 작은 버튼 3개 */
const DockActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, var(--dock-w));
  gap: 8px;
  justify-items: center;
  align-items: center;
`;

const DockBtn = styled.button`
  background: rgba(45,45,45,0.85);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  width: var(--dock-w);
  height: var(--dock-h);
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

const DockLabel = styled.span`
  position: absolute;
  left: 50%;
  bottom: var(--dock-label-bottom);
  transform: translateX(-50%);
  width: 100%;
  height: var(--dock-label-h);
  line-height: var(--dock-label-h);
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  pointer-events: none;
`;

const DockIcon = styled.img`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(var(--dock-label-bottom) + var(--dock-label-h) + var(--dock-gap));
  width: auto;
  height: auto;
  max-width: none;
  max-height: none;
  display: block;
`;

/* 우측 상단 정보 스택 */
const RightInfo = styled.div`
  position: absolute;
  top: 44px;
  right: 20px;
  display: grid;
  gap: 8px;
  z-index: 120;
  transform: ${({ $open }) => ($open ? "translateX(0)" : "translateX(160%)")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
    transform 360ms cubic-bezier(0.22,0.61,0.36,1),
    opacity 260ms ease-out;
`;

/* 각 항목 박스 */
const InfoItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  --fade: 36px;
  padding-right: calc(12px + var(--fade));
  border-radius: 18px;
  background: rgba(45,45,45,0.85);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  --cut: 60%;
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0,0,0,.9) var(--cut, 60%),
    rgba(0,0,0,0) 100%
  );
  mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0,0,0,.9) var(--cut, 60%),
    rgba(0,0,0,0) 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
`;

const InfoIcon = styled.img`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: block;
  filter: ${({ $white }) => ($white ? "brightness(0) invert(1)" : "none")};
`;

const InfoLabel = styled.span` opacity: 0.95; `;
const InfoValue = styled.span` margin-left: auto; font-weight: 800; `;

function Wing({ railOpen , gasUsage , elecUsage, waterUsage }) {
  const [managerName] = useState("이**");
  const [alertCount] = useState(0);
  const [outerTemp, setOuterTemp] = useState(null);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const fetchWeather = async (lat = 37.5665, lon = 126.9780) => {
      try {
        if (!API_KEY) { setOuterTemp(26); return; }
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        setOuterTemp(data?.main?.temp ?? 26);
      } catch {
        setOuterTemp(26);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather()
      );
    } else {
      fetchWeather();
    }
  }, []);

  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      {/* 좌측 날개 */}
      <LeftWing $open={railOpen}>
        {/* 실시간 사용량 */}
        <WingCard onClick={() => setActiveModal("condition")}>
          <CardTitle>실시간 사용량</CardTitle>

          <StatRow>
            <StatIcon src="/Icon/power_icon.svg" alt="전력"
              onError={(e)=>{ e.currentTarget.style.display='none'; }} />
            <StatLabel>전력</StatLabel>
            <StatValue>{elecUsage.totalUsage ?? 0} kWh</StatValue>
          </StatRow>

          <StatRow>
            <StatIcon src="/Icon/gas_icon.svg" alt="가스"
              onError={(e)=>{ e.currentTarget.style.display='none'; }} />
            <StatLabel>가스</StatLabel>
            <StatValue>{gasUsage.totalUsage ?? 0} m³</StatValue>
          </StatRow>

          <StatRow>
            <StatIcon src="/Icon/water_icon.svg" alt="수도"
              onError={(e)=>{ e.currentTarget.style.display='none'; }} />
            <StatLabel>수도</StatLabel>
            <StatValue>{waterUsage.totalUsage ?? 0} m³</StatValue>
          </StatRow>
        </WingCard>

        {/* 전일 대비 전력 사용량 */}
        <ChartCard>
          <CardTitle>전일 대비 전력 사용량</CardTitle>
          <ChartCanvas aria-label="전일 대비 전력 사용량 차트(placeholder)" />
        </ChartCard>

        {/* 전년 대비 전력 사용량 */}
        <ChartCard>
          <CardTitle>전년 대비 전력 사용량</CardTitle>
          <ChartCanvas aria-label="전년 대비 전력 사용량 차트(placeholder)" />
        </ChartCard>

        {/* 하단 버튼들 */}
        <DockActions>
          <DockBtn onClick={() => setActiveModal("analysis")} >
            <DockIcon
              src="/Icon/analysis_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/analysis_icon.svg"; }}}
            />
            <DockLabel>통합분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("detail")} >
            <DockIcon
              src="/Icon/detail_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/detail_icon.svg"; }}}
            />
            <DockLabel>상세분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("emission")}>
            <DockIcon 
              src="/Icon/emission_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/analysis_icon.svg"; }}}
            />
            <DockLabel>탄소배출</DockLabel>
          </DockBtn>
        </DockActions>
      </LeftWing>

      {/* 모달 렌더링: Emission은 아직 파일 없으니 제외 */}
      {activeModal === "condition" && (
        <Condition onClose={() => setActiveModal(null)}>현황</Condition>
      )}
      {activeModal === "analysis" && (
        <Analysis onClose={() => setActiveModal(null)}>통합분석</Analysis>
      )}
      {activeModal === "detail" && (
        <Detail onClose={() => setActiveModal(null)}>상세분석</Detail>
      )}
      {/* emission 분기는 화면구성 단계 완료 후 필요 시 추가 */}
      {/* {activeModal === "emission" && <Emission onClose={() => setActiveModal(null)}>탄소배출</Emission>} */}

      {/* 우측 정보 스택 */}
      <RightInfo $open={railOpen}>
        <InfoItem>
          <InfoIcon $white src="/Icon/manager_icon.svg" alt="책임자"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/Icon/manager_icon.svg"; } }} />
          <InfoLabel>책임자</InfoLabel>
          <InfoValue>{managerName}</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoIcon $white src="/Icon/weather_icon.svg" alt="외부온도"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/Icon/weather_icon.svg"; } }} />
          <InfoLabel>외부온도</InfoLabel>
          <InfoValue>{outerTemp == null ? "—" : `${Math.round(outerTemp)}°C`}</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoIcon src="/Icon/warning_icon.svg" alt="경고/알림"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/Icon/warning_icon.svg"; } }} />
          <InfoLabel>경고/알림</InfoLabel>
          <InfoValue>{alertCount}</InfoValue>
        </InfoItem>
      </RightInfo>
    </>
  );
}

export default Wing;
