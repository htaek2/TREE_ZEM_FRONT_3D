import styled from "styled-components";
import Energy from "./ModalComponents/Energy";
import {
  Overlay,
  ModalHeader,
  AverageAndEnergy,
  AverageChargeMain,
  AverageChargeMainL,
  AverageChargeMainR,
  TodayTitle,
  TodayValue,
  TodayRatio,
  UpDownIcon,
  UpDownFont,
  AverageChargeFooter,
  AverageChargeFooterL,
  AverageChargeFooterR,
  Liner,
} from "./ModalComponents/EnergyStyle.jsx";
import { useState } from "react";

/* ⭐ 전체 타이틀 ⭐ */
const TotalTitle = styled.div`
  display: flex;
  font: bold 24px "나눔고딕";
  color: #fafafa;
  padding: 8px;
`;

/* ⭐ 메인 컨테이너 ⭐ */
const EnergyMain = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100vw;
  height: 100%;
  gap: 8px;
  padding: 0px 8px 8px 8px;
  //   flex-wrap: wrap;
`;

const AverageCharge = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 0 8px 0;
`;

/* ⭐ 컨테이너 헤더 ⭐ */
const AverageChargeHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 2px solid rgba(166, 166, 166, 0.2);
  width: 100%;
  height: 26px;
  color: #fafafa;
  font: 700 15px "나눔고딕";
  gap: 8px;
  padding: 8px;

  > img {
    width: 26px;
    height: 26px;
  }
`;

/* ⭐ 표 ⭐ */
const AverageCountry = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;
const AverageLocation = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

/* ---  2025-10-18 🍪 백민기 추가 props => elecUsage, waterUsage, gasUsage ---- */
function Condition({
  onClose,
  elecUsage,
  waterUsage,
  gasUsage,
  yesterdayUsage,
  monthElecUsage,
  monthWaterUsage,
  monthGasUsage,
  lastMonthUsage,
  buildingInfo,
  // 🍪 -백 10-20
  billInfo,
  todayComparisonRatio = { gas: 0, elec: 0, water: 0 },
  monthComparisonRatio = { gas: 0, elec: 0, water: 0 },
}) {
  const [ratio, setRatio] = useState(105);

  console.log("Condition - buildingInfo:", buildingInfo);
  console.log("Condition - elecUsage:", elecUsage);
  console.log("Condition - monthElecUsage:", monthElecUsage);

  return (
    <Overlay>
      <ModalHeader>
        <div>
          <img src="/Icon/ZEM_logo.svg" alt="로고" />
          ZEM
        </div>
        <div>
          <img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} />
        </div>
      </ModalHeader>

      <TotalTitle>에너지 현황</TotalTitle>
      <EnergyMain>
        {/* ---  2025-10-18 🍪 백민기 추가 props => toDayElecUsage, toDayWaterUsage, toDayGasUsage ---- */}
        <Energy
          type="elect"
          title="전력"
          icon="elect_icon.svg"
          toDayElecUsage={elecUsage}
          yesterdayUsage={yesterdayUsage.elec}
          yesterdayMaxUsage={yesterdayUsage.maxElec}
          toMonthElecUsage={monthElecUsage}
          lastMonthUsage={lastMonthUsage.elec}
          lastMonthMaxUsage={lastMonthUsage.maxElec}
          usagePerArea={
            buildingInfo?.totalArea
              ? (elecUsage / buildingInfo.totalArea).toFixed(4)
              : 0
          }
          monthUsagePerArea={
            buildingInfo?.totalArea
              ? (monthElecUsage / buildingInfo.totalArea).toFixed(4)
              : 0
          }
          // 🍪 -백 10-20
          ThisMonthBillInfo={billInfo.electricThisMonth}
          LastMonthBillInfo={billInfo.electricLastMonth}
          // 🍪 전일/전월 동시간 대비
          todayComparisonRatio={todayComparisonRatio.elec}
          monthComparisonRatio={monthComparisonRatio.elec}
        />
        <Energy
          type="gas"
          title="가스"
          icon="gas_icon.svg"
          toDayGasUsage={gasUsage}
          yesterdayUsage={yesterdayUsage.gas}
          yesterdayMaxUsage={yesterdayUsage.maxGas}
          toMonthGasUsage={monthGasUsage}
          lastMonthUsage={lastMonthUsage.gas}
          lastMonthMaxUsage={lastMonthUsage.maxGas}
          usagePerArea={
            buildingInfo?.totalArea
              ? (gasUsage / buildingInfo.totalArea).toFixed(4)
              : 0
          }
          monthUsagePerArea={
            buildingInfo?.totalArea
              ? (monthGasUsage / buildingInfo.totalArea).toFixed(4)
              : 0
          }
          // 🍪 -백 10-20
          ThisMonthBillInfo={billInfo.gasThisMonth}
          LastMonthBillInfo={billInfo.gasLastMonth}
          // 🍪 전일/전월 동시간 대비
          todayComparisonRatio={todayComparisonRatio.gas}
          monthComparisonRatio={monthComparisonRatio.gas}
        />
        <Energy
          type="water"
          title="수도"
          icon="water_icon.svg"
          toDayWaterUsage={waterUsage}
          yesterdayUsage={yesterdayUsage.water}
          yesterdayMaxUsage={yesterdayUsage.maxWater}
          toMonthWaterUsage={monthWaterUsage}
          lastMonthUsage={lastMonthUsage.water}
          lastMonthMaxUsage={lastMonthUsage.maxWater}
          usagePerArea={
            buildingInfo?.totalArea
              ? (waterUsage / buildingInfo.totalArea).toFixed(6)
              : 0
          }
          monthUsagePerArea={
            buildingInfo?.totalArea
              ? (monthWaterUsage / buildingInfo.totalArea).toFixed(6)
              : 0
          }
          // 🍪 -백 10-20
          ThisMonthBillInfo={billInfo.waterThisMonth}
          LastMonthBillInfo={billInfo.waterLastMonth}
          // 🍪 전일/전월 동시간 대비
          todayComparisonRatio={todayComparisonRatio.water}
          monthComparisonRatio={monthComparisonRatio.water}
        />

        <AverageAndEnergy>
          <AverageCharge>
            <AverageChargeHeader>
              <img src="/Icon/building_icon.svg" alt="빌딩"></img>동 업종 월평균
              대비 사용량
            </AverageChargeHeader>
          </AverageCharge>

          <AverageChargeMain>
            <AverageChargeMainL>
              <TodayTitle>월 평균 대비 요금</TodayTitle>
              <TodayValue type="ave">{ratio} %</TodayValue>
              <TodayRatio ratio={ratio}>
                <UpDownIcon ratio={ratio}>
                  <img className="up" src="/Icon/up_icon.svg" alt="오름세" />
                  <img
                    className="down"
                    src="/Icon/down_icon.svg"
                    alt="내림세"
                  />
                </UpDownIcon>
                <UpDownFont ratio={ratio}>
                  <div>증가</div>
                  <div>감소</div>
                </UpDownFont>
              </TodayRatio>
            </AverageChargeMainL>

            <AverageChargeMainR>표</AverageChargeMainR>
          </AverageChargeMain>

          <AverageChargeFooter>
            <AverageChargeFooterL>
              <div>
                <img src="/Icon/condition_circle.svg" alt="⚪" /> 전국 평균 요금
              </div>
              <div>
                <img src="/Icon/condition_circle.svg" alt="⚪" /> 우리지역 평균
                요금
              </div>
              <div>
                <img src="/Icon/condition_circle.svg" alt="⚪" /> 우리 빌딩 요금
              </div>
            </AverageChargeFooterL>
            <AverageChargeFooterR>
              <div>325,000 원</div>
              <div>250,000 원</div>
              <div>{billInfo.electricThisMonth + billInfo.gasThisMonth + billInfo.waterThisMonth} 원</div>
            </AverageChargeFooterR>
          </AverageChargeFooter>
          <Liner />
          <AverageCountry>
            <div>전국 일평균 대비</div>
            <div className="average_chart">표</div>
          </AverageCountry>
          <Liner />
          <AverageLocation>
            <div>우리지역(대전) 일평균 대비</div>
            <div className="average_chart">표</div>
          </AverageLocation>
        </AverageAndEnergy>
      </EnergyMain>
    </Overlay>
  );
}

export default Condition;
