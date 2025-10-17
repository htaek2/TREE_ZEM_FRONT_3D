import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";
import { MODEL_TO_FLOOR, MODELS } from "../constants";



// 🏢 헤더 박스 스타일
const HeaderBox = styled.div`
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translate(-50%, -120%);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  background: linear-gradient(
    to right,
    rgba(45, 45, 45, 0) 0%,
    rgba(45, 45, 45, 0.95) 20%,
    rgba(121, 121, 121, 0.95) 80%,
    rgba(174, 171, 171, 0) 100%
  );
  color: white;
  padding: 6px 80px;
  border-radius: 8px;

  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;

  box-shadow: none;

  /* 반응형 스타일 */
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 16px;
    top: 8%;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const HeaderIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
  }
`;

const HeaderText = styled.span`
  white-space: nowrap;
`;

// 🏢 층 버튼 컨테이너
const FloorButtons = styled.div`
  position: absolute;
  /* 열림이면 패널 옆, 닫힘이면 토글 옆 */
  left: ${({ $open }) =>
    $open
      ? "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap) + var(--wing-width) + var(--panel-gap))"
      : "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap))"};
  z-index: 10;
  top: 50%;
  width: var(--rail-width);
  transform: translateY(-50%);
  transition: left 340ms cubic-bezier(0.22,0.61,0.36,1);

  will-change: transform, opacity;
  pointer-events: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;       /* 버튼을 열 폭에 맞춰 꽉 차게 */

  @media (max-width: 768px) {
    left: ${({ $open }) =>
      $open
        ? "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap) + var(--wing-width) + var(--panel-gap))"
        : "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap))"};
    gap: 6px;
  }
`;

// 🔘 층 버튼
const FloorButton = styled.button`
  padding: 14px 12px;
  background-color: rgba(45, 45, 45, 0.85);
  color: white;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateX(4px);
    background-color: rgba(60, 60, 60, 0.95);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background-color: rgba(100, 100, 100, 0.95);
    border-color: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
    transform: translateX(8px);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
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

  @media (max-width: 768px) {
    right: 10px;
    bottom: 10px;
    padding: 12px 20px;
    font-size: 13px;
  }
`;


// ⬅️ 좌측 날개 컨테이너
const LeftWing = styled.aside`
  position: absolute;
  left: ${({ $open }) =>
    $open
     ? "20px"                                  /* 🔧 고정 여백 */
     : "calc(-1 * (20px + 232px + 40px))"};    /* 🔧 20(여백)+232(폭)+40(추가오프셋) */
  top: 56px;                  /* 상단 기준 */
  bottom: 20px;               /* 하단에도 붙여서 전체 높이 확보 */
  width: 232px;                                 /* 🔧 날개 폭 고정 */
  display: grid;

    /* 위에서부터: 실시간 사용량 / 전일 대비 / 전년 대비 / 버튼Dock */
  grid-template-rows: 210px 210px 210px auto;   /* 🔧 각 카드 높이 고정 */
 
  gap: 12px;                  /* 모든 간격 동일 */
  z-index: 950;               /* 토글(1100) > 버튼열(1000) > 패널(950) */


  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
    left 360ms cubic-bezier(0.22,0.61,0.36,1),
    opacity 260ms ease-out;
`;

/* 공통 카드(우측 박스와 동일 톤/opacity) + 우측 페이드 */
const WingCard = styled.div`
  position: relative;
  /* #000(검정) 15% opacity */
  background: rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;                 /* 더 둥글게 */
  color: #fff;
  padding: 10px 12px;
  overflow: hidden;
  /* ⬇️ 카드 외곽(패딩/보더 포함) 기준으로 200×208 딱 맞추기 */
  width: 200px;                               /* 🔧 카드 폭 고정 */
  height: 208px;                              /* 🔧 카드 높이 고정 */
  box-sizing: border-box;
  display: flex;               /* ⬅️ 세로 플렉스 */
  flex-direction: column;      /* ⬅️ 위: 타이틀 / 아래: 리스트 */
`;


/* 상단 칩(“실시간 사용량”) — 우측 InfoItem과 동일 톤, 184×34 고정 */
const CardTitle = styled.div`
  width: 184px;
  min-width: 184px;   /* 🔒 가로 수축 금지 */
  height: 34px;
  min-height: 34px;   /* 🔒 세로 수축 금지 */
  flex: 0 0 34px;     /* 🔒 flex 컨테이너(ChartCard)에서 높이 딱 고정 */
  line-height: 14px;          /* ⬅️ 텍스트 자체 높이 고정 */
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 9px 14px;          /* ⬅️ 위/아래 9px 고정 (테두리 포함 총 34px 정확히) */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: 'Nanum Gothic', system-ui, sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(45,45,45,0.85);
  overflow: hidden;
  margin-bottom: 8px;          /* ⬅️ 타이틀-리스트 간격만 딱 고정 */
  /* ✅ InfoItem과 동일한 우측 페이드(마스크) */
  --fade: 36px;
  --cut: 60%;
  padding-right: calc(14px + var(--fade));
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
  /* ✅ 이전 장식 pseudo 비활성화 */
  &::before, &::after { content: none !important; }
`;

const StatList = styled.div`
  flex: 1;                                      /* ⬅️ 카드의 남는 높이를 전부 차지 */
  display: grid;
  grid-template-rows: repeat(3, 1fr);           /* ⬅️ 세 행 동일 높이 */
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr auto;  /* 아이콘 | 라벨 | 값 */
  align-items: center;
  column-gap: 10px;
  padding: 0 10px;                       /* ⬅️ 세로 패딩 0 (높이는 1fr이 담당) */
  border-bottom: 1px solid rgba(255,255,255,0.10);
  &:last-child { border-bottom: 0; }
`;

const StatIcon = styled.img`
  width: 20px; height: 20px; display: block;
  filter: brightness(0) invert(1);
`;

const StatLabel = styled.span`
  font-family: 'Nanum Gothic', system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.2px;
`;
const StatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Nanum Gothic', system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
`;

const StatUnit = styled.span``;











/* 차트 카드(틀만; 실제 그래프는 이후 연결) */
const ChartCard = styled(WingCard)`
  padding: 10px 12px;                 // 🔧 실시간 카드와 동일(위/아래 10px)
  display: flex;             /* 내부를 세로로 채우게 */
  flex-direction: column;

`;





const ChartCanvas = styled.div`
  /* 208(box) - 2(border) - 20(padding) - 34(title) - 18(gap: 8+10) = 134 */
  height: 134px;
  flex: 0 0 134px;
  border-radius: 10px;
  margin-top: 10px;
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
  justify-items: center;  /* 칸 안 버튼 가로 중앙 */
  align-items: center;    /* 칸 안 버튼 세로 중앙 */
`;


const DockBtn = styled.button`
  background: rgba(45,45,45,0.85);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 12px;
  font-size: 10px;        /* 요청 폰트 크기 */
  font-weight: 800;       /* extrabold */
  width: var(--dock-w);
  height: var(--dock-h);
  box-sizing: border-box; /* ⬅️ padding/border 포함해도 총 60×40 유지 */
  cursor: pointer;
  overflow: hidden;  /* ⬅️ 아이콘이 60×40 박스 밖으로 나가면 잘라냄 */
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
 bottom: calc(var(--dock-label-bottom) + var(--dock-label-h) + var(--dock-gap));
 width: auto;       /* ⬅️ SVG 파일의 고유 크기 그대로 */
 height: auto;      /* ⬅️ SVG 파일의 고유 크기 그대로 */
 max-width: none;   /* ⬅️ 전역 img 리셋(max-width:100%) 무력화 */
 max-height: none;  /* ⬅️ 전역 리셋 무력화 */
 display: block;
`;










// 우측 상단 정보 스택
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
  box-sizing: border-box;          /* 🔧 외곽 184×34 정확히 */
  width: 184px;                    /* 🔧 폭 고정 */
  min-width: 184px;
  height: 34px;                    /* 🔧 높이 고정 */
  min-height: 34px;
  padding: 7px 14px;               /* 🔧 18px 아이콘 기준 상하 7px */
  
  /* 페이드 폭(마지막부터 몇 px를 서서히 없앨지) */
  --fade: 36px;
  padding-right: calc(14px + var(--fade));  /* 🔧 좌우 14px 통일 */
  border-radius: 9999px;           /* 🔧 완전한 알약 */
  background: rgba(45,45,45,0.85);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  /* ⬇️ 가운데부터 사라지게: --cut 지점까지는 완전 불투명(보장),
        이후 100%로 갈수록 투명 */
  --cut: 60%; /* ← 페이드 시작 지점(50~65% 추천). 퍼센트 말고 px로 주고 싶으면 style로 덮어써도 됨 */
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--cut, 60%) - var(--fade)), /* 완전 불투명 구간 확보 */
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
`;

const InfoValue = styled.span`
  margin-left: auto;  /* 값은 오른쪽 정렬 */
  font-weight: 800;
`;





function Wing({railOpen, onClose, gasUsage={gasUsage}, elecUsage={elecUsage} ,waterUsage={waterUsage}, active={active}, setActive={setActive}, selectedDevice, setSelectedDevice}) {

  // 우측 패널 값들
  const [managerName] = useState("이**"); // TODO: 실제 데이터 연결하면 교체
  const [alertCount, setAlertCount] = useState(0);
  const [outerTemp, setOuterTemp] = useState(null);
  const [usage, setUsage] = useState({ power: 0, gas: 0, water: 0 }); // TODO: 백엔드 연동 시 갱신

  // 외부 날씨: OpenWeatherMap (무료 키) 사용. 키 없으면 26도로 폴백
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY; // .env에 넣기
    const fetchWeather = async (lat = 37.5665, lon = 126.9780) => { // 서울 기본
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


    // 🍪
  const [activeModal, setActiveModal] = useState(null);





  return (
    <>
      {/* 좌측 날개 */}
      <LeftWing $open={railOpen}>
        {/* 실시간 사용량 */}
        <WingCard onClick={() => setActiveModal("condition")}>
          <CardTitle>실시간 사용량</CardTitle>
          <StatList>
            <StatRow>
              <StatIcon
                src="Icon/elect_icon.svg"
                alt="전력"
                onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/elect_icon.svg"; }}}
              />
              <StatLabel>전력</StatLabel>
              <StatValue>
                <span>{usage.power}</span><StatUnit>kWh</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow>
              <StatIcon
                src="/Icon/gas_icon.svg"
                alt="가스"
                onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/gas_icon.svg"; }}}
              />
              <StatLabel>가스</StatLabel>
              <StatValue>
                <span>{usage.gas}</span><StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow>
              <StatIcon
                src="/Icon/water_icon.svg"
                alt="수도"
                onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/water_icon.svg"; }}}
              />
              <StatLabel>수도</StatLabel>
              <StatValue>
                <span>{usage.water}</span><StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>
          </StatList>
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
              src="public/Icon/analysis_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/analysis_icon.svg"; }}}
            />
            <DockLabel>통합분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("detail")} >
            <DockIcon
              src="public/Icon/detail_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/detail_icon.svg"; }}}
            />
            <DockLabel>상세분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("emission")}>
            <DockIcon 
              src="public/Icon/emission_icon.svg"
              alt=""
              aria-hidden="true"
              onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fbk){ img.dataset.fbk=1; img.src="/Icon/analysis_icon.svg"; }}}
            />
            <DockLabel>탄소배출</DockLabel>
          </DockBtn>
        </DockActions>
      </LeftWing>
        
        {activeModal === "condition" && (
          <Condition onClose={() => setActiveModal(null)}>현황</Condition>
        )}
        {activeModal === "analysis" && (
          <Analysis onClose={() => setActiveModal(null)}>통합분석</Analysis>
        )}
        {activeModal === "detail" && (
          <Detail onClose={() => setActiveModal(null)}>상세분석</Detail>
        )}
        {activeModal === "emission" && (
          <Emission onClose={() => setActiveModal(null)}>탄소배출</Emission>
        )}




      {/* 우측 정보 스택 */}
      <RightInfo $open={railOpen}>
        {/* 1) 책임자 */}
        <InfoItem>
          <InfoIcon
            $white
            src="/Icon/manager_icon.svg"
            alt="책임자"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/icon/manager_icon.svg"; } }}
          />
          <InfoLabel>책임자</InfoLabel>
          <InfoValue>{managerName}</InfoValue>
        </InfoItem>
      
        {/* 2) 외부날씨 */}
        <InfoItem>
          <InfoIcon
            $white
            src="/Icon/weather_icon.svg"
            alt="외부온도"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/icon/weather_icon.svg"; } }}
          />
          <InfoLabel>외부온도</InfoLabel>
          <InfoValue>
            {outerTemp == null ? "—" : `${Math.round(outerTemp)}°C`}
          </InfoValue>
        </InfoItem>
      
        {/* 3) 경고/알림 — 원색 아이콘 유지(필터 미적용) */}
        <InfoItem>
          <InfoIcon
            src="/Icon/warning_icon.svg"
            alt="경고/알림"
            onError={(e) => { if (!e.currentTarget.dataset.fbk){ e.currentTarget.dataset.fbk=1; e.currentTarget.src="/icon/warning_icon.svg"; } }}
          />
          <InfoLabel>경고/알림</InfoLabel>
          <InfoValue>{alertCount}</InfoValue>
        </InfoItem>
      </RightInfo>

       <>
          {/* 헤더 박스 */}
          <HeaderBox>
            <HeaderIcon
              src="public/Icon/header_title_logo.svg"
              alt="토리 빌딩"
            />
            <HeaderText>
              {active.active
                ? `토리 빌딩 - ${MODEL_TO_FLOOR[active.model] + 1}층`
                : "토리 빌딩"}
            </HeaderText>
          </HeaderBox>

          {/* 층 버튼 */}
          <FloorButtons>
            <FloorButton $open={railOpen} className="floor-rail"
              onClick={() => setActive({ active: false, model: null })}
            >
              <img src="public/Icon/Home_logo.svg" alt="전체보기" width={24} />
            </FloorButton>
            {MODELS.filter((model) => model !== "top").map((modelName) => (
              <FloorButton
                key={modelName}
                onClick={() => handleModelButtonClick(modelName)}
                className={active.model === modelName ? "active" : ""}
              >
                {MODEL_TO_FLOOR[modelName] + 1}F
              </FloorButton>
            ))}
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


