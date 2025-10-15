import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";







// ⬅️ 좌측 날개 컨테이너
const LeftWing = styled.aside`
  position: absolute;
  left: ${({ $open }) =>
    $open
      ? "var(--wing-left)"
      : "calc(-1 * (var(--wing-left) + var(--wing-width) + 40px))"};
  top: 56px;                  /* 상단 기준 */
  bottom: 20px;               /* 하단에도 붙여서 전체 높이 확보 */
  width: var(--wing-width);
  display: grid;

    /* 위에서부터: 실시간 사용량 / 전일 대비 / 전년 대비 / 버튼Dock */
  grid-template-rows: var(--wing-card-h) var(--wing-card-h) var(--wing-card-h) auto;
 
  gap: 12px;                  /* 모든 간격 동일 */
  z-index: 950;               /* 토글(1100) > 버튼열(1000) > 패널(950) */

  min-height: 0;
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
  width: var(--wing-card-w);
  height: var(--wing-card-h);
  box-sizing: border-box;
`;

/* 상단 칩(“실시간 사용량”) — 스샷의 옅은 흰 그라데이션 바 */
const CardTitle = styled.div`
  /* 고정 크기 */
  width: 184px;
  height: 34px;
  box-sizing: border-box;

  /* 레이아웃: 좌측 정렬 */
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  /* 타이포: Bold 18px */
  font-family: 'Nanum Gothic', system-ui, sans-serif;
  font-weight: 700;              /* Bold */
  font-size: 18px;
  line-height: 34px;

  color: #fff;
  background: linear-gradient(180deg,
    rgba(60,60,60,0.95) 0%,
    rgba(45,45,45,0.85) 100%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  position: relative;            /* ⬅️ 페이드 오버레이 기준 */

  /* 한 줄 고정 + 넘치면 말줄임 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* ✅ 오른쪽 페이드 오버레이(마스크 대신 써서 폭 안 줄어듦) */
  &::after {
    content: "";
    position: absolute;
    top: 0; right: 0;
    width: 28px;                 /* 페이드 폭 */
    height: 100%;
    pointer-events: none;
    /* 배경과 자연스럽게 이어지는 페이드 */
    background: linear-gradient(
      to right,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0.35) 60%,
      rgba(0,0,0,0.85) 100%
    );
  }
`;

/* 실시간 사용량의 행들(전력/가스/수도) */
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
  filter: brightness(0) invert(1);   /* 흰색화 */
`;
const StatLabel = styled.span` opacity: .95; `;
const StatValue = styled.span` margin-left: auto; font-weight: 800; `;

/* 차트 카드(틀만; 실제 그래프는 이후 연결) */
const ChartCard = styled(WingCard)`
  padding: 12px 12px 12px;
  display: flex;             /* 내부를 세로로 채우게 */
  flex-direction: column;
  min-height: 0;             /* grid 안에서 overflow 방지 */
`;





const ChartCanvas = styled.div`
  flex: 1;                   /* 남는 공간을 전부 차지 */
  min-height: 140px;         /* 너무 작아지지 않게 하한선만 */
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
  padding: 8px 12px;
  /* 페이드 폭(마지막부터 몇 px를 서서히 없앨지) */
  --fade: 36px;
   padding-right: calc(12px + var(--fade));
   border-radius: 18px;
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
  width: 18px;
  height: 18px;
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











function Wing({railOpen, onClose}) {

  // 우측 패널 값들
  const [managerName] = useState("이**"); // TODO: 실제 데이터 연결하면 교체
  const [alertCount, setAlertCount] = useState(0);
  const [outerTemp, setOuterTemp] = useState(null);

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

          <StatRow>
            <StatIcon
              src="/Icon/power_icon.svg"
              alt="전력"
              onError={(e)=>{ e.currentTarget.style.display='none'; }}
            />
            <StatLabel>전력</StatLabel>
            <StatValue>43,235.3 kWh</StatValue>
          </StatRow>

          <StatRow>
            <StatIcon
              src="/Icon/gas_icon.svg"
              alt="가스"
              onError={(e)=>{ e.currentTarget.style.display='none'; }}
            />
            <StatLabel>가스</StatLabel>
            <StatValue>00.0 m³</StatValue>
          </StatRow>

          <StatRow>
            <StatIcon
              src="/Icon/water_icon.svg"
              alt="수도"
              onError={(e)=>{ e.currentTarget.style.display='none'; }}
            />
            <StatLabel>수도</StatLabel>
            <StatValue>00.0 m³</StatValue>
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
    </>
  );
}

export default Wing;


