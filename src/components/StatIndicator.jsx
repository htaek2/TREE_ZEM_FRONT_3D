import styled from "styled-components";

/* ===== styled components ===== */
const TodayRatio = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font: 700 14px "나눔고딕";
  color: #fafafa;
  gap: 4px;
`;

const MonthRatio = styled(TodayRatio)``;

const UpDownIcon = styled.div`
  display: flex;

  img {
    display: block;
  }
`;

const UpDownFont = styled.div`
  display: flex;

  div {
    display: flex;
  }
`;

/* ===== component ===== */
function StatIndicator({ type = "up", value = "00", status = "증가" }) {
  return (
    <TodayRatio>
      <UpDownIcon>
        <img
          src={`/Icon/${type}_icon.svg`}
          alt={status === "증가" ? "오름세" : "내림세"}
        />
      </UpDownIcon>
      <div>전일 동시간 대비</div>
      <div>{value}%</div>
      <UpDownFont>
        <div>{status}</div>
      </UpDownFont>
    </TodayRatio>
  );
}

export default StatIndicator;
