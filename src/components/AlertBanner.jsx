import styled from "styled-components";

/* ===== alert_banner (1,2,3) ===== */
const AlertBannerdiv = styled.div`
  border-radius: 10px;
  height: 85px;
  padding: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 20px;
    color: #ffffff;
    font-weight: 700;
  }

  span {
    font-size: 16px;
    color: #868686;
  }

  > div:nth-child(2) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.alert_banner1 {
    background: #0f2b29;
    border: 1px solid #106963;
  }

  &.alert_banner2 {
    background: #13243b;
    border: 1px solid #154691;
  }

  &.alert_banner3 {
    background: rgba(251, 44, 54, 0.3);
    border: 1px solid #fb2c36;
  }
`;

function AlertBanner({ topic = "" }) {
  const TitleMap = {
    1: "냉방 사용량 알림",
    2: "냉방기기 관련 피드백",
    3: "이상 패턴 알림",
  };

  const iconMap = {
    1: "used-alert.svg",
    2: "solution-alert.svg",
    3: "pattern_error-alert.svg",
  };

  return (
    <AlertBannerdiv topic={topic}>
      <div>
        <h3>{TitleMap[topic]}</h3>
        <span>맞춤 텍스트</span>
      </div>

      <div>{iconMap[topic] && <img src={iconMap[topic]} />}</div>
    </AlertBannerdiv>
  );
}

export default AlertBanner;
