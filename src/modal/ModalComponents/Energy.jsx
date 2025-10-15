import styled from "styled-components";
import {
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
  Liner
} from "./EnergyStyle.jsx";
import { useState } from "react";

const Energy1Usage = styled.div `
  width: 100%;
`;
const Energy30Usage = styled(Energy1Usage) ``;
const EnergyCharge = styled(Energy1Usage) ``;

const Energy1UsageHeader = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 0 8px 0;
`;
const EnergyTitle = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 2px solid rgba(166, 166, 166, 0.2);
  width: 100%;
  height: 26px;
  color: #FAFAFA;
  font: 700 22px "나눔고딕";
  padding: 8px;
  gap: 8px;

  > img {
    width: 26px;
    height: 26px;
  }
`;
const Energy1UsageMain = styled(AverageChargeMain) ``;
const Energy30UsageMain = styled(AverageChargeMain) ``;

const Energy1UsageMainL = styled(AverageChargeMainL) ``;
const Energy1UsageMainR = styled(AverageChargeMainR) ``;

const Energy30UsageMainL = styled(AverageChargeMainL) ``;
const Energy30UsageMainR = styled(AverageChargeMainR) ``;


const ChargeTitle = styled(TodayTitle) ``;
const ChargeChart = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MonthTitle = styled(TodayTitle) ``;
const MonthValue = styled(TodayValue) ``;
const MonthRatio = styled(TodayRatio) ``;


const Energy1UsageFooter = styled(AverageChargeFooter) ``;
const Energy30UsageFooter = styled(AverageChargeFooter) ``;

const Energy1UsageFooterL = styled(AverageChargeFooterL) ``;
const Energy1UsageFooterR = styled(AverageChargeFooterR) ``;

const Energy30UsageFooterL = styled(AverageChargeFooterL) ``;
const Energy30UsageFooterR = styled(AverageChargeFooterR) ``;


const EnergyChargeFooter = styled(AverageChargeFooter) ``;
const EnergyChargeFooterL = styled(AverageChargeFooterL) ``;
const EnergyChargeFooterR = styled(AverageChargeFooterR) ``;



function Energy({ type = "elect", title = "전력", icon = "elect_icon.svg" }) {
  const [usage, setUsage] = useState({ elect : [1.1111, 11.1111], gas : [2.2222, 22.2222], water : [3.3333, 33.3333] });
  const [ratio, setRatio] = useState({ elect : [10, 20], gas : [22, -100], water : [-333, -20] });
  
  const explainFilter = type === "elect" ? "최고 사용량" : "시간당 최고 사용량";
  const unitFilter = type === "elect" ? "kWh" : "㎥";

  const icons = {
    detail: "/Icon/energe_detail_whorf.svg",
    up: "/Icon/up_icon.svg",
    down: "/Icon/down_icon.svg",
    circle: "/Icon/condition_circle.svg"
  };

  return (
    <AverageAndEnergy>

      {/* 금일 사용량 */}
      <Energy1Usage>
        <Energy1UsageHeader>
          
            <EnergyTitle>
              <img src={`/Icon/${icon}`} alt={title} />
              {title}
            </EnergyTitle>

        </Energy1UsageHeader>

        <Energy1UsageMain>
          <Energy1UsageMainL>
            <TodayTitle>금일 사용량</TodayTitle>
            <TodayValue type={type}>{type === "elect" ? usage.elect[0] : type === "gas" ? usage.gas[0] : usage.water[0]} {unitFilter}</TodayValue>
            <TodayRatio ratio={type === "elect" ? ratio.elect[0] : type === "gas" ? ratio.gas[0] : ratio.water[0]}>
              <UpDownIcon ratio={type === "elect" ? ratio.elect[0] : type === "gas" ? ratio.gas[0] : ratio.water[0]}>
                <img className="up" src={icons.up} alt="오름세" />
                <img className="down" src={icons.down} alt="내림세" />
              </UpDownIcon>
                <div>전일 동시간 대비</div>
                <div className="ratio">{type === "elect" ? ratio.elect[0] : type === "gas" ? ratio.gas[0] : ratio.water[0]}%</div>
              <UpDownFont ratio={type === "elect" ? ratio.elect[0] : type === "gas" ? ratio.gas[0] : ratio.water[0]}>
                <div>증가</div>
                <div>감소</div>
              </UpDownFont>
            </TodayRatio>
          </Energy1UsageMainL>
          <Energy1UsageMainR>표</Energy1UsageMainR>
        </Energy1UsageMain>

        <Energy1UsageFooter>
          <Energy1UsageFooterL>
            <div>
              <img src={icons.circle} alt="⚪" /> 전일 사용량
            </div>
            <div>
              <img src={icons.circle} alt="⚪" /> 1㎥ 당 사용량
            </div>
            <div>
              <img src={icons.circle} alt="⚪" /> {explainFilter}
            </div>
          </Energy1UsageFooterL>
          <Energy1UsageFooterR>
            <div>0,000.0 {unitFilter}</div>
            <div>0,000.0 {unitFilter}</div>
            <div>0,000.0 {unitFilter}</div>
          </Energy1UsageFooterR>
        </Energy1UsageFooter>
      </Energy1Usage>

      <Liner />

      {/* 금월 사용량 */}
      <Energy30Usage>
        <Energy30UsageMain>
          <Energy30UsageMainL>
            <MonthTitle>금월 사용량</MonthTitle>
            <MonthValue type={type}>{type === "elect" ? usage.elect[1] : type === "gas" ? usage.gas[1] : usage.water[1]} {unitFilter}</MonthValue>
            <MonthRatio ratio={type === "elect" ? ratio.elect[1] : type === "gas" ? ratio.gas[1] : ratio.water[1]}>
              <UpDownIcon ratio={type === "elect" ? ratio.elect[1] : type === "gas" ? ratio.gas[1] : ratio.water[1]}>
                <img className="up" src={icons.up} alt="오름세" />
                <img className="down" src={icons.down} alt="내림세" />
              </UpDownIcon>
              <div>전월 동시간 대비</div>
              <div className="ratio">{type === "elect" ? ratio.elect[1] : type === "gas" ? ratio.gas[1] : ratio.water[1]}%</div>
              <UpDownFont ratio={type === "elect" ? ratio.elect[1] : type === "gas" ? ratio.gas[1] : ratio.water[1]}>
                <div>증가</div>
                <div>감소</div>
              </UpDownFont>
            </MonthRatio>
          </Energy30UsageMainL>
          <Energy30UsageMainR>표</Energy30UsageMainR>
        </Energy30UsageMain>

        <Energy30UsageFooter>
          <Energy30UsageFooterL>
            <div>
              <img src={icons.circle} alt="⚪" /> 전월 사용량
            </div>
            <div>
              <img src={icons.circle} alt="⚪" /> 1㎥ 당 사용량
            </div>
            <div>
              <img src={icons.circle} alt="⚪" /> {explainFilter}
            </div>
          </Energy30UsageFooterL>
          <Energy30UsageFooterR>
            <div>0,000.0 {unitFilter}</div>
            <div>0,000.0 {unitFilter}</div>
            <div>0,000.0 {unitFilter}</div>
          </Energy30UsageFooterR>
        </Energy30UsageFooter>
      </Energy30Usage>

      <Liner />

      {/* 전월 대비 요금 */}
      <EnergyCharge>
        <div>
          <ChargeTitle>전월 대비 실시간 요금</ChargeTitle>
          <ChargeChart>
            <div>표</div>
          </ChargeChart>
        </div>

        <EnergyChargeFooter>
          <EnergyChargeFooterL>
            <div>
              <img src={icons.circle} alt="⚪" /> 전월 사용량
            </div>
            <div>
              <img src={icons.circle} alt="⚪" /> 1㎥ 당 사용량
            </div>
          </EnergyChargeFooterL>
          <EnergyChargeFooterR>
            <div>0,000 원</div>
            <div>0,000 원</div>
          </EnergyChargeFooterR>
        </EnergyChargeFooter>
      </EnergyCharge>
    </AverageAndEnergy>
  );
}

export default Energy;
