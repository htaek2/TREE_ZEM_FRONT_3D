import styled from "styled-components";
import {
  Overlay,
  ModalHeader
} from "./ModalComponents/EnergyStyle.jsx";
import { useState } from "react";

const Titlediv = styled.div``;
const AnalysisMain = styled.div``;
const AnalysisMainTop = styled.div``;
const MainTopLeft = styled.div``;
const ExpectRatiodiv = styled.div``;
const MainTopRight = styled.div``;
const AnalysisMainBottom = styled.div``;
const MainBottomTop = styled.div``;
const MainBottomMiddle = styled.div``;
const BottomMiddleLeft = styled.div``;
const BottomMiddleRight = styled.div``;
const BuildingAverageTop = styled.div``;
const BuildingAverageMiddle = styled.div``;
const BuildingAverageBottom = styled.div``;
const BottomBottom = styled.div``;
const AnalysisPlan = styled.div``;
const PlanTop = styled.div``;
const PlanMain = styled.div``;


function Analysis({ onClose }) {
    const [ExpectRatio, setExpectRatio] = useState([20, -30]);
  
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
                  <MainTopLeft>
                    <div>금월 예상 비용</div>
                    <div>0,000,000 원</div>
                    <ExpectRatiodiv ExpectRatio={ExpectRatio[0]}>
                        <UpDownIcon ExpectRatio={ExpectRatio[0]}>
                            <img className="up" src= "/Icon/up_icon.svg" alt="오름세" />
                            <img className="down" src= "/Icon/down_icon.svg" alt="내림세" />
                        </UpDownIcon>
                        작년 동월 대비 {} %
                        <UpDownFont ExpectRatio={ExpectRatio[0]}>
                            <div>증가</div>
                            <div>감소</div>
                        </UpDownFont>
                    </ExpectRatiodiv>
                  </MainTopLeft>

                  <MainTopRight>
                    <div>금년 예상 비용</div>
                    <div>00,000,000 원</div>
                    <ExpectRatiodiv ExpectRatio={ExpectRatio[1]}>
                        <UpDownIcon ExpectRatio={ExpectRatio[1]}>
                            <img className="up" src= "/Icon/up_icon.svg" alt="오름세" />
                            <img className="down" src= "/Icon/down_icon.svg" alt="내림세" />
                        </UpDownIcon>
                        작년 동월 대비 {} %
                        <UpDownFont ExpectRatio={ExpectRatio[1]}>
                            <div>증가</div>
                            <div>감소</div>
                        </UpDownFont>
                    </ExpectRatiodiv>
                  </MainTopRight>
                </AnalysisMainTop>



                <AnalysisMainBottom>
                  <MainBottomTop>동 업종 대비 저비용 지출 분석</MainBottomTop>
                  
                  <MainBottomMiddle>
                    <BottomMiddleLeft>표</BottomMiddleLeft>
                    <BottomMiddleRight>
                      <BuildingAverageTop>
                        <div>상위 5% 평균</div>
                        <div>0,000,000 원</div>
                      </BuildingAverageTop>
                      <BuildingAverageMiddle>
                        <div>전체 평균</div>
                        <div>0,000,000 원</div>
                      </BuildingAverageMiddle>
                      <BuildingAverageBottom>
                        <div>우리 빌딩</div>
                        <div>0,000,000 원</div>
                      </BuildingAverageBottom>
                    </BottomMiddleRight>
                  </MainBottomMiddle>

                  <BottomBottom>
                    동 업종 {}개 중 상위 {}% {}
                  </BottomBottom>
                </AnalysisMainBottom>
              </AnalysisMain>



              <AnalysisPlan>
                <PlanTop>에너지 절감 방안 제시</PlanTop>
                <PlanMain></PlanMain>
              </AnalysisPlan>
            </Maindiv>
        </Overlay>
    );
}

export default Analysis;