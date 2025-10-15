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
  Liner
} from "./ModalComponents/EnergyStyle.jsx";
import { useState } from "react";



/* ⭐ 전체 타이틀 ⭐ */
const TotalTitle = styled.div`
  display: flex;
  font: bold 24px "나눔고딕";
  color: #FAFAFA;
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
  padding: 0px 8px 8px 8px
//   flex-wrap: wrap;
`;

const AverageCharge = styled.div `
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
    color: #FAFAFA;
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




function Condition({ onClose }) {

    const [ratio, setRatio] = useState( 105 );

    return (
    <Overlay>

    <ModalHeader>
        <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
        <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
    </ModalHeader>

    <TotalTitle>에너지 현황</TotalTitle>
    <EnergyMain>
        <Energy type="elect" title="전력" icon="elect_icon.svg"  />
        <Energy type="gas" title="가스" icon="gas_icon.svg" />
        <Energy type="water" title="수도" icon="water_icon.svg" />

        <AverageAndEnergy>
            <AverageCharge>
                <AverageChargeHeader>
                    <img src="/Icon/building_icon.svg" alt="빌딩"></img>
                    동 업종 일평균 대비 사용량
                </AverageChargeHeader>
            </AverageCharge>

            <AverageChargeMain>
                <AverageChargeMainL>
                    <TodayTitle>일평균 대비 요금</TodayTitle>
                    <TodayValue type="ave">{ratio} %</TodayValue>
                    <TodayRatio ratio={ratio}>
                        <UpDownIcon ratio={ratio}>
                            <img className="up" src= "/Icon/up_icon.svg" alt="오름세" />
                            <img className="down" src= "/Icon/down_icon.svg" alt="내림세" />
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
                    <div><img src="/Icon/condition_circle.svg" alt="⚪" /> 전국 평균 요금</div>
                    <div><img src="/Icon/condition_circle.svg" alt="⚪" /> 우리지역 평균 요금</div>
                    <div><img src="/Icon/condition_circle.svg" alt="⚪" /> 우리 빌딩 요금</div>
                </AverageChargeFooterL>
                <AverageChargeFooterR>
                    <div>325,000 원</div>
                    <div>250,000 원</div>
                    <div>296,250 원</div>
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
