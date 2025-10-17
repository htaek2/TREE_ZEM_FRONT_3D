import styled from "styled-components";
import {
  Overlay,
  ModalHeader,
  TodayRatio,
  UpDownIcon,
  UpDownFont,
} from "./ModalComponents/EnergyStyle.jsx";
import { useState } from "react";

const Titlediv = styled.div`
  display: flex;
  font: bold 24px "나눔고딕";
  color: #FAFAFA;
  padding: 8px;
`;
const Maindiv = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 672px;
  padding: 8px;
  gap: 8px;
`;
const AnalysisMain = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: calc(50% - 12px);
  height: 100%;
  gap: 8px;
`;


const AnalysisMainTop = styled.div`
  display: flex;
  width: 100%;
  height: calc(52% - 4px);
  gap: 8px;
`;
const AnalysisMainBottom = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(100% - 16px);
  height: calc(48% - 4px);
  padding: 8px;
`;

const MainTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(50% - 4px);
  height: calc(100% - 20px);
  padding: 8px;
  gap: 2px;

  > div:nth-child(1) {
    display: flex;
    font: bold 18px "나눔고딕";
  }
  > div:nth-child(2) {
    display: flex;
    font: bold 24px "나눔고딕";
    align-items: center;
    justify-content: flex-start;
  }
  > div:last-child {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 70%;
    border: 1px solid rgba(166, 166, 166, 0.2);
    margin-top: 8px;
  }
`;
const ExpectRatiodiv = styled(TodayRatio)`
  font: 700 12px "나눔고딕";
`;


const MainBottomTop = styled.div`
  display: flex;
  font: bold 22px "나눔고딕";
  height: 10%;
  width: 100%;
`;
const MainBottomMiddle = styled.div`
  display: flex;

  align-items: center;
  width: 100%;
  height: 75%;
  gap: 8px;
`;
const BottomMiddleLeft = styled.div`
  display: flex;
  width: calc(40% - 4px);
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(166, 166, 166, 0.2);
  width: 35%;
  height: calc(100% - 16px);
`;
const BottomMiddleRight = styled.div`
  display: flex;
  width: calc(60% - 4px);
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: rgba(255, 153, 36, 0.1);
  height: 65%;
`;


const BuildingAverageleft = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  gap: 24px;

  > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font: bold 20px "나눔고딕";
  }
`;
const BuildingAverageright = styled.div`
  display: flex;
  flex-direction: column;
  width: 60%;
  gap: 24px;

  > div {
  display: flex;
  justify-content: flex-end;
  align-items: center;    
  font: bold 20px "나눔고딕";
  }
`;

const BottomBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;    
  font: bold 20px "나눔고딕";
  height: 15%;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: rgba(255, 153, 36, 0.1);
  border-radius: 10px;
`;



const AnalysisPlan = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 10px;
  border: 1px solid rgba(166, 166, 166, 0.2);
  background: #2B2D30;
  color: #FAFAFA;
  width: calc(50% - 28px);
  height: calc(100% - 16px);
  gap: 8px;  
  padding: 8px;
`;
const PlanTop = styled.div`
  display: flex;
  font: bold 22px "나눔고딕";
  width: 100%;
  height: 5%;
`;
const PlanMain = styled.div`
  display: flex;
  width: 100%;
  height: calc(95% - 8px);
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;

  > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 10%;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;

  }

`;  

const MachineDiv = styled.div`
    background: ${({ title }) => 
    title === 'usage' ? 'rgba(37, 127, 255, 0.3)' :
    title === 'warning' ? 'rgba(251, 44, 54, 0.3)' :
    'rgba(35, 212, 147, 0.3)'};    

    > div:first-child {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: calc(90% - 24px);
      height: calc(100% - 16px);
      font: 400 14px "나눔고딕";
      color: #FAFAFA;
      padding: 0px 8px;

      > div:first-child {
        font: bold 18px "나눔고딕";
      }
    }
    > div:last-child {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 10%;
      height: 100%;

      > img {
        width: 38px;
      }
    }
`;


function Analysis({ onClose }) {
    const [ExpectRatio, setExpectRatio] = useState([20, -30]);
    // MachinePlan 예시 데이터는 8개까지 가능
    const [MachineTitle, setMachineTitle] = useState(["greenCom", "usage", "warning", "greenAircon"]);
    const [MachinePlan, setMachinePlan] = useState(["test1", "test2", "test3", "test4"]);
    const AlertIcon = (index) =>
      MachineTitle[index] === "greenCom" ? "/Icon/GreenComIcon.svg"
      : MachineTitle[index] === "greenAircon" ? "/Icon/GreenAirconIcon.svg"
      : MachineTitle[index] === "usage" ? "/Icon/UsageAiconIcon.svg"
      : MachineTitle[index] === "warning" ? "/Icon/WarningIcon.svg" : null;

  
    return (
        <Overlay>
            <ModalHeader>
                <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
                <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
            </ModalHeader>

            <Titlediv>통합 분석</Titlediv>
            <Maindiv>
              <AnalysisMain>
                <AnalysisMainTop>
                  <MainTop>
                    <div>금월 예상 비용</div>
                    <div>0,000,000 원</div>
                    <ExpectRatiodiv ExpectRatio={ExpectRatio[0]}>
                        <UpDownIcon ExpectRatio={ExpectRatio[0]}>
                            <img className="up" src= "/Icon/up_icon.svg" alt="오름세" />
                            <img className="down" src= "/Icon/down_icon.svg" alt="내림세" />
                        </UpDownIcon>
                        작년 동월 대비 {ExpectRatio[0]} %
                        <UpDownFont ExpectRatio={ExpectRatio[0]}>
                            <div>증가</div>
                            <div>감소</div>
                        </UpDownFont>
                    </ExpectRatiodiv>
                    <div>표</div>
                  </MainTop>

                  <MainTop>
                    <div>금년 예상 비용</div>
                    <div>00,000,000 원</div>
                    <ExpectRatiodiv ExpectRatio={ExpectRatio[1]}>
                        <UpDownIcon ExpectRatio={ExpectRatio[1]}>
                            <img className="up" src= "/Icon/up_icon.svg" alt="오름세" />
                            <img className="down" src= "/Icon/down_icon.svg" alt="내림세" />
                        </UpDownIcon>
                        작년 동월 대비 {ExpectRatio[1]} %
                        <UpDownFont ExpectRatio={ExpectRatio[1]}>
                            <div>증가</div>
                            <div>감소</div>
                        </UpDownFont>
                    </ExpectRatiodiv>
                    <div>표</div>
                  </MainTop>
                </AnalysisMainTop>



                <AnalysisMainBottom>
                  <MainBottomTop>동 업종 대비 저비용 지출 분석</MainBottomTop>
                  
                  <MainBottomMiddle>
                    <BottomMiddleLeft>표</BottomMiddleLeft>
                    <BottomMiddleRight>
                      <BuildingAverageleft>
                        <div>상위 5% 평균</div>
                        <div>전체 평균</div>
                        <div>우리 빌딩</div>
                      </BuildingAverageleft>

                      <BuildingAverageright>
                        <div>0,000,000 원</div>
                        <div>0,000,000 원</div>
                        <div>0,000,000 원</div>
                      </BuildingAverageright>
                    </BottomMiddleRight>
                  </MainBottomMiddle>

                  <BottomBottom>
                    동 업종 {3325}개 중 상위 {58}% {"평균 오차 범위에 속해요."}
                  </BottomBottom>
                </AnalysisMainBottom>
              </AnalysisMain>



              <AnalysisPlan>
                <PlanTop>에너지 절감 방안 제시</PlanTop>
                <PlanMain MachinePlans={MachinePlan}>
                  {MachinePlan.map((Plan, index) => (
                    <MachineDiv key={index} title={MachineTitle[index]}>
                      <div>
                        <div>{MachineTitle[index]}</div>
                        <div>{Plan}</div>
                      </div>
                      <div className={`MachineImg${index}`}>
                        <img src={AlertIcon(index)} alt={MachineTitle[index]} />
                      </div>
                    </MachineDiv>
                  ))}
                </PlanMain>
              </AnalysisPlan>
            </Maindiv>
        </Overlay>
    );
}

export default Analysis;