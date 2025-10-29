import { useState, useEffect, useRef, useLayoutEffect } from "react";
import styled, { css } from "styled-components";

import Condition from "../modal/Condition";
import Detail from "../modal/Detail";
import Analysis from "../modal/Analysis";
import { MODEL_TO_FLOOR, MODELS } from "../constants";

/* ===========================
   Utils (표시 문자열 / 아이콘 키 / 이미지 fallback)
=========================== */
const WEATHER_KO = {
  0: "맑음",
  1: "비",
  2: "눈",
  3: "흐림",
  sunny: "맑음",
  rainy: "비",
  snowy: "눈",
  cloudy: "흐림",
};
// 숫자/문자 어떤 값이 들어와도 한글 라벨로 바꿔줌. 없으면 "—"로 표시
const toLabel = (raw) => {
  if (raw === null || raw === undefined || raw === "") return "—";
  const s = String(raw).trim().toLowerCase();
  const n = Number(s);
  if (Number.isFinite(n)) return WEATHER_KO[n] ?? `코드 ${n}`;
  return WEATHER_KO[s] ?? s;
};
// 날씨 상태를 아이콘 파일 이름에 맞는 키(sunny/rainy...)로 맞춰줌
const toIconKey = (raw) => {
  if (raw == null || raw === "") return "cloudy";
  const s = String(raw).trim().toLowerCase();
  const n = Number(s);
  if (Number.isFinite(n))
    return ({ 0: "sunny", 1: "rainy", 2: "snowy", 3: "cloudy" })[n] ?? "cloudy";
  return s;
};

// 공통 이미지 fallback 핸들러: 첫 실패에만 fallback 적용
const imgFallback = (fallback) => (e) => {
  const img = e.currentTarget;
  if (!img.dataset.fbk) {
    img.dataset.fbk = 1;
    img.src = fallback;
  }
};

/* ===========================
   공통 스타일 helpers
=========================== */
// === 공통 스타일 토큰 (한 곳에서 일괄 조절) ===
const PANEL_ALPHA_OFF = 0.5; // 탄소배출 OFF일 때 패널 불투명도
const PANEL_ALPHA_ON = 0.3; // 탄소배출 ON(초록)일 때 패널 불투명도
const PANEL_BORDER_ALPHA = 0.12;
const PANEL_SHADOW = "2px 3px 5px 0 rgba(0,0,0,.5)";
const EMISSION_UNIT = "㎥";
const SHADOW_TEXT   = "2px 3px 4px rgba(0,0,0,0.3)";
const SHADOW_FILTER = "drop-shadow(2px 3px 4px rgba(0,0,0,0.3))";

const textShadowIfOn = css`
  ${({ $IsEmissionBtn }) => $IsEmissionBtn && `text-shadow: ${SHADOW_TEXT};`}
`;



// OFF/ON에 따라 동일 로직으로 배경 생성
const panelBg = ({ $IsEmissionBtn }) =>
  $IsEmissionBtn
    ? `rgba(0,170,111, ${PANEL_ALPHA_ON})`
    : `rgba(45,45,45, ${PANEL_ALPHA_OFF})`;

// 탄소배출 토글에 따른 소프트 배경 색상(카드, 패널용)
const bgPill = ($IsEmissionBtn, alphaOff = 0.85, alphaOn = 1) =>
  $IsEmissionBtn ? `rgba(0,170,111, ${alphaOn})` : `rgba(45,45,45, ${alphaOff})`;

// 알약형 공통 베이스(타이틀/라벨)
const pillBase = css`
  width: 184px;
  min-width: 184px;
  height: 34px;
  min-height: 34px;
  flex: 0 0 34px;
  line-height: 14px;
  
  /* 안쪽 여백과 배치 */
  box-sizing: border-box;
  border-radius: 9999px 0 0 9999px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #FAFAFA;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
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
  color: #FAFAFA;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;
  --hdrA: 0.92; /* 가운데 진한 구간 알파(필요시만 조절) */
  background: ${({ $IsEmissionBtn }) =>
    $IsEmissionBtn
      ? `linear-gradient(90deg,
        rgba(0,170,111,0) 0%,
        rgba(0,170,111,.22) 20%,
        rgba(0,170,111,.65) 45%,
        rgba(0,170,111,var(--hdrA)) 55%,
        rgba(0,170,111,.65) 68%,
        rgba(0,170,111,.22) 80%,
        rgba(0,170,111,0) 100%)`
      : `linear-gradient(90deg,
        rgba(0,0,0,0) 0%,
        rgba(20,20,20,.12) 20%,
        rgba(20,20,20,.55) 40%,
        rgba(20,20,20,var(--hdrA)) 55%,
        rgba(20,20,20,.55) 68%,
        rgba(20,20,20,.12) 80%,
        rgba(0,0,0,0) 100%)`};
  box-shadow: none;
  transition: background 0.24s ease;
`;

const HeaderIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: ${({ $IsEmissionBtn }) =>
    `brightness(0) invert(1)${$IsEmissionBtn ? ` ${SHADOW_FILTER}` : ""}`};
`;

const HeaderText = styled.span`
  white-space: nowrap;
  ${textShadowIfOn}
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
  background: ${({ $IsEmissionBtn }) => bgPill($IsEmissionBtn)};
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


const FloorImg = styled.img`
  display: block;
  filter: ${({ $IsEmissionBtn }) =>
    `brightness(0) invert(1)${$IsEmissionBtn ? ` ${SHADOW_FILTER}` : ""}`};
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
  grid-template-rows: 210px 210px 210px;
  gap: 8px;
  z-index: 950;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: left 360ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 260ms ease-out;
`;

const WingCard = styled.div`
  position: relative;
  background: ${panelBg}; /* ✅ 배경 통일 */
  border: 1px solid rgba(255, 255, 255, ${PANEL_BORDER_ALPHA});
  border-radius: 10px;
  color: #FAFAFA;
  padding: 8px 6px;
  overflow: hidden;
  width: 200px;
  height: 208px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: ${PANEL_SHADOW};
`;

const CardTitle = styled.div`
  ${pillBase}
  background: ${({ $IsEmissionBtn }) => bgPill($IsEmissionBtn)};
  ${textShadowIfOn}
`;

const StatList = styled.div`
  flex: 1;
  display: grid;
  grid-template-rows: ${({ $IsEmissionBtn }) =>
    $IsEmissionBtn ? "repeat(4, 1fr)" : "repeat(3, 1fr)"};
  height: 100%;
  > .TotalEmission {
    display: ${({ $IsEmissionBtn }) => ($IsEmissionBtn ? "flex" : "none")};
    align-items: center;
    justify-content: space-between;
  }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 20px auto 1fr;
  align-items: center;
  column-gap: 16px;
  padding: 0.5 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &:last-child {
    border-bottom: 0;
  }
`;

const StatIcon = styled.img`
  width: 24px;
  height: 24px;
  display: block;
  filter: ${({ $IsEmissionBtn }) =>
   `brightness(0) invert(1)${$IsEmissionBtn ? ` ${SHADOW_FILTER}` : ""}`};
  margin: 4px 4px 8px 4px;
`;

const StatLabel = styled.span`
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  ${textShadowIfOn}
`;

const StatValue = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  ${textShadowIfOn}
`;

const StatUnit = styled.span``;

const ChartCard = styled(WingCard)`
  display: flex;
  flex-direction: column;
`;

const ChartCanvas = styled.div`
  height: 150px;
  flex: 0 0 150px;
  margin: 10px 0 10px;
  position: relative;
  z-index: 5; /* 툴팁이 상단 카드 내부에서 묻히지 않도록 */
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  overflow: hidden;
  padding: 0;
  display: block;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  & *:focus { outline: none; }

  & > svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

// 👇 ChartCanvas 정의 아래에 추가
const LegendWrap = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;
  display: flex;
  gap: 6px;
  align-items: center;
  line-height: 1;
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #fafafa;
  white-space: nowrap;
`;

const SwatchSquare = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({$color}) => $color};
  border: 1px solid rgba(0,0,0,0.35);
`;

// 라인+동그라미 미니 스와치(12×10)
const LineDot = ({ line="#FAFAFA", dot="#FAFAFA" }) => (
  <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
    <path d="M1 8 L15 2" fill="none" stroke={line} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="8" cy="5" r="2.2" fill={dot} />
  </svg>
);



const DockActions = styled.div`
  position: absolute;   /* 패널 내부 하단에 고정 */
  left: 43.5%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 205px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  z-index: 960;
`;

const DockBtn = styled.button`
  background: ${({ $IsEmissionBtn }) => bgPill($IsEmissionBtn)};
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #FAFAFA;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 400;
  width: 45px;
  height: 45px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > .energyIcon {
    bottom: 25px;
  }
  > .energylabel {
    bottom: 14px;
    font-size: 9px;
  }
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

  > div {
    margin: 1px;
  }
  ${textShadowIfOn}
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
  filter: ${({ $IsEmissionBtn }) => ($IsEmissionBtn ? SHADOW_FILTER : "none")};
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
  gap: 6px;
  z-index: 120;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 260ms ease-out;
  overflow: visible;
  --right-panel-bg: rgba(45, 45, 45, 0.15);
`;

const InfoGroup = styled.div`
  width: 184px;
  display: grid;
  grid-template-rows: 34px auto;
  row-gap: 0;
`;

/* 말풍선 패널 공통 */
const InfoPanelBase = styled.div`
  --tail: 8px;
  --panel-bd: transparent;

  overflow: hidden;
  max-height: ${({ open }) => (open ? "120px" : "0")};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transition: max-height 220ms ease, opacity 150ms ease;
  padding: ${({ open }) => (open ? "8px 8px 40px" : "0 8px 0")};
  margin-top: ${({ open }) => (open ? "6px" : "0")};

  background: ${panelBg};
  border: 1px solid rgba(255, 255, 255, ${PANEL_BORDER_ALPHA});
  border-radius: 8px;
  color: #FAFAFA;
  line-height: 1.5;
  position: relative;
  z-index: 1000;
  box-shadow: ${PANEL_SHADOW};

  & p {
    margin: 0;
    font-weight: 400;
  }
  & p + p {
    margin-top: 4px;
  }
`;

const InfoManager = styled(InfoPanelBase)``;

const InfoWeather = styled(InfoPanelBase)`
  padding: ${({ open }) => (open ? "12px" : "0 12px")};
  display: block; /* 줄 간격을 행별로 제어하기 쉽게 block로 */

  /* ====== [튜닝 포인트] 행별 커스텀 변수 ====== */
  /* 아이콘 크기(공통) */
  --icon-size: 23px;
  /* 아이콘 ←→ 텍스트 간격(= padding-left) */
  --pad1: 28px;  /* 1행 */
  --pad2: 28px;  /* 2행 */
  --pad3: 28px;  /* 3행 */
  /* 아이콘 수직 미세 오프셋(+ 아래로 / - 위로) */
  --dy1: 3.5px;  /* 1행 */
  --dy2: 2px;    /* 2행 */
  --dy3: 2px;    /* 3행 */
  /* 아이콘 수평 미세 오프셋(+ 오른쪽 / - 왼쪽) */
  --ix1: 0px;    /* 1행 */
  --ix2: 0px;    /* 2행 */
  --ix3: 0px;    /* 3행 */
  /* 줄 간격(행과 행 사이) */
  --gap1: 6px;   /* 1행 아래 */
  --gap2: 6px;   /* 2행 아래 */
  /* 3행은 마지막이라 gap 없음 */

  & p {
    position: relative;
    display: flex;
    align-items: center;
    line-height: 1.8;
    font-variant-numeric: tabular-nums;
    margin: 0; /* 기본 여백 제거 */
  }
  & p:nth-child(1) { padding-left: var(--pad1); margin-bottom: var(--gap1); }
  & p:nth-child(2) { padding-left: var(--pad2); margin-bottom: var(--gap2); }
  & p:nth-child(3) { padding-left: var(--pad3); }

  & p::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: var(--icon-size);
    height: var(--icon-size);
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) invert(1);
  }
  /* 행별 개별 오프셋 적용 */
  & p:nth-child(1)::before { transform: translateY(calc(-65% + var(--dy1))); left: calc(0px + var(--ix1)); }
  & p:nth-child(2)::before { transform: translateY(calc(-45% + var(--dy2))); left: calc(0px + var(--ix2)); }
  & p:nth-child(3)::before { transform: translateY(calc(-50% + var(--dy3))); left: calc(0px + var(--ix3)); }

  &[data-wicon="sunny"] p:nth-child(1)::before {
    background-image: url("/Icon/sunny_icon.svg");
  }
  &[data-wicon="rainy"] p:nth-child(1)::before {
    background-image: url("/Icon/rainy_icon.svg");
  }
  &[data-wicon="snowy"] p:nth-child(1)::before {
    background-image: url("/Icon/snowy_icon.svg");
  }
  &[data-wicon="cloudy"] p:nth-child(1)::before {
    background-image: url("/Icon/cloudy_icon.svg");
  }

  & p:nth-child(2)::before {
    background-image: url("/Icon/humidity_icon.svg");
  }
  & p:nth-child(3)::before {
    background-image: url("/Icon/wind_icon.svg");
  }
`;

const InfoAlert = styled(InfoPanelBase)`
  max-height: ${({ open }) => (open ? "1000px" : "0")};
  --panel-pad-b: 8px;
  display: flex;
  flex-direction: column;
`;

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
  background: ${({ $IsEmissionBtn }) => bgPill($IsEmissionBtn)};
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FAFAFA;
  font-size: 16px;
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
  box-shadow: ${PANEL_SHADOW};
`;

const InfoIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
  filter: ${({ $white, $IsEmissionBtn }) => {
   const base = $white ? "brightness(0) invert(1)" : "none";
   return $IsEmissionBtn ? `${base} ${SHADOW_FILTER}` : base;
 }};
`;

const InfoLabel = styled.span`
  opacity: 0.95;
  text-overflow: ellipsis;
  line-height: 20px;
  ${textShadowIfOn}
`;

const InfoValue = styled.span`
  margin-left: 0;
  justify-self: start;
  text-align: left;
  font-weight: 800;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 20px;
  ${textShadowIfOn}
`;

/* 우측 하단 고정 액션 영역 */
const PanelActions = styled.div`
  position: absolute;
  right: 5px;
  bottom: 5px;
  display: flex;
  gap: 5px;
`;

/* 코멘트 스타일의 작은 필 버튼 */
const PanelBtn = styled.button`
  min-width: 46px;
  height: 20px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${({ $IsEmissionBtn }) =>
    $IsEmissionBtn ? "rgba(0,170,111,1)" : "rgba(45,45,45,0.50)"};
  border: 1px solid
    ${({ $IsEmissionBtn }) => ($IsEmissionBtn ? "rgba(0,170,111,1)" : "#2D2D2D")};
  color: #FAFAFA;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  cursor: pointer;
  ${textShadowIfOn}
`;

// ==== 공통 툴팁 오버레이 ====
// 파일 내 어디든 선언 가능하지만, 아래 차트 두 개보다 "위"에 두면 깔끔합니다.

const TipWrap = styled.div`
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  background: rgba(20,20,22,0.88);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 8px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
  color: #FAFAFA;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.25;
  white-space: nowrap;
  backdrop-filter: blur(6px);
`;

const TipArrow = styled.div`
  position: absolute;
  width: 10px; height: 10px;
  background: rgba(20,20,22,0.88);
  transform: rotate(45deg);
  border: 1px solid rgba(255,255,255,0.18);

  /* 좌/우 배치에 따라 테두리와 위치 조정 */
  ${({ $side }) =>
    $side === "left"
      ? `
        right: -5px; top: 50%; transform: translateY(-50%) rotate(45deg);
        border-left: none; border-top: none; /* ▷ 모양 */
      `
      : `
        left: -5px; top: 50%; transform: translateY(-50%) rotate(45deg);
        border-right: none; border-bottom: none; /* ◁ 모양 */
      `}
`;

function TooltipOverlay({ tip, containerRef }) {
  const selfRef = useRef(null);
  const [pos, setPos] = useState({ left: -99999, top: -99999, side: "right" });
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!tip?.show || !containerRef?.current || !selfRef.current) {
      setReady(false);
      return;
    }

    const cont = containerRef.current;
    const contRect = cont.getBoundingClientRect();
    const box = selfRef.current.getBoundingClientRect();

    const offsetX = 12; // 클릭 지점에서의 가로 오프셋
    const margin = 6;   // 경계 여유

    // tip.x, tip.y 는 ChartCanvas 로컬 좌표 (이미 getLocalXY로 계산됨)
    const clickX = tip.x;
    const clickY = tip.y;

    // 1) 기본은 "우측" 배치
    let left = clickX + offsetX;
    let top  = clickY - box.height / 2;
    let side = "right";

    // 2) 수직 경계 클램프
    if (top < margin) top = margin;
    if (top + box.height > contRect.height - margin) {
      top = contRect.height - margin - box.height;
    }

    // 3) 수평 경계 체크: 우측 공간 부족하면 좌측으로 플립
    if (left + box.width > contRect.width - margin) {
      left = clickX - offsetX - box.width;
      side = "left";
      if (left < margin) left = margin; // 극단적으로 좁을 때
    }

    // ✅ fixed 포지셔닝이므로 ‘컨테이너 오프셋’을 더해 뷰포트 좌표로 변환
    setPos({
      left: contRect.left + left,
      top:  contRect.top  + top,
      side,
    });
    setReady(true);
    
  }, [tip?.show, tip?.x, tip?.y, containerRef]);

  if (!tip?.show) return null;

  return (
    <TipWrap ref={selfRef} style={{ left: pos.left, top: pos.top, visibility: ready ? 'visible' : 'hidden' }}>
      {tip.title && (
        <div style={{ opacity: .9, fontWeight: 800, marginBottom: 3 }}>{tip.title}</div>
      )}
      {tip.lines?.map((l, i) => (
        <div key={i}>
          <span style={{ opacity: .9 }}>{l.label}</span>
          <span style={{ opacity: .6, margin: "0 6px" }}>:</span>
          <span style={{ fontWeight: 800 }}>
            {l.value}{tip.unit ? ` ${tip.unit}` : ""}
          </span>
        </div>
      ))}
      <TipArrow $side={pos.side} />
    </TipWrap>
  );
}




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
  weatherNow = null,
  todayComparisonRatio = {},
  monthComparisonRatio = {},
  AvgFee = 0,
  // ⬇️ 탄소배출 API에서 받아온 값(kgCO₂e) 주입
  carbon = {
    today: 0,              // 금일 배출량 총합(전력 기준이면 kWh→배출 전환 API 결과)
    yesterday: 0,          // 전일 배출량 총합
    thisYear: [],          // 금년 월별 배출량 [1~12]
    lastYear: [],          // 전년 월별 배출량 [1~12]
  },
}) {
  const [managerName] = useState("이**");
  const [alertCount, setAlertCount] = useState(0);

  const outerTemp = weatherNow?.nowTemperature ?? null;
  const outerHumidity = weatherNow?.humidity ?? null;
  const outerWind = weatherNow?.windSpeed ?? null;

  const handleModelButtonClick = (modelName) => {
    if (modelName === "top") return;
    // SceneContainer의 handleFloorButtonClick 호출 (OrbitControls 타겟 업데이트 포함)
    if (onFloorButtonClick?.current) {
      onFloorButtonClick.current(modelName);
    } else {
      // fallback: ref가 없는 경우 기본 동작
      setActive({ active: true, model: modelName });
    }
    setSelectedDevice(null);
  };

  const [activeModal, setActiveModal] = useState(null);
  const [IsEmissionBtn, setIsEmissionBtn] = useState(false);
  
  // 탄소배출 API 결과 보관
  const [emDaily, setEmDaily] = useState({ today: 0, yesterday: 0 }); // 금일/전일 합계(kgCO₂e)
  const [emYear, setEmYear]   = useState({
    thisYear: [],          // 금년 월별(1~12)
    lastYear: [],          // 전년 월별(1~12)
    thisYearProjected: []  // 금년 '예상'(YTD 평균 보간)
  });
  const [emLoading, setEmLoading] = useState(false);

  // 탄소배출 모드가 켜질 때만 API 호출
  useEffect(() => {
  if (!IsEmissionBtn) return;
  let abort = false;

  (async () => {
    try {
      setEmLoading(true);
      const nowKST = KSTnow();

      // ---------- A. 전일/금일 (각각 day(1)로 호출) ----------
      const today = new Date(nowKST);
      const yester = new Date(nowKST); yester.setDate(yester.getDate() - 1);

      const [sY, eY] = rangeDay(yester);
      const [sT, eT] = rangeDay(today);

      const [rowsY, rowsT] = await Promise.all([
        apiCarbon(sY, eY, 1),   // 어제 하루
        apiCarbon(sT, eT, 1),   // 오늘 하루
      ]);

      const daily = {
        yesterday: sumUsage(rowsY),
        today:     sumUsage(rowsT),
      };

      // ---------- B. 금년/전년 월별 (각각 12회 month(2) 호출) ----------
      const thisYear = nowKST.getFullYear();
      const lastYear = thisYear - 1;

      const monthsThis = await Promise.all(
        Array.from({length:12}, (_,i) => monthlyTotalByType2(thisYear, i+1))
      );
      const monthsLast = await Promise.all(
        Array.from({length:12}, (_,i) => monthlyTotalByType2(lastYear, i+1))
      );

      // 금년 '예상' 보간 (YTD 평균)
      const nowM = nowKST.getMonth(); // 0~11
      const done = monthsThis.slice(0, nowM+1).filter(n => n>0);
      const ytdAvg = done.length ? (done.reduce((a,b)=>a+b,0)/done.length) : 0;
      const projected = monthsThis.map((v,i) => (v>0 ? v : (i>nowM ? ytdAvg : 0)));

      if (!abort) {
        setEmDaily(daily);
        setEmYear({
          thisYear: monthsThis,
          lastYear: monthsLast,
          thisYearProjected: projected,
        });
      }
    } catch (e) {
      console.warn('[carbon] fetch error:', e);
    } finally {
      if (!abort) setEmLoading(false);
    }
  })();

  return () => { abort = true; };
}, [IsEmissionBtn]);



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

  // 전일/당일 라벨
  const now = KSTnow();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const dailyLabels = [md(y), md(now)];

  return (
    <>
      {/* 좌측 날개 */}
      <LeftWing $open={railOpen}>
        {/* 실시간 사용량 */}
        <WingCard $IsEmissionBtn={IsEmissionBtn}>
          <CardTitle $IsEmissionBtn={IsEmissionBtn}>
            {EmissionNaming("실시간 사용량")}
          </CardTitle>
          <StatList $IsEmissionBtn={IsEmissionBtn}>
            <StatRow $IsEmissionBtn={IsEmissionBtn}>
              <StatIcon 
                src="Icon/elect_icon.svg"
                alt="전력"
                onError={imgFallback("/Icon/elect_icon.svg")}
                $IsEmissionBtn={IsEmissionBtn}
              />
              <StatLabel $IsEmissionBtn={IsEmissionBtn}>전력</StatLabel>
              <StatValue $IsEmissionBtn={IsEmissionBtn}>
                <span>{todayUsage.elec}</span>
                <StatUnit>kWh</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow $IsEmissionBtn={IsEmissionBtn}>
              <StatIcon
                src="/Icon/gas_icon.svg"
                alt="가스"
                onError={imgFallback("/Icon/gas_icon.svg")}
                $IsEmissionBtn={IsEmissionBtn}
              />
              <StatLabel $IsEmissionBtn={IsEmissionBtn}>가스</StatLabel>
              <StatValue $IsEmissionBtn={IsEmissionBtn}>
                <span>{todayUsage.gas}</span>
                <StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow $IsEmissionBtn={IsEmissionBtn}>
              <StatIcon
                src="/Icon/water_icon.svg"
                alt="수도"
                onError={imgFallback("/Icon/water_icon.svg")}
                $IsEmissionBtn={IsEmissionBtn}
              />
              <StatLabel $IsEmissionBtn={IsEmissionBtn}>수도</StatLabel>
              <StatValue $IsEmissionBtn={IsEmissionBtn}>
                <span>{todayUsage.water}</span>
                <StatUnit>㎥</StatUnit>
              </StatValue>
            </StatRow>

            <StatRow $IsEmissionBtn={IsEmissionBtn} className="TotalEmission">
              <StatLabel $IsEmissionBtn={IsEmissionBtn}>총 배출량</StatLabel>
              <StatValue $IsEmissionBtn={IsEmissionBtn}>
                <span>{(emDaily.today).toLocaleString('ko-KR')}</span>
                <StatUnit>{EMISSION_UNIT}</StatUnit>
              </StatValue>
            </StatRow>
          </StatList>
        </WingCard>

        {/* 전일 대비 전력 사용량 (미니차트) */}
        {(() => {
          const todayElec = Number(todayUsage?.elec || 0);
          const yesterElec = Number(yesterdayUsage?.elec || 0);
          return (
            <ChartCard $IsEmissionBtn={IsEmissionBtn}>
              <CardTitle $IsEmissionBtn={IsEmissionBtn}>
                {EmissionNaming("전일 대비 전력 사용량")}
              </CardTitle>
              <DailyElecCompareMini
                today={IsEmissionBtn ? emDaily.today : todayElec}
                yesterday={IsEmissionBtn ? emDaily.yesterday : yesterElec}
                labels={dailyLabels}
                IsEmissionBtn={IsEmissionBtn}
              />
            </ChartCard>
          );
        })()}

        {/* 전년 대비 전력 사용량 → 당월/전월 비교 (미니차트) */}
        <ChartCard $IsEmissionBtn={IsEmissionBtn}>
          <CardTitle $IsEmissionBtn={IsEmissionBtn}>
            {EmissionNaming("전년 대비 전력 사용량")}
          </CardTitle>
          <YearCompareLineMini
              thisYear={IsEmissionBtn
                ? (emYear.thisYearProjected.length ? emYear.thisYearProjected : emYear.thisYear)
                : [120,140,180,150,200,220,240,210,260,300,280,310]}
              lastYear={IsEmissionBtn
                ? emYear.lastYear
                : [100,130,160,140,180,190,200,180,210,250,230,260]}
            IsEmissionBtn={IsEmissionBtn}
          />
        </ChartCard>

        {/* 하단 버튼들 */}
        <DockActions>
          <DockBtn onClick={() => setActiveModal("condition")} $IsEmissionBtn={IsEmissionBtn}>
            <DockIcon
              src="public/Icon/con_icon.svg"
              alt=""
              aria-hidden="true"
              onError={imgFallback("/Icon/analysis_icon.svg")}
              className="energyIcon"
              $IsEmissionBtn={IsEmissionBtn} />
            <DockLabel className="energylabel" $IsEmissionBtn={IsEmissionBtn}>
              <div>에너지</div>
              <div>현황</div>
            </DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("analysis")} $IsEmissionBtn={IsEmissionBtn}>
            <DockIcon
              src="public/Icon/analysis_icon.svg"
              alt=""
              aria-hidden="true"
              onError={imgFallback("/Icon/analysis_icon.svg")}
              $IsEmissionBtn={IsEmissionBtn} />
            <DockLabel $IsEmissionBtn={IsEmissionBtn}>통합분석</DockLabel>
          </DockBtn>
          <DockBtn onClick={() => setActiveModal("detail")} $IsEmissionBtn={IsEmissionBtn}>
            <DockIcon
              src="public/Icon/detail_icon.svg"
              alt=""
              aria-hidden="true"
              onError={imgFallback("/Icon/detail_icon.svg")}
              $IsEmissionBtn={IsEmissionBtn} />
          
            <DockLabel $IsEmissionBtn={IsEmissionBtn}>상세분석</DockLabel>
          </DockBtn>
          <DockBtn
            onClick={() => setIsEmissionBtn((prev) => !prev)}
            $IsEmissionBtn={IsEmissionBtn}
          >
            <DockIcon
              src="public/Icon/emission_icon.svg"
              alt=""
              aria-hidden="true"
              onError={imgFallback("/Icon/analysis_icon.svg")}
              $IsEmissionBtn={IsEmissionBtn} />
        
            <DockLabel $IsEmissionBtn={IsEmissionBtn}>탄소배출</DockLabel>
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
          todayComparisonRatio={todayComparisonRatio}
          monthComparisonRatio={monthComparisonRatio}
          AvgFee={AvgFee}
        >
          현황
        </Condition>
      )}
      {activeModal === "analysis" && 
        <Analysis 
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
          todayComparisonRatio={todayComparisonRatio}
          monthComparisonRatio={monthComparisonRatio} 
          AvgFee={AvgFee}
        >
          통합분석
        </Analysis>}
      {activeModal === "detail" && <Detail onClose={() => setActiveModal(null)} todayUsage={todayUsage}>상세분석</Detail>}

      {/* 우측 정보 스택 */}
      <RightInfo $open={railOpen}>
        {/* 1) 책임자 */}
        <InfoGroup>
          <InfoItem
            $IsEmissionBtn={IsEmissionBtn}
            onClick={() => setOpenManager((v) => !v)}
            aria-expanded={openManager}
          >
            <InfoIcon
              $white
              src="/Icon/manager_icon.svg"
              alt="책임자"
              onError={imgFallback("/icon/manager_icon.svg")}
            />
            <InfoLabel>책임자</InfoLabel>
            <InfoValue>{managerName}</InfoValue>
          </InfoItem>
          <InfoManager open={openManager} $IsEmissionBtn={IsEmissionBtn}>
            <PanelActions>
              <PanelBtn $IsEmissionBtn={IsEmissionBtn}>로그아웃</PanelBtn>
            </PanelActions>
          </InfoManager>
        </InfoGroup>

        {/* 2) 외부날씨 */}
        <InfoGroup>
          <InfoItem
            $IsEmissionBtn={IsEmissionBtn}
            onClick={() => setOpenWeather((v) => !v)}
            aria-expanded={openWeather}
          >
            <InfoIcon
              $white
              src="/Icon/temperature_icon.svg"
              alt="외부온도"
              onError={imgFallback("/icon/temperature_icon.svg")}
            />
            <InfoLabel>외부온도</InfoLabel>
            <InfoValue>
              {outerTemp == null ? "—" : `${Math.round(outerTemp)}°C`}
            </InfoValue>
          </InfoItem>
          <InfoWeather
            open={openWeather}
            $IsEmissionBtn={IsEmissionBtn}
            data-wicon={toIconKey(weatherNow?.weatherStatus)}
          >
            <p>외부 날씨: {toLabel(weatherNow?.weatherStatus)}</p>
            <p>외부 습도: {outerHumidity == null ? "—" : `${Math.round(outerHumidity)}%`}</p>
            <p>외부 풍속: {outerWind == null ? "—" : `${outerWind} m/s`}</p>
          </InfoWeather>
        </InfoGroup>

        {/* 3) 경고/알림 */}
        <InfoGroup>
          <InfoItem
            $IsEmissionBtn={IsEmissionBtn}
            onClick={() => setOpenAlert((v) => !v)}
            aria-expanded={openAlert}
          >
            <InfoIcon
              src="/Icon/warning_icon.svg"
              alt="경고/알림"
              onError={imgFallback("/icon/warning_icon.svg")}
            />
            <InfoLabel>경고/알림</InfoLabel>
            <InfoValue>{alertCount}</InfoValue>
          </InfoItem>
          <InfoAlert open={openAlert} $IsEmissionBtn={IsEmissionBtn}>
            <p>경고 알림 제목</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <p>경고 알림 내용</p>
            <PanelActions>
              <PanelBtn $IsEmissionBtn={IsEmissionBtn}>메모 보기</PanelBtn>
              <PanelBtn $IsEmissionBtn={IsEmissionBtn}>메모 쓰기</PanelBtn>
            </PanelActions>
          </InfoAlert>
        </InfoGroup>
      </RightInfo>

      <>
        {/* 헤더 */}
        <HeaderBox $IsEmissionBtn={IsEmissionBtn}>
          <HeaderIcon
            src="public/Icon/header_title_logo.svg"
            alt="토리 빌딩"
            onError={imgFallback("/Icon/header_title_logo.svg")}
            $IsEmissionBtn={IsEmissionBtn}
          />
          <HeaderText $IsEmissionBtn={IsEmissionBtn}>
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
            $IsEmissionBtn={IsEmissionBtn}
          >
            <FloorImg
              src="public/Icon/Home_logo.svg"
              alt="전체보기"
              width={24}
              onError={imgFallback("/Icon/Home_logo.svg")}
              $IsEmissionBtn={IsEmissionBtn}
            />
          </FloorButton>
          {MODELS.filter((model) => model !== "top").map((modelName) => (
            <FloorButton
              key={modelName}
              onClick={() => handleModelButtonClick(modelName)}
              className={active.model === modelName ? "active" : ""}
              $IsEmissionBtn={IsEmissionBtn}
            >
              {MODEL_TO_FLOOR[modelName] + 1}F
            </FloorButton>
          ))}
          <FloorButton
            className="ToggleBtn"
            onClick={() => setRailOpen((prev) => !prev)}
            $IsEmissionBtn={IsEmissionBtn}
          >
            <img
              src={railOpen ? "Icon/toggle_on.svg" : "Icon/toggle_off.svg"}
              alt={railOpen ? "패널 닫기" : "패널 열기"}
              onError={imgFallback(railOpen ? "/Icon/toggle_on.svg" : "/Icon/toggle_off.svg")}
            />
          </FloorButton>
        </FloorButtons>
      </>
    </>
  );
}

/* ---------------------------------------------------------------------
   [간단 유틸 + 미니 차트 2종]
--------------------------------------------------------------------- */

// KST now
const KSTnow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
const pad2 = (n) => String(n).padStart(2, "0");
const md = (d) => `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
// yyyy-MM-dd HH:mm:ss 포맷
const ymd_hms = (d) => {
  const yyyy = d.getFullYear();
  const MM   = pad2(d.getMonth() + 1);
  const dd   = pad2(d.getDate());
  const HH   = pad2(d.getHours());
  const mm   = pad2(d.getMinutes());
  const ss   = pad2(d.getSeconds());
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};
// 서버별로 공백/구분자 취향이 다름 → 3가지 포맷 제공
const ymd_hms_T  = (d) => ymd_hms(d).replace(' ', 'T'); // ISO풍: 2025-10-28T00:00:00
const ymd_hms_plus = (d) => ymd_hms(d).replace(' ', '+'); // 쿼리: 2025-10-28+00:00:00

const urlTime = (d, mode='enc') => {
  if (mode === 'plus')   return ymd_hms_plus(d);         // ‘+’ 선호 서버
  if (mode === 'isoT')   return ymd_hms_T(d);          // ‘T’ 선호 서버
  return encodeURIComponent(ymd_hms(d));               // 기본: 공백→%20
};

/* ---------------------------
   탄소배출 API 헬퍼 (slice 호출)
---------------------------- */

// 하루 범위
const rangeDay = (d) => {
  const s = new Date(d); s.setHours(0,0,0,0);
  const e = new Date(d); e.setHours(23,59,59,999);
  return [s,e];
};

// 월 범위 (y: 4자리 연도, m: 1~12)
const rangeMonth = (y, m) => {
  const s = new Date(y, m-1, 1, 0,0,0,0);
  const e = new Date(y, m,   0, 23,59,59,999); // 그 달의 마지막 날 23:59:59
  return [s,e];
};

// (필요 시) 연 범위
const rangeYear = (y) => {
  const s = new Date(y, 0, 1, 0,0,0,0);
  const e = new Date(y,11,31,23,59,59,999);
  return [s,e];
};

// 실제 호출 (문서 포맷 준수: 공백 포함 → encodeURIComponent)
async function apiCarbon(start, end, datetimeType) {
  const u = `/api/stats/carbon?start=${urlTime(start,'enc')}&end=${urlTime(end,'enc')}&datetimeType=${datetimeType}`;
  const res = await fetch(u, { headers: { Accept:'application/json' } });
  if (!res.ok) {
    console.warn('[carbon] HTTP', res.status, u);
    return [];
  }
  try {
    return await res.json();
  } catch {
    return [];
  }
}

// 공통: 응답에서 usage만 안전합산
const sumUsage = (rows) => unwrapRows(rows).reduce((acc, r) => acc + pickVal(r), 0);

// 월별 합계 (그 달 하루하루를 백엔드가 day(1)만 허용한다면 day루프가 필요하지만,
// 문서에 month(2)가 있다면 "한 달을 month(2) 한 번"으로 충분)
async function monthlyTotalByType2(y, m) {
  const [s,e] = rangeMonth(y,m);
  const rows = await apiCarbon(s, e, 2);
  return sumUsage(rows);
}



// --- 응답 스키마 방어 유틸(배치: urlTime 아래) ---
const unwrapRows = (json) => Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

const pickTs = (r) => r?.timestamp ?? r?.time ?? r?.date ?? r?.datetime ?? "";

const pickVal = (r) => {
  // 서버가 배출량을 usage/value/amount/total 등으로 줄 수 있음 → 숫자만 안전 추출
  const n = Number(r?.usage ?? r?.value ?? r?.amount ?? r?.total ?? 0);
  return Number.isFinite(n) ? n : 0;
};



/* 전일 대비 (프롭 기반 미니 바차트) */
/* 전일 대비 (프롭 기반 미니 바차트) — 클릭/호버 툴팁(안전 가드 버전) */
function DailyElecCompareMini({ today = 0, yesterday = 0, labels = ["어제", "오늘"], IsEmissionBtn }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  // 좌표 계산을 안전하게: wrapper ref → SVG → 이벤트 타겟 순으로 fallback
  const getLocalXY = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const svg = e.currentTarget?.ownerSVGElement;
    const rect =
      ref.current?.getBoundingClientRect?.() ??
      svg?.getBoundingClientRect?.() ??
      e.currentTarget?.getBoundingClientRect?.() ??
      { left: 0, top: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top - 6 };
  };

  const toggleTip = (e, label, value) => {
    const currentLabel = tip?.lines?.[0]?.label;
    // 같은 항목을 다시 클릭하면 닫기
    if (tip?.show && currentLabel === label) {
      setTip({ ...tip, show: false });
      return;
    }
    const { x, y } = getLocalXY(e);
    setTip({
      show: true,
      x, y,
      title: "전일 대비 전력 사용량",
      unit: IsEmissionBtn ? EMISSION_UNIT : "kWh",
      lines: [{ label, value: Number(value || 0).toLocaleString("ko-KR") }],
    });
  };





  const W = 100, H = 100;
  const PL = 10, PR = 10, PT = 18, PB = 18;
  const plotW = W - PL - PR, plotH = H - PT - PB;

  const maxV = Math.max(1, today, yesterday);
  const h = (v) => Math.max(3, (v / maxV) * plotH);

  const barW = 22, gap = 16, total = barW * 2 + gap;
  const gX = PL + (plotW - total) / 2;

  const aTop = H - PB - h(yesterday);
  const bTop = H - PB - h(today);

  const axis = "rgba(255,255,255,0.28)";

  const colA = "rgba(180,180,180,0.9)"; // 어제
  const colB = "#FAFAFA";                // 오늘
  const labelC = "rgba(255,255,255,0.98)";

  return (
    <ChartCanvas ref={ref} role="img" aria-label="전일 대비 전력 사용량(간단)">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onPointerDown={(e)=>{ 
          // 빈 영역 클릭 시 닫기 (핫존<rect>에서 stop하지 않았으므로 우선 간단히 조건부로)
          if (tip?.show) setTip({ ...tip, show:false });
        }}
      >
        {IsEmissionBtn && (
          <defs>
            <filter id="svgTextShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
            </filter>
          </defs>
        )}
        
        {/* 축 */}
        <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke={axis} strokeWidth="1.2" strokeLinecap="round" />
        <line x1={PL} y1={PT}   x2={PL}   y2={H-PB} stroke={axis} strokeWidth="1.2" strokeLinecap="round" />

        {/* 어제 */}
        <path
          d={`M${gX} ${aTop + h(yesterday)}
              L${gX} ${aTop + 3}
              Q${gX} ${aTop} ${gX + 3} ${aTop}
              L${gX + barW - 3} ${aTop}
              Q${gX + barW} ${aTop} ${gX + barW} ${aTop + 3}
              L${gX + barW} ${aTop + h(yesterday)} Z`}
          fill={colA}
          stroke="none"
        />

        {/* 오늘 */}
        <path
          d={`M${gX + barW + gap} ${bTop + h(today)}
              L${gX + barW + gap} ${bTop + 3}
              Q${gX + barW + gap} ${bTop} ${gX + barW + gap + 3} ${bTop}
              L${gX + 2*barW + gap - 3} ${bTop}
              Q${gX + 2*barW + gap} ${bTop} ${gX + 2*barW + gap} ${bTop + 3}
              L${gX + 2*barW + gap} ${bTop + h(today)} Z`}
          fill={colB}
          stroke="none"
        />

        {/* 투명 클릭/호버 핫존 */}
        <rect
          x={gX - barW*0.2} y={PT} width={barW*1.4} height={H-PT-PB}
          fill="transparent" role="button" tabIndex={0}
          onPointerDown={(e)=>{ e.preventDefault(); e.currentTarget.blur?.(); toggleTip(e, labels[0], yesterday); }}
          aria-label={`${labels[0]} 사용량 ${Number(yesterday||0).toLocaleString("ko-KR")} ${IsEmissionBtn ? "kgCO₂e":"kWh"} 보기`}
        />
        <rect
          x={gX + barW + gap - barW*0.2} y={PT} width={barW*1.4} height={H-PT-PB}
          fill="transparent" role="button" tabIndex={0}
          onPointerDown={(e)=>{ e.preventDefault(); e.currentTarget.blur?.(); toggleTip(e, labels[1], today); }}
          aria-label={`${labels[1]} 사용량 ${Number(today||0).toLocaleString("ko-KR")} ${IsEmissionBtn ? "kgCO₂e":"kWh"} 보기`}
        />

        {/* 라벨 */}
        <text x={gX + barW/2}             y={H-5} fontSize="10" fontWeight="800" fill={labelC} textAnchor="middle" filter={IsEmissionBtn ? "url(#svgTextShadow)" : undefined}>{labels[0]}</text>
        <text x={gX + barW + gap + barW/2} y={H-5} fontSize="10" fontWeight="800" fill={labelC} textAnchor="middle" filter={IsEmissionBtn ? "url(#svgTextShadow)" : undefined}>{labels[1]}</text>
      </svg>

      {/* 우측 상단 레전드 */}
      <LegendWrap aria-hidden="true">
        <LegendItem>
          <SwatchSquare $color={colA} />
          <span>전일</span>
        </LegendItem>
        <LegendItem>
          <SwatchSquare $color={colB} />
          <span>금일</span>
        </LegendItem>
      </LegendWrap>
      <TooltipOverlay tip={tip} containerRef={ref} />
    </ChartCanvas>
  );
}


function YearCompareLineMini({ thisYear = [], lastYear = [], IsEmissionBtn }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const getLocalXY = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const svg = e.currentTarget?.ownerSVGElement;
    const rect =
      ref.current?.getBoundingClientRect?.() ??
      svg?.getBoundingClientRect?.() ??
      e.currentTarget?.getBoundingClientRect?.() ??
      { left: 0, top: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const toggleTip = (e, label, value) => {
    const currentLabel = tip?.lines?.[0]?.label;
    if (tip?.show && currentLabel === label) {
      setTip({ ...tip, show: false });
      return;
    }
    const { x, y } = getLocalXY(e);
    setTip({
      show: true, x, y,
      title: "전년 대비 전력 사용량",
      unit: IsEmissionBtn ? EMISSION_UNIT : "kWh",
      lines: [{ label, value: fmtSmart(value) }],
    });
  };


  // ✅ 소수 자릿수 그대로 보여주는 포맷터 (최대 6자리 보호)
  const fracLen = (x) => {
    const s = String(x);
    const i = s.indexOf(".");
    return i >= 0 ? Math.min(6, s.length - i - 1) : 0;
  };
  const fmtSmart = (x) => {
    const v = Number(x);
    if (!Number.isFinite(v)) return "0";
    const f = fracLen(x);
    return new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: f,
      maximumFractionDigits: f,
    }).format(v);
  };


  const W = 100, H = 100;
  const PL = 2, PR = 5, PT = 22, PB = 18;
  const plotW = W - PL - PR, plotH = H - PT - PB;

  const thisY = thisYear.length ? thisYear : [50, 80, 60, 100, 70, 90, 80, 60, 40, 30, 20, 10];
  const lastY = lastYear.length ? lastYear : [40, 70, 50, 90, 60, 80, 70, 50, 30, 20, 10, 5];

  const maxVal = Math.max(1, ...thisY, ...lastY);
  const x = (i) => PL + (plotW * i) / 11;
  const Y_SHIFT = 10;
  const yBase = (v) => H - PB - (v / maxVal) * plotH;
  const y = (v) => Math.min(H - PB - 3, yBase(v) + Y_SHIFT);

  const quarterIdx = [2, 5, 8, 11];
  const toPathByIdx = (arr, idxs) =>
    idxs.map((i, j) => `${j === 0 ? 'M' : 'L'} ${x(i)} ${y(arr[i])}`).join(' ');

  const pathLast = toPathByIdx(lastY, quarterIdx);
  const pathThis = toPathByIdx(thisY, quarterIdx);

  const colAxis = "rgba(255,255,255,0.28)";
  const colLast = "rgba(255,255,255,0.28)";
  const colThis = "#FAFAFA";
  const labelC  = "rgba(255,255,255,0.98)";
  const labelY  = H - 5;

  const R_LAST = 3.2, R_THIS = 3.6, R_CUT = Math.max(R_LAST, R_THIS) + 1.2;
  const commonLineProps = {
    fill: "none",
    vectorEffect: "non-scaling-stroke",
    strokeLinejoin: "round",
    strokeLinecap: "round",
    shapeRendering: "geometricPrecision",
  };

  return (
    <ChartCanvas ref={ref} role="img" aria-label="연간 전력 사용량(전년/금년)">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={()=>{ if (tip?.show) setTip({ ...tip, show:false }); }}
      >
        {IsEmissionBtn && (
          <defs>
            <filter id="svgTextShadowY" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
            </filter>
          </defs>
        )}
        {/* 축 */}
        <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke={colAxis} strokeWidth="1.2" />
        <line x1={PL} y1={PT}   x2={PL}   y2={H-PB} stroke={colAxis} strokeWidth="1.2" />

        {/* 선-도트 겹침 제거 마스크 */}
        <defs>
          <mask id="cut-lines-under-dots">
            <rect x="0" y="0" width={W} height={H} fill="white" />
            {quarterIdx.map((i) => (
              <circle key={`m-last-${i}`} cx={x(i)} cy={y(lastY[i])} r={R_CUT} fill="black" />
            ))}
            {quarterIdx.map((i) => (
              <circle key={`m-this-${i}`} cx={x(i)} cy={y(thisY[i])} r={R_CUT} fill="black" />
            ))}
          </mask>
        </defs>

        {/* 라인 (마스크 적용) */}
        <g mask="url(#cut-lines-under-dots)">
          <path d={pathLast} stroke={colLast} strokeWidth="1.6" {...commonLineProps} />
          <path d={pathThis} stroke={colThis} strokeWidth="2.0" {...commonLineProps} />
        </g>

        {/* 전년도 도트 + 넉넉한 클릭 영역 */}
        {quarterIdx.map((i) => {
          const cx = x(i), cy = y(lastY[i]);
          const label = `${new Date().getFullYear()-1}년 ${i+1}월`;
          return (
            <g key={`last-${i}`}>
              <circle cx={cx} cy={cy} r={R_LAST} fill={colLast} />
              <circle
                cx={cx} cy={cy} r={R_THIS+4}
                fill="transparent" role="button" tabIndex={0}
                onPointerDown={(e)=>toggleTip(e, label, lastY[i])}
                aria-label={`${label} 사용량 ${Number(lastY[i]||0).toLocaleString("ko-KR")} ${IsEmissionBtn ? "kgCO₂e":"kWh"} 보기`}
              />
            </g>
          );
        })}

        {/* 금년도 도트 + 넉넉한 클릭 영역 */}
        {quarterIdx.map((i) => {
          const cx = x(i), cy = y(thisY[i]);
          const label = `${new Date().getFullYear()}년 ${i+1}월`;
          return (
            <g key={`this-${i}`}>
              <circle cx={cx} cy={cy} r={R_THIS} fill={colThis} />
              <circle
                cx={cx} cy={cy} r={R_THIS+4}
                fill="transparent" role="button" tabIndex={0}
                onPointerDown={(e)=>toggleTip(e, label, thisY[i])}
                aria-label={`${label} 사용량 ${Number(thisY[i]||0).toLocaleString("ko-KR")} ${IsEmissionBtn ? "kgCO₂e":"kWh"} 보기`}
              />
            </g>
          );
        })}

        {/* 라벨 */}
        {quarterIdx.map((i) => (
          <text key={`label-${i}`} filter={IsEmissionBtn ? "url(#svgTextShadowY)" : undefined} x={x(i)} y={labelY} fontSize="10" fontWeight="800" fill={labelC} textAnchor="middle">
            {i + 1}<tspan fontSize="7" dx="0.5">월</tspan>
          </text>
        ))}
      </svg>
      {/* 우측 상단 레전드 : 동그라미+선 */}
      <LegendWrap aria-hidden="true">
        <LegendItem>
          <LineDot line={colLast} dot={colLast} />
          <span>전년</span>
        </LegendItem>
        <LegendItem>
          <LineDot line={colThis} dot={colThis} />
          <span>금년</span>
        </LegendItem>
      </LegendWrap>
      <TooltipOverlay tip={tip} containerRef={ref} />
    </ChartCanvas>
  );
}










export default Wing;
