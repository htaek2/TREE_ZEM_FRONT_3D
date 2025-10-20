import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";
import { MODEL_TO_FLOOR, MODELS } from "../constants";
import { name } from "dayjs/locale/ko";

// 🏢 헤더 박스 스타일
const HeaderBox = styled.div`
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  /* ⤵️ 이미지와 동일한 고정 사이즈(400×40) */
  box-sizing: border-box;
  width: 350px;
  height: 40px;
  padding: 0 16px; /* 좌우 여백만 */
  border-radius: 999px; /* 알약형 */
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;

  /* 중앙 진하게 → 양옆 점점 투명: 완전 대칭 */
  background: ${({ IsEmissionBtn }) => 
  IsEmissionBtn 
    ? `linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 170, 111, 0.12) 20%,
        rgba(0, 170, 111, 0.55) 40%,
        rgba(0, 170, 111, 0.92) 55%,
        rgba(0, 170, 111, 0.55) 68%,
        rgba(0, 170, 111, 0.12) 80%,
        rgba(0, 0, 0, 0) 100%
      )`
    : `linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(20, 20, 20, 0.12) 20%,
        rgba(20, 20, 20, 0.55) 40%,
        rgba(20, 20, 20, 0.92) 55%,
        rgba(20, 20, 20, 0.55) 68%,
        rgba(20, 20, 20, 0.12) 80%,
        rgba(0, 0, 0, 0) 100%
      )`
  };
`;

const HeaderIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
`;

const HeaderText = styled.span`
  white-space: nowrap;
`;

// 🏢 층 버튼 컨테이너
const FloorButtons = styled.div`
  position: absolute;
  left: ${({ $open }) =>
    $open
      ? "calc(230px)"
      : "calc(16px)"};
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
  align-items: stretch; /* 버튼을 열 폭에 맞춰 꽉 차게 */
`;

// 🔘 층 버튼
const FloorButton = styled.button`
  padding: 8px 8px;
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? 'rgba(0, 170, 111, 1)' : 'rgba(45, 45, 45, 0.85)'};
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

  // &:hover:not(.floor-rail):not(.ToggleBtn) {
  //   transform: translateX(4px);
  //   background-color: rgba(60, 60, 60, 0.95);
  //   border-color: rgba(255, 255, 255, 0.3);
  // }

  &.active {
    background-color: rgba(100, 100, 100, 0.95);
    border-color: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    // transform: translateX(8px);
  }

  > img.ToggleBtn {
    width: 20px;
    height: 20px;
  }
`;


// 🔄 리셋 버튼
const ResetButton = styled.button`
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// ⬅️ 좌측 날개 컨테이너
const LeftWing = styled.aside`
  position: absolute;
  left: ${({ $open }) =>
    $open
      ? "16px" /* 🔧 고정 여백 */
      : "calc(-1 * (16px + 232px + 40px))"}; /* 🔧 16(여백)+232(폭)+40(추가오프셋) */
  top: 56px; /* 상단 기준 */
  bottom: 20px; /* 하단에도 붙여서 전체 높이 확보 */
  width: 232px; /* 🔧 날개 폭 고정 */
  display: grid;

  /* 위에서부터: 실시간 사용량 / 전일 대비 / 전년 대비 / 버튼Dock */
  grid-template-rows: 210px 210px 210px auto; /* 🔧 각 카드 높이 고정 */

  gap: 12px; /* 모든 간격 동일 */
  z-index: 950; /* 토글(1100) > 버튼열(1000) > 패널(950) */

  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: left 360ms cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 260ms ease-out;
`;

/* 공통 카드(우측 박스와 동일 톤/opacity) + 우측 페이드 */
const WingCard = styled.div`
  position: relative;
  /* #000(검정) 15% opacity */
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? 'rgba(0, 170, 111, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px; /* 더 둥글게 */
  color: #fff;
  padding: 10px 8px;
  overflow: hidden;
  /* ⬇️ 카드 외곽(패딩/보더 포함) 기준으로 200×208 딱 맞추기 */
  width: 200px; /* 🔧 카드 폭 고정 */
  height: 208px; /* 🔧 카드 높이 고정 */
  box-sizing: border-box;
  display: flex; /* ⬅️ 세로 플렉스 */
  flex-direction: column; /* ⬅️ 위: 타이틀 / 아래: 리스트 */
  box-shadow: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? '0 0px 12px rgba(0, 0, 0, 0.3)' : ''};
`;

/* 상단 칩(“실시간 사용량”) — 우측 InfoItem과 동일 톤, 184×34 고정 */
const CardTitle = styled.div`
  width: 184px;
  min-width: 184px; /* 🔒 가로 수축 금지 */
  height: 34px;
  min-height: 34px; /* 🔒 세로 수축 금지 */
  flex: 0 0 34px; /* 🔒 flex 컨테이너(ChartCard)에서 높이 딱 고정 */
  line-height: 14px; /* ⬅️ 텍스트 자체 높이 고정 */
  box-sizing: border-box;
  border-radius: 9999px 0 0 9999px;
  padding: 8px 14px; /* ⬅️ 위/아래 8px 고정 (테두리 포함 총 34px 정확히) */
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
    IsEmissionBtn ? 'rgba(0, 170, 111, 1)' : 'rgba(45, 45, 45, 0.85)'};
  overflow: hidden;
  margin-bottom: 8px; /* ⬅️ 타이틀-리스트 간격만 딱 고정 */
  /* ✅ InfoItem과 동일한 우측 페이드(마스크) */
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
  /* ✅ 이전 장식 pseudo 비활성화 */
  &::before,
  &::after {
    content: none !important;
  }
`;

const StatList = styled.div`
  flex: 1; /* ⬅️ 카드의 남는 높이를 전부 차지 */
  display: grid;
  grid-template-rows: ${({ IsEmissionBtn }) => (IsEmissionBtn ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)')};
  height: 100%;

  > .TotalEmission {
    display: ${({ IsEmissionBtn }) => (IsEmissionBtn ? 'flex' : 'none')};
    align-items: center;
    justify-content: space-between;

  }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr auto; /* 아이콘 | 라벨 | 값 */
  align-items: center;
  column-gap: 10px;
  padding: 0 10px; /* ⬅️ 세로 패딩 0 (높이는 1fr이 담당) */
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

/* 차트 카드(틀만; 실제 그래프는 이후 연결) */
const ChartCard = styled(WingCard)`
  display: flex; /* 내부를 세로로 채우게 */
  flex-direction: column;
`;

const ChartCanvas = styled.div`
  /* 208(box) - 2(border) - 20(padding) - 34(title) - 18(gap: 8+10) = 134 */
  height: 134px;
  flex: 0 0 134px;
  border-radius: 10px;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.12) 1px,
      transparent 1px
    ),
    linear-gradient(to top, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 16px 100%, 100% 16px;
  overflow: hidden;
`;

const DockActions = styled.div`
  /* 카드(200px)와 좌우 에지 정렬 */
  width: 200px;
  margin: 50 auto; /* LeftWing(232px) 안에서 중앙 정렬 */
  box-sizing: border-box;
  display: flex;
  justify-content: space-between; /* 좌/우 끝에 붙이고 사이 간격 자동 */
  align-items: center;
  padding: 0; /* 버튼 60×40 유지 */
`;

const DockBtn = styled.button`
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? 'rgba(0, 170, 111, 1)' : 'rgba(45, 45, 45, 0.85)'};
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  border-radius: 12px;
  font-size: 10px; /* 요청 폰트 크기 */
  font-weight: 800; /* extrabold */
  width: 60px; /* 고정 */
  height: 40px; /* 고정 */
  box-sizing: border-box; /* ⬅️ padding/border 포함해도 총 60×40 유지 */
  cursor: pointer;
  overflow: hidden; /* ⬅️ 아이콘이 60×40 박스 밖으로 나가면 잘라냄 */
  position: relative; /* ⬅️ 아이콘/라벨 절대배치 기준 */
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
  font-weight: 800; /* Nanum Gothic ExtraBold 대응 */
  pointer-events: none;
`;

const DockIcon = styled.img`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(
    var(--dock-label-bottom) + var(--dock-label-h) + var(--dock-gap)
  );
  width: auto; /* ⬅️ SVG 파일의 고유 크기 그대로 */
  height: auto; /* ⬅️ SVG 파일의 고유 크기 그대로 */
  max-width: none; /* ⬅️ 전역 img 리셋(max-width:100%) 무력화 */
  max-height: none; /* ⬅️ 전역 리셋 무력화 */
  display: block;
`;

// 우측 상단 정보 스택
const RightInfo = styled.div`
  position: absolute;
  top: 56px;
  display: grid;
  gap: ${({ InfoOpen }) => (InfoOpen ? "8px" : "4px")};
  z-index: 120;
  right: ${({ $open }) =>
    $open ? "16px" : "calc(-1 * (16px + 230px + 40px))"};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: right 360ms cubic-bezier(0.22, 0.61, 0.36, 1),
              opacity 360ms ease-out;
`;

/* 각 항목 박스 */
const InfoItem = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 20px var(--label-w, 64px) 1fr;
  align-items: center;
  column-gap: 10px;

  box-sizing: border-box; /* 🔧 외곽 184×34 정확히 */
  width: 184px; /* 🔧 폭 고정 */
  min-width: 184px;
  height: 34px; /* 🔧 높이 고정 */
  min-height: 34px;
  padding: 7px 14px; /* 🔧 18px 아이콘 기준 상하 7px */

  /* 페이드 폭(마지막부터 몇 px를 서서히 없앨지) */
  --fade: 26px;
  padding-right: calc(14px + var(--fade)); /* 🔧 좌우 14px 통일 */
  border-radius: 9999px 0 0 9999px; /* 🔧 완전한 알약 */
  background: ${({ IsEmissionBtn }) =>
    IsEmissionBtn ? 'rgba(0, 170, 111, 1)' : 'rgba(45, 45, 45, 0.85)'};
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  /* ⬇️ 가운데부터 사라지게: --cut 지점까지는 완전 불투명(보장),
        이후 100%로 갈수록 투명 */
  --cut: 60%; /* ← 페이드 시작 지점(50~65% 추천). 퍼센트 말고 px로 주고 싶으면 style로 덮어써도 됨 */
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)),
    /* 완전 불투명 구간 확보 */ rgba(0, 0, 0, 0.9) var(--cut, 60%),
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
`;

const InfoIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
  /* 흰색으로 강제할 때만 쓰는 옵션.
     transient prop($white)는 DOM으로 안 흘러감 */
  filter: ${({ $white }) => ($white ? "brightness(0) invert(1)" : "none")};
`;

const InfoLabel = styled.span`
  opacity: 0.95;

  text-overflow: ellipsis;
  line-height: 20px; /* ✅ 아이콘(20px)과 수직맞춤 */
`;

const InfoValue = styled.span`
  margin-left: 0; /* ✅ 그리드라 필요없음 */
  justify-self: start; /* ✅ 값 열을 항상 왼쪽 시작 */
  text-align: left;
  font-weight: 800;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 20px; /* ✅ 아이콘과 수직맞춤 */
`;

const InfoAlert = styled.div`
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
  background-color: rgba(0, 0, 0, 0.15);
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
  padding: ${({ isInfoAlertOpen }) => (isInfoAlertOpen ? "8px 8px" : "0 14px")};
  max-height: ${({ isInfoAlertOpen }) => (isInfoAlertOpen ? "100px" : "0")};
  opacity: ${({ isInfoAlertOpen }) => (isInfoAlertOpen ? 1 : 0)};
  position: relative;
  overflow: visible; /*자식 부모 넘어감*/
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

    /* 말풍선 꼬리 */
  &::after {
    content: "";
    position: absolute;
    top: -16px;          /* 꼬리 위치 */
    left: 8px;             /* 왼쪽에서 위치 조정 */
    border-width: 8px;     /* 삼각형 크기 */
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.15) transparent;
    z-index: 100;
  }
`;
const InfoManager = styled(InfoAlert)``;
const InfoWeather = styled(InfoAlert)``;





function Wing({
  railOpen,
  onClose,
  todayUsage = { todayUsage },
  yesterdayUsage = { yesterdayUsage },
  monthUsage = { monthUsage },
  lastMonthUsage = { lastMonthUsage },
  buildingInfo = { buildingInfo },
  active = { active },
  setActive = { setActive },
  selectedDevice,
  setSelectedDevice,
  setRailOpen,
  billInfo = { billInfo },
}) {
  // 우측 패널 값들
  const [managerName] = useState("이**"); // TODO: 실제 데이터 연결하면 교체
  const [alertCount, setAlertCount] = useState(0);
  const [outerTemp, setOuterTemp] = useState(null);

  // 외부 날씨: OpenWeatherMap (무료 키) 사용. 키 없으면 26도로 폴백
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY; // .env에 넣기
    const fetchWeather = async (lat = 37.5665, lon = 126.978) => {
      // 서울 기본
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

    // 위치 권한 시도 → 실패/거부 시 서울로 폴백
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
    if (modelName === "top") {
      return;
    }

    setActive({
      active: true,
      model: modelName,
    });
    setSelectedDevice(null); // 층 변경 시 기기 선택 해제
  };
  
  // 🍪
  const [activeModal, setActiveModal] = useState(null);
  const [IsEmissionBtn, setIsEmissionBtn] = useState(false);

  // 🍪 탄소중립 모드 변경 시 이름 변경
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

  // 🍪 우측 info 클릭 동작 함수
  const [IsInfoOpen, setIsInfoOpen] = useState(null);
  const InfoOpen = (index) => {
    setIsInfoOpen(IsInfoOpen === index ? null : index);
  };


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
          <DockBtn 
            onClick={() => setIsEmissionBtn(prev => !prev)}
            IsEmissionBtn={IsEmissionBtn}
          >
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
      {activeModal === "analysis" && (
        <Analysis onClose={() => setActiveModal(null)}>통합분석</Analysis>
      )}
      {activeModal === "detail" && (
        <Detail onClose={() => setActiveModal(null)}>상세분석</Detail>
      )}

      {/* 우측 정보 스택 */}
      <RightInfo $open={railOpen} InfoOpen={IsInfoOpen}>
        {/* 1) 책임자 */}
        <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={()=>InfoOpen(1)}>
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
          <InfoManager isInfoAlertOpen={IsInfoOpen === 1}>
            <button>로그아웃</button>
          </InfoManager>


        {/* 2) 외부날씨 */}
        <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={()=>InfoOpen(2)}>
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
          <InfoValue>
            {outerTemp == null ? "—" : `${Math.round(outerTemp)}°C`}
          </InfoValue>
        </InfoItem>
          <InfoWeather isInfoAlertOpen={IsInfoOpen === 2}>
            <p>외부 날씨</p>
            <p>외부 습도</p>
            <p>외부 풍속</p>
          </InfoWeather>

        {/* 3) 경고/알림 — 원색 아이콘 유지(필터 미적용) */}
        <InfoItem IsEmissionBtn={IsEmissionBtn} onClick={()=>InfoOpen(3)}>
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

          <InfoAlert isInfoAlertOpen={IsInfoOpen === 3}>
            <p>경고 알림 제목</p>
            <p>경고 알림 내용</p>
            <p>
              <button>메모 보기</button>
              <button>메모 보기</button>
            </p>
          </InfoAlert>


      </RightInfo>

      <>
        {/* 헤더 박스 */}
        <HeaderBox IsEmissionBtn={IsEmissionBtn}>
          <HeaderIcon src="public/Icon/header_title_logo.svg" alt="토리 빌딩" />
          <HeaderText>
            {active.active
              ? `토리 빌딩 - ${MODEL_TO_FLOOR[active.model] + 1}층`
              : "토리 빌딩"}
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
          <FloorButton
            className="ToggleBtn" 
            onClick={() => setRailOpen((prev) => !prev)}
            IsEmissionBtn={IsEmissionBtn}
          >
            <img 
              src={railOpen ? "Icon/toggle_on.svg" : "Icon/toggle_off.svg"}
              alt={railOpen ? "패널 닫기" : "패널 열기"}
            />
          </FloorButton>
        </FloorButtons>

        {/* 기기 정보 카드 */}
        {selectedDevice && (
          <DeviceInfoCard
            device={selectedDevice}
            onClose={handleCloseDeviceCard}
            onControl={handleDeviceControl}
          />
        )}
      </>
    </>
  );
}

export default Wing;
