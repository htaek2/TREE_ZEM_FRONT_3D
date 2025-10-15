import styled from "styled-components";
import { Suspense, useEffect, useState } from "react";

// ⬅️ 좌측 상단 로고 + 텍스트
const Brand = styled.div`
  position: absolute;
  top: 12px;
  left: 20px;
  display: flex;
  align-items: center;     /* 세로 중앙 정렬 */
  gap: 8px;                /* 로고↔글자 간격 */
  z-index: 130;            /* 시계/버튼보다 위 */
  color: #fff;             /* 텍스트 색 */
`;

const BrandLogo = styled.img`
  height: 20px;          /* 텍스트 20px와 높이 1:1 */
  width: auto;
  display: block;        /* 베이스라인 영향 제거 */
  flex-shrink: 0;        /* 줄바꿈/축소 방지 */
`;

const BrandText = styled.span`
  font-family: "Nanum Gothic", system-ui, sans-serif;
  font-weight: 800;        /* 800 두께 */
  font-size: 20px;         /* 20px */
  display: inline-block;   /* 라인박스 적용 안정화 */
  position: relative;      /* 미세 보정용 */
  top: -1.5px;              /* 0 ~ 1px 사이에서 취향대로 미세 조정 */
`;

// ⏰ 우측 상단 시계 박스
const ClockBox = styled.div`
  position: absolute;
  top: 12px;
  right: 20px;
  padding: 0;                       /* 배경 없으니 여백 최소화 */
  background: transparent;          /* ✅ 배경 제거 */
  border: 0;                        /* ✅ 테두리 제거 */
  color: #fff;                      /* ✅ FloorButton과 동일한 흰색 */
  font-weight: 600;
  font-size: 14px;
  letter-spacing: .2px;
  font-variant-numeric: tabular-nums; /* 숫자 폭 고정 */
  z-index: 120;
  -webkit-font-smoothing: antialiased;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    font-size: 12px;
    padding: 0;
  }
`;


    const WEEKDAY_KO = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    function formatKoDateTime(d) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const wk = WEEKDAY_KO[d.getDay()];
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}년${m}월${day}일 ${wk} ${hh}:${mm}분`;
    }


function BrandClock() {

    // ⏰ 시계 문자열 상태
    const [clock, setClock] = useState(() => formatKoDateTime(new Date()));

    useEffect(() => {
    let intervalId;
    const update = () => setClock(formatKoDateTime(new Date()));

    // 다음 '정각(분)'에 맞춰 1분 간격으로 갱신
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    const timeoutId = setTimeout(() => {
        update();
        intervalId = setInterval(update, 60 * 1000);
    }, msUntilNextMinute);

    // 초기 표시 보장
    update();

    return () => {
        clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
    };
    }, []);




    return (
    <>
        {/* 좌측 상단 ZEM 브랜드 */}
        <Brand>
        <BrandLogo
            src="/icon/ZEM_logo.svg"
            alt="ZEM 로고"
            onError={(e) => {
            // 대소문자 폴더 혼용 대비 폴백
            const img = e.currentTarget;
            if (!img.dataset.upperTried) {
                img.dataset.upperTried = "1";
                img.src = "/Icon/ZEM_logo.svg";
            }
            }}
        />
        <BrandText>ZEM</BrandText>
        </Brand>

        <ClockBox>{clock}</ClockBox>
    </>
    );
}

export default BrandClock;