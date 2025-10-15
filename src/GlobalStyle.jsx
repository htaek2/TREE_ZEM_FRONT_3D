import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    /* ⬅️ 왼쪽부터 토글 → 버튼열 → 패널 순서로 배치할 기준 */
    :root {
        --edge-left: 20px;     /* 화면 왼쪽 여백 */
        --toggle-width: 14px;  /* 토글 폭 */
        --toggle-gap: 8px;     /* 토글 ↔ 버튼열 간격 */
        --rail-width: 56px;    /* 버튼열(홈~4F) 고정 폭 */
        --panel-gap: 12px;     /* 버튼열 ↔ 데이터박스 간격 */
        --wing-width: 230px;   /* 데이터박스(LeftWing) 폭 */
        --wing-left: 40px; /* ← 여기 숫자 키우면 전부 오른쪽으로 이동 */

        /* 좌측 큰 카드(3개) 고정 사이즈 */
        --wing-card-w: 200px;
        --wing-card-h: 208px;
        --dock-w: 60px;   /* 하단 박스 가로 */
        --dock-h: 40px;   /* 하단 박스 세로 */
        --dock-label-bottom: 5px; /* 라벨을 박스 하단에서 5px 띄우기 */
        --dock-label-h: 10px;     /* 라벨 높이(= 글자 크기 10px과 동일하게) */
        --dock-gap: 3px;          /* 아이콘 ↔ 라벨 간격 */
    }
`;

export default GlobalStyle;