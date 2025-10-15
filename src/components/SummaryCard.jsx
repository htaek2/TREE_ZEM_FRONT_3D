import styled from "styled-components";

import StatIndicator from "./StatIndicator";



/* ===== monthly-usage-summary-item ===== */
const MonthlyUsageSummaryItemSection = styled.section`
  width: calc((100% - 18px) / 2);
  height: 200px;
  padding: 18px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: #09131a;
  border: 1px solid #1d282f;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  h3 {
    font-size: 32px;
    font-weight: 800;
    color: #00aa6f;
  }
`;

/* ===== monthly-usage-graph ===== */
const MonthlyUsageGraph = styled.div`
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 18px auto;
`;




function SummaryCard({title = "월"}) {
    return (
            <MonthlyUsageSummaryItemSection>
                <h2>{title} 예상 비용</h2>
                <h3>0,000,000 원</h3>
                {title === "월" ?  <StatIndicator type="up" value="00" status="증가" /> : <StatIndicator type="down" value="00" status="감소" />}
                <MonthlyUsageGraph></MonthlyUsageGraph>
            </MonthlyUsageSummaryItemSection>
    )
}
export default SummaryCard;






