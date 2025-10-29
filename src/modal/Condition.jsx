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
// 차트 그리기
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
const AverageLocation = styled.div`
  width: 100%;
  height: calc(100% - 150px);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;

  > div:last-child {
    display: flex;
    width: 100%;
    height: 100%;
  }
`;
const AverageNational = styled.div`
  width: 100%;
  height: calc(100% - 96px);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;

  > div:last-child {
    display: flex;
    width: 100%;
    height: 100%;
  }
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
  AvgFee ={ national: 0, location: 0 },
}) {
const [ratio, setRatio] = useState(Math.trunc(((billInfo.electricThisMonth + billInfo.gasThisMonth + billInfo.waterThisMonth) / AvgFee.location) * 100 - 100) === Infinity ? 0 : Math.trunc(((billInfo.electricThisMonth + billInfo.gasThisMonth + billInfo.waterThisMonth) / AvgFee.location) * 100 - 100));

  console.log("Condition - buildingInfo:", buildingInfo);
  console.log("Condition - elecUsage:", elecUsage);
  console.log("Condition - monthElecUsage:", monthElecUsage);


  // 차트 데이터 / 옵션
  // const averageChartValue = 12;  // 표시할 값 (%)

  const averageChartdata = (labelName, OurValue, MyValue) => ({
    labels : [labelName, "우리 빌딩"],
    datasets: [
      {
        type: "bar",
        label: "우리 빌딩",
        data: [OurValue, MyValue],
        backgroundColor: ["#FAFAFA", "#756DE5"],
        order: 2,
      },
      {
        type: "line",
        label: labelName,
        data: [OurValue, MyValue],
        borderColor: "#FAFAFA",
        backgroundColor: "#FAFAFA",
        borderDash: [5, 5],
        tension: 0.3,
        order: 1,
      },
    ],
  });
  const AveragechartOptions = (labelName) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 10,        // 글자 크기
            weight: "bold",  // 글자 굵기
            family: "나눔고딕", // 글꼴
            
          },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              return {
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i], // 각 값 색상
                strokeStyle: data.datasets[0].backgroundColor[i],
                index: i,
                fontColor: "#FAFAFA",
              };
            });
        }
      }
      },
      title: {
        display: true,
        text: labelName,
        color: "#fafafa",
        font: {
          size: 18, // 글자 크기 (원하는 값으로 조절)
          weight: '400', // 글자 굵기 선택 사항
        },
        padding: {
          top: 10,    // 타이틀 위 여백
          bottom: 20, // 타이틀과 차트 사이 거리
        },
      },
      
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: "#fafafa" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      x: {
        ticks: { color: "#fafafa" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
    },
  });


  const MyBuildingCharge = (
    billInfo.electricThisMonth
    + billInfo.gasThisMonth
    + billInfo.waterThisMonth
    + billInfo.electricRealTime 
    + billInfo.gasRealTime 
    + billInfo.waterRealTime
  );

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
          ThisMonthBillInfo={billInfo.electricThisMonth + (billInfo.electricRealTime < 0 ? 0 : billInfo.electricRealTime)}
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
          ThisMonthBillInfo={billInfo.gasThisMonth + (billInfo.gasRealTime < 0 ? 0 : billInfo.gasRealTime)}
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
          ThisMonthBillInfo={billInfo.waterThisMonth + (billInfo.waterRealTime < 0 ? 0 : billInfo.waterRealTime)}
          LastMonthBillInfo={billInfo.waterLastMonth}
          // 🍪 전일/전월 동시간 대비
          todayComparisonRatio={todayComparisonRatio.water}
          monthComparisonRatio={monthComparisonRatio.water}
        />

        <AverageAndEnergy>
          <AverageCharge>
            <AverageChargeHeader>
              <img src="/Icon/building_icon.svg" alt="빌딩"></img>동 업종 평균
              대비 사용금액
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
                  <div>높음</div>
                  <div>낮음</div>
                </UpDownFont>
              </TodayRatio>
            </AverageChargeMainL>

            <AverageChargeMainR></AverageChargeMainR>
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
              <div>{AvgFee.national.toLocaleString()} 원</div>
              <div>{AvgFee.location.toLocaleString()} 원</div>
              <div>{MyBuildingCharge.toLocaleString()} 원</div>
            </AverageChargeFooterR>
          </AverageChargeFooter>
<Liner />
          <AverageLocation>
            <div>
            <Chart
              data={averageChartdata("우리지역 평균", AvgFee.location, MyBuildingCharge)} 
              options={AveragechartOptions("우리지역(대전) 월 평균 비교")}
            />
            </div>
          </AverageLocation>
          <Liner />
          <AverageNational>
            <div>
            <Chart
              data={averageChartdata("전국 평균", AvgFee.national, MyBuildingCharge)} 
              options={AveragechartOptions("전국 월 평균 비교")}
            />
            </div>
          </AverageNational>
        </AverageAndEnergy>
      </EnergyMain>
    </Overlay>
  );
}

export default Condition;
