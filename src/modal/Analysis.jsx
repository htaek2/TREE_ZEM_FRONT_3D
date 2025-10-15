import styled from "styled-components";
import {
  Overlay,
  ModalHeader
} from "./ModalComponents/EnergyStyle.jsx";

import SummaryCard from "../components/SummaryCard.jsx";
import BenchMarkItem from "../components/BenchMarkItem.jsx";
import AlertBanner from "../components/AlertBanner.jsx";


/* ===== Title ===== */
const Titlediv = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 18px;
`;

/* ===== analysis_Main ===== */
const AnalysisMain = styled.main`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 1888px;
  height: 736px;
  gap: 18px;

  & > div:first-child,
  & > div:nth-child(2) {
    width: 50%;
    border-radius: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  & > div:nth-child(2) {
    padding: 18px;
    background-color: #09131a;
    border: 1px solid #1d282f;
    height: 100%;
  }
`;

/* ===== analysis_Left / analysis_Right ===== */
const AnalysisLeft = styled.div``;

const AnalysisRight = styled.div`
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 18px;
  }
`;

/* ===== Monthly-usage-summary ===== */
const MonthlyUsageSummary = styled.div`
  width: 100%;
  display: flex;
  gap: 18px;

  section {
    height: 360px;
    font-size: 20px;
    font-weight: bold;
  }
`;





/* ===== ranking_distribution ===== */
const RankingDistributionSection = styled.section`
  width: 100%;
  height: 360px;
  background-color: #09131a;
  border: 1px solid #1d282f;
  border-radius: 8px;
  padding: 15px;

  > h2 {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  > h3 {
    font-size: clamp(24px, 1.7vw, 32px);
    color: #ffffff;
    margin-top: 35px;
    display: flex;
    justify-content: space-evenly;
    font-weight: 800;
  }
`;

/* ===== ranking_distribution_graph ===== */
const RankingDistributionGraph = styled.div`
  width: 100%;
  height: 160px;
  margin-top: 18px;
`;

/* ===== industry-comparison-container ===== */
const IndustryComparisonContainer = styled.div`
  width: 90%;
  height: 100%;
  margin: 0 auto;
  border-radius: 10px;
  display: flex;
`;

/* ===== industry-comparison-bar ===== */
const IndustryComparisonBar = styled.div`
  width: 35%;
  height: 100%;
`;

/* ===== industry-benchmark-list ===== */
const IndustryBenchmarkList = styled.div`
  width: 65%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: baseline;
`;





/* ===== colored spans ===== */
const IndustryCountspan = styled.span`
  color: #ef4444;
`;
const IndustryRatespan = styled.span`
  color: #ff9924;
`;
const IndustryMessagespan = styled.span`
  color: #ff9924;
`;


function Analysis({ onClose }) {
    return (
        <Overlay>
            <ModalHeader>
                <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
                <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
            </ModalHeader>

            <Titlediv>통합 분석</Titlediv>
            <AnalysisMain>
                <AnalysisLeft>
                    <MonthlyUsageSummary>
                        <SummaryCard title="월" />
                        <SummaryCard title="일" />
                    </MonthlyUsageSummary>
                    <RankingDistributionSection>
                        <h2>동 업종 대비 저비용 지출 분석</h2>
                        <RankingDistributionGraph>
                            <IndustryComparisonContainer>
                                <IndustryComparisonBar></IndustryComparisonBar>
                                <IndustryBenchmarkList>
                                    <BenchMarkItem topic="상위 5% 평균" value="100,000원" />
                                    <BenchMarkItem topic="전체 평균" value="200,000원" />
                                    <BenchMarkItem topic="우리 빌딩" value="300,000원" />                                
                                </IndustryBenchmarkList>
                            </IndustryComparisonContainer>
                        </RankingDistributionGraph>
                        <h3>동 업종 <IndustryCountspan>3325</IndustryCountspan>개 중 상위 <IndustryRatespan>58%</IndustryRatespan><IndustryMessagespan>평균 오차 범위에 속해요.</IndustryMessagespan></h3>
                    </RankingDistributionSection>
                </AnalysisLeft>

                <AnalysisRight>
                    <h2>에너지 절감 방안 제시</h2>
                    <AlertBanner topic="1" />
                    <AlertBanner topic="2" />
                    <AlertBanner topic="3" />
                </AnalysisRight>
            </AnalysisMain>
        </Overlay>
    );
}

export default Analysis;