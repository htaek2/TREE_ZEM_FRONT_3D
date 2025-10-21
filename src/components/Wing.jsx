import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";
import { MODEL_TO_FLOOR, MODELS } from "../constants";

/* ===========================
   헤더 박스
=========================== */
const HeaderBox = styled.div`
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-sizing: border-box;
  width: 350px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: ${({ IsEmissionBtn }) => IsEmissionBtn
   ? `linear-gradient(90deg,
        rgba(0,170,111,0) 0%,
        rgba(0,170,111,.22) 20%,
        rgba(0,170,111,.65) 45%,
        rgba(0,170,111,1) 55%,
        rgba(0,170,111,.65) 68%,
        rgba(0,170,111,.22) 80%,
        rgba(0,170,111,0) 100%)`
   : `linear-gradient(90deg,
        rgba(0,0,0,0) 0%,
        rgba(20,20,20,.12) 20%,
        rgba(20,20,20,.55) 40%,
        rgba(20,20,20,.92) 55%,
        rgba(20,20,20,.55) 68%,
        rgba(20,20,20,.12) 80%,
        rgba(0,0,0,0) 100%)`};
 box-shadow: none;
 transition: background .24s ease;  /* 부드럽게 전환 */
`;

const HeaderIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
`;

const HeaderText = styled.span`
  white-space: nowrap;
`;

/* ===========================
   층 버튼
=========================== */
const FloorButtons = styled.div`
  position: absolute;
  left: ${({ $open }) => ($open ? "230px" : "16px")};
  z-index: 10;
  top: calc(30% - 4px);
  width: var(--rail-width);
  transform: translateY(-50%);
  transition: left 340ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform, opacity;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
`;

const FloorButton = styled.button`
  padding: 8px 8px;
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? "rgba(0, 170, 111, 1)" : "rgba(45, 45, 45, 0.85)"};
  color: white;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
  width: 50px;
  height: 50px;

  &.active {
    background-color: rgba(100, 100, 100, 0.95);
    border-color: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
  }

  > img.ToggleBtn {
    width: 20px;
    height: 20px;
  }
`;

/* ===========================
   좌측 날개(패널) + 카드
=========================== */
const LeftWing = styled.aside`
  position: absolute;
  left: ${({ $open }) => ($open ? "16px" : "calc(-1 * (16px + 232px + 40px))")};
  top: 56px;
  bottom: 20px;
  width: 232px;
  display: grid;
  grid-template-rows: 210px 210px 210px auto;
  gap: 12px;
  z-index: 950;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: left 360ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 260ms ease-out;
`;

const WingCard = styled.div`
  position: relative;
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? "rgba(0, 170, 111, 0.15)" : "rgba(0, 0, 0, 0.15)"};
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  padding: 10px 8px;
  overflow: hidden;
  width: 200px;
  height: 208px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* ✅ 항상 동일한 그림자 (탄소배출 모드 전/후 동일) */
  box-shadow: 2px 3px 5px 0 rgba(0,0,0,.25);
`;

const CardTitle = styled.div`
  width: 184px;
  min-width: 184px;
  height: 34px;
  min-height: 34px;
  flex: 0 0 34px;
  line-height: 14px;
  box-sizing: border-box;
  border-radius: 9999px 0 0 9999px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? "rgba(0, 170, 111, 1)" : "rgba(45, 45, 45, 0.85)"};
  overflow: hidden;
  margin-bottom: 8px;
  --fade: 36px;
  --cut: 60%;
  padding-right: calc(14px + var(--fade));
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0, 0, 0, 0.9) var(--cut, 60%),
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0, 0, 0, 0.9) var(--cut, 60%),
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  &::before,
  &::after {
    content: none !important;
  }
`;

const StatList = styled.div`
  flex: 1;
  display: grid;
  grid-template-rows: ${({ IsEmissionBtn }) => (IsEmissionBtn ? "repeat(4, 1fr)" : "repeat(3, 1fr)")};
  height: 100%;

  > .TotalEmission {
    display: ${({ IsEmissionBtn }) => (IsEmissionBtn ? "flex" : "none")};
    align-items: center;
    justify-content: space-between;
  }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  column-gap: 10px;
  padding: 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &:last-child {
    border-bottom: 0;
  }
`;

const StatIcon = styled.img`
  width: 20px;
  height: 20px;
  display: block;
  filter: brightness(0) invert(1);
`;

const StatLabel = styled.span`
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.2px;
`;
const StatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
`;

const StatUnit = styled.span``;

const ChartCard = styled(WingCard)`
  display: flex;
  flex-direction: column;
`;

const ChartCanvas = styled.div`
  height: 134px;
  flex: 0 0 134px;
  border-radius: 10px;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(to top, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 16px 100%, 100% 16px;
  overflow: hidden;
`;

const DockActions = styled.div`
  width: 200px;
  margin: 50 auto;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
`;

const DockBtn = styled.button`
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? "rgba(0, 170, 111, 1)" : "rgba(45, 45, 45, 0.85)"};
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  width: 60px;
  height: 40px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* ===========================
   우측 정보 스택
=========================== */
const RightInfo = styled.div`
  position: absolute;
  top: 56px;
  right: ${({ $open }) => ($open ? "16px" : "calc(-1 * (16px + 230px + 40px))")};
  display: grid;
  grid-auto-rows: min-content;
  gap: 8px;
  z-index: 120;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
     transform 360ms cubic-bezier(0.22,0.61,0.36,1),
     opacity 260ms ease-out;
  overflow: visible;
`;

const InfoGroup = styled.div`
  width: 184px;
  display: grid;
  grid-template-rows: 34px auto;
  row-gap: 0;
`;

/* 말풍선 꼬리: 보더+채움 이중 처리로 상단에 딱 붙게 */
const InfoPanelBase = styled.div`
  --tail: 8px;
  /* 탄소배출 토글 시 좌측 박스와 동일 톤 */
  --panel-bg: ${({IsEmissionBtn}) => IsEmissionBtn ? "rgba(0,170,111,0.15)" : "rgba(45,45,45,0.50)"};
  --panel-bd: ${({IsEmissionBtn}) => IsEmissionBtn ? "rgba(0,170,111,0)"    : "#2D2D2D"};


  overflow: hidden;
  max-height: ${({ open }) => (open ? "120px" : "0")};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transition: max-height 220ms ease, opacity 150ms ease;
  padding: ${({ open }) => (open ? "8px 8px 40px" : "0 8px 0")};
  margin-top: ${({ open }) => (open ? "6px" : "0")};
  background: var(--panel-bg);
  border: 1px solid var(--panel-bd);
  border-radius: 8px;
  color: #fff;
  line-height: 1.5;
  position: relative;
  z-index: 1000;
  box-shadow: 2px 3px 5px 0 rgba(0,0,0,.25);

  & p { margin: 0; font-weight: 400; }
  & p + p { margin-top: 4px; }
`;

const InfoManager = styled(InfoPanelBase)``;
const InfoWeather = styled(InfoPanelBase)``;
const InfoAlert = styled(InfoPanelBase)``;

const InfoItem = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 20px var(--label-w, 64px) 1fr;
  align-items: center;
  column-gap: 10px;
  box-sizing: border-box;
  width: 184px;
  min-width: 184px;
  height: 34px;
  min-height: 34px;
  padding: 7px 14px;

  --fade: 26px;
  padding-right: calc(14px + var(--fade));
  border-radius: 9999px 0 0 9999px;
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? "rgba(0, 170, 111, 1)" : "rgba(45, 45, 45, 0.85)"};
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;

  --cut: 60%;
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0, 0, 0, 0.9) var(--cut, 60%),
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    rgba(0, 0, 0, 0.9) var(--cut, 60%),
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  cursor: pointer;
  box-shadow: 2px 3px 5px 0 rgba(0,0,0,.25);
`;

const InfoIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
  filter: ${({ $white }) => ($white ? "brightness(0) invert(1)" : "none")};
`;

const InfoLabel = styled.span`
  opacity: 0.95;
  text-overflow: ellipsis;
  line-height: 20px;
`;

const InfoValue = styled.span`
  margin-left: 0;
  justify-self: start;
  text-align: left;
  font-weight: 800;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 20px;
`;

/* 우측 하단 고정 액션 영역 */
const PanelActions = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 5px;
`;

/* 코멘트 스타일의 작은 필 버튼 */
const PanelBtn = styled.button`
  min-width: 46px;
  height: 20px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${({IsEmissionBtn}) => IsEmissionBtn ? "rgba(0,170,111,1)" : "rgba(45,45,45,0.50)"};
  border: 1px solid ${({IsEmissionBtn}) => IsEmissionBtn ? "rgba(0,170,111,1)" : "#2D2D2D"};
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;     /* 텍스트 수직 가운데 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  cursor: pointer;

`;


/* ===========================
   컴포넌트 본문
=========================== */
function Wing({
  railOpen,
  onClose,
  todayUsage = { elec: 0, gas: 0, water: 0 },
  yesterdayUsage = { elec: 0, gas: 0, water: 0 },
  monthUsage = { elec: 0, gas: 0, water: 0 },
  lastMonthUsage = { elec: 0, gas: 0, water: 0 },
  buildingInfo = {},
  active = { active: false, model: null },
  setActive = () => {},
  selectedDevice,
  setSelectedDevice = () => {},
  setRailOpen = () => {},
  billInfo = {},
}) {
  const [managerName] = useState("이**");
  const [alertCount, setAlertCount] = useState(0);
  const [outerTemp, setOuterTemp] = useState(null);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const fetchWeather = async (lat = 37.5665, lon = 126.978) => {
      try {
        if (!API_KEY) {
          setOuterTemp(26);
          return;
        }
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

  const handleModelButtonClick = (modelName) => {
    if (modelName === "top") return;
    setActive({ active: true, model: modelName });
    setSelectedDevice(null);
  };

  const [activeModal, setActiveModal] = useState(null);
  const [IsEmissionBtn, setIsEmissionBtn] = useState(false);

  const EmissionNaming = (name) => {
    if (!IsEmissionBtn) return name;
    switch (name) {
      case "실시간 사용량":
        return "실시간 탄소 배출량";
      case "전일 대비 전력 사용량":
        return "전일 대비 탄소 배출량";
      case "전년 대비 전력 사용량":
        return "금년 예상 탄소 배출량";
      default:
        return name;
    }
  };

  /* 독립 토글 */
  const [openManager, setOpenManager] = useState(false);
  const [openWeather, setOpenWeather] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  return (
    <>
      {/* 좌측 날개 */}
      <LeftWing $open={railOpen}>
        {/* 실시간 사용량 */}
        <WingCard onClick={() => setActiveModal("condition")} IsEmissionBtn={IsEmissionBtn}>
          <CardTitle IsEmissionBtn={IsEmissionBtn}>{EmissionNaming("실시간 사용량")}</CardTitle>
          <StatList IsEmissionBtn={IsEmissionBtn}>
            <StatRow IsEmissionBtn={IsEmissionBtn}>
              <StatIcon
                src="Icon/elect_icon.svg"
                alt="전력"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fbk) {
                    img.dataset.fbk = 1;
                    img.src = "/Icon/elect_icon.svg";
                  }
                }}
              />
              <StatLabel>전력</StatLabel>
              <StatValue>
                <span>{todayUsage.elec}</span>
                <StatUnit>kWh</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow IsEmissionBtn={IsEmissionBtn}>
              <StatIcon
                src="/Icon/gas_icon.svg"
                alt="가스"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fbk) {
                    img.dataset.fbk = 1;
                    img.src = "/Icon/gas_icon.svg";
                  }
                }}
              />
              <StatLabel>가스</StatLabel>
              <StatValue>
                <span>{todayUsage.gas}</span>
                <StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow IsEmissionBtn={IsEmissionBtn}>
              <StatIcon
                src="/Icon/water_icon.svg"
                alt="수도"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fbk) {
                    img.dataset.fbk = 1;
                    img.src = "/Icon/water_icon.svg";
                  }
                }}
              />
              <StatLabel>수도</StatLabel>
              <StatValue>
                <span>{todayUsage.water}</span>
                <StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow IsEmissionBtn={IsEmissionBtn} className="TotalEmission">
              <StatLabel>총 배출량</StatLabel>
              <StatValue>
                <span>{0}</span>
                <StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>
          </StatList>
        </WingCard>

        {/* 전일 대비 전력 사용량 */}
        <ChartCard IsEmissionBtn={IsEmissionBtn}>
          <CardTitle IsEmissionBtn={IsEmissionBtn}>{EmissionNaming("전일 대비 전력 사용량")}</CardTitle>
          <ChartCanvas aria-label="전일 대비 전력 사용량 차트(placeholder)" />
        </ChartCard>

        {/* 전년 대비 전력 사용량 */}
        <ChartCard IsEmissionBtn={IsEmissionBtn}>
          <CardTitle IsEmissionBtn={IsEmissionBtn}>{EmissionNaming("전년 대비 전력 사용량")}</CardTitle>
          <ChartCanvas aria-label="전년 대비 전력 사용량 차트(placeholder)" />
        </ChartCard>

        {/* 하단 버튼들 */}
        <DockActions>
          <DockBtn onClick={() => setActiveModal("analysis")}>
            <DockIcon
              src="public/Icon/analysis_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fbk) {
                  img.dataset.fbk = 1;
                  img.src = "/Icon/analysis_icon.svg";
                }
              }}
            />
            <DockLabel>통합분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("detail")}>
            <DockIcon
              src="public/Icon/detail_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fbk) {
                  img.dataset.fbk = 1;
                  img.src = "/Icon/detail_icon.svg";
                }
              }}
            />
            <DockLabel>상세분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setIsEmissionBtn((prev) => !prev)} IsEmissionBtn={IsEmissionBtn}>
            <DockIcon
              src="public/Icon/emission_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fbk) {
                  img.dataset.fbk = 1;
                  img.src = "/Icon/analysis_icon.svg";
                }
              }}
            />
            <DockLabel>탄소배출</DockLabel>
          </DockBtn>
        </DockActions>
      </LeftWing>

      {/* 모달 */}
      {activeModal === "condition" && (
        <Condition
          onClose={() => setActiveModal(null)}
          elecUsage={todayUsage.elec}
          waterUsage={todayUsage.water}
          gasUsage={todayUsage.gas}
          yesterdayUsage={yesterdayUsage}
          monthElecUsage={monthUsage.elec}
          monthWaterUsage={monthUsage.water}
          monthGasUsage={monthUsage.gas}
          lastMonthUsage={lastMonthUsage}
          buildingInfo={buildingInfo}
          billInfo={billInfo}
        >
          현황
        </Condition>
      )}
      {activeModal === "analysis" && <Analysis onClose={() => setActiveModal(null)}>통합분석</Analysis>}
      {activeModal === "detail" && <Detail onClose={() => setActiveModal(null)}>상세분석</Detail>}

      {/* 우측 정보 스택 */}
      <RightInfo $open={railOpen}>
        {/* 1) 책임자 */}
        <InfoGroup>
          <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={() => setOpenManager((v)=>!v)} aria-expanded={openManager}>
            <InfoIcon
              $white
              src="/Icon/manager_icon.svg"
              alt="책임자"
              onError={(e) => {
                if (!e.currentTarget.dataset.fbk) {
                  e.currentTarget.dataset.fbk = 1;
                  e.currentTarget.src = "/icon/manager_icon.svg";
                }
              }}
            />
            <InfoLabel>책임자</InfoLabel>
            <InfoValue>{managerName}</InfoValue>
          </InfoItem>
          <InfoManager open={openManager} IsEmissionBtn={IsEmissionBtn}>
            <PanelActions>
              <PanelBtn IsEmissionBtn={IsEmissionBtn}>로그아웃</PanelBtn>
            </PanelActions>
          </InfoManager>
        </InfoGroup>

        {/* 2) 외부날씨 */}
        <InfoGroup>
          <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={() => setOpenWeather((v)=>!v)} aria-expanded={openWeather}>
            <InfoIcon
              $white
              src="/Icon/weather_icon.svg"
              alt="외부온도"
              onError={(e) => {
                if (!e.currentTarget.dataset.fbk) {
                  e.currentTarget.dataset.fbk = 1;
                  e.currentTarget.src = "/icon/weather_icon.svg";
                }
              }}
            />
            <InfoLabel>외부온도</InfoLabel>
            <InfoValue>{outerTemp == null ? "—" : `${Math.round(outerTemp)}°C`}</InfoValue>
          </InfoItem>
          <InfoWeather open={openWeather} IsEmissionBtn={IsEmissionBtn}>
            <p>외부 날씨</p>
            <p>외부 습도</p>
            <p>외부 풍속</p>
          </InfoWeather>
        </InfoGroup>

        {/* 3) 경고/알림 */}
        <InfoGroup>
          <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={() => setOpenAlert((v)=>!v)} aria-expanded={openAlert}>
            <InfoIcon
              src="/Icon/warning_icon.svg"
              alt="경고/알림"
              onError={(e) => {
                if (!e.currentTarget.dataset.fbk) {
                  e.currentTarget.dataset.fbk = 1;
                  e.currentTarget.src = "/icon/warning_icon.svg";
                }
              }}
            />
            <InfoLabel>경고/알림</InfoLabel>
            <InfoValue>{alertCount}</InfoValue>
          </InfoItem>
          <InfoAlert open={openAlert} IsEmissionBtn={IsEmissionBtn}>
            <p>경고 알림 제목</p>
            <p>경고 알림 내용</p>
            <PanelActions>
              <PanelBtn IsEmissionBtn={IsEmissionBtn}>메모 보기</PanelBtn>
              <PanelBtn IsEmissionBtn={IsEmissionBtn}>메모 쓰기</PanelBtn>
            </PanelActions>
          </InfoAlert>
        </InfoGroup>
      </RightInfo>

      <>
        {/* 헤더 */}
        <HeaderBox IsEmissionBtn={IsEmissionBtn}>
          <HeaderIcon src="public/Icon/header_title_logo.svg" alt="토리 빌딩" />
          <HeaderText>
            {active.active ? `토리 빌딩 - ${MODEL_TO_FLOOR[active.model] + 1}층` : "토리 빌딩"}
          </HeaderText>
        </HeaderBox>

        {/* 층 버튼 */}
        <FloorButtons $open={railOpen}>
          <FloorButton
            $open={railOpen}
            className="floor-rail"
            onClick={() => setActive({ active: false, model: null })}
            IsEmissionBtn={IsEmissionBtn}
          >
            <img src="public/Icon/Home_logo.svg" alt="전체보기" width={24} />
          </FloorButton>
          {MODELS.filter((model) => model !== "top").map((modelName) => (
            <FloorButton
              key={modelName}
              onClick={() => handleModelButtonClick(modelName)}
              className={active.model === modelName ? "active" : ""}
              IsEmissionBtn={IsEmissionBtn}
            >
              {MODEL_TO_FLOOR[modelName] + 1}F
            </FloorButton>
          ))}
          <FloorButton className="ToggleBtn" onClick={() => setRailOpen((prev) => !prev)} IsEmissionBtn={IsEmissionBtn}>
            <img src={railOpen ? "Icon/toggle_on.svg" : "Icon/toggle_off.svg"} alt={railOpen ? "패널 닫기" : "패널 열기"} />
          </FloorButton>
        </FloorButtons>
      </>
    </>
  );
}

export default Wing;
