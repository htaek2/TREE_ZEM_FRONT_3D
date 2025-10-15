import styled from "styled-components";

// 🔀 층 버튼 패널 토글 탭(항상 보이는 작은 버튼)
const RailToggle = styled.button`
  position: absolute;
  left: var(--edge-left);
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 48px;
  border-radius: 8px;

  border: 2px solid transparent;
  background-color: rgba(45, 45, 45, 0.85);
  color: #fff; /* 버튼 텍스트와 동일 (화살표는 currentColor를 상속) */
 
  /* 아이콘 완전 중앙 정렬 & 여백 0으로 고정 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 0;

  cursor: pointer;
  z-index: 1100; /* 패널/층버튼보다 위에서 항상 클릭 가능 *
  transition: filter .2s ease;
  &:hover { filter: brightness(1.1); }
  svg {
    width: 12px;
    height: 12px;
    display: block;              /* 베이스라인 영향 제거 */
    transform-origin: 50% 50%;   /* 회전 중심을 정확히 가운데 */
    transition: transform .22s ease;
  }

  /* ⬇️ 모바일(<=768px)에서는 FloorButtons left를 32px로 밀 예정이므로 토글은 10px로 맞춰서 버튼과의 간격(8px)을 유지 */
  @media (max-width: 768px) {
    left: var(--edge-left);
  }
`;
function HiddenToggle({ railOpen, setRailOpen }) {
{/* 좌측 패널 토글 탭(항상 보임) */}
    return (
        
    <RailToggle
        aria-label={railOpen ? "층 버튼 패널 접기" : "층 버튼 패널 펼치기"}
        aria-expanded={railOpen}
        onClick={() => setRailOpen(o => !o)}
        type="button"
        title={railOpen ? "접기" : "펼치기"}
        >
        <svg viewBox="0 0 12 12" aria-hidden="true"
                style={{ transform: railOpen ? "rotate(0deg)" : "rotate(180deg)" }}>
            <path d="M8 1 L4 6 L8 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </RailToggle>
    );
}

export default HiddenToggle;