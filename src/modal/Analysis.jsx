import styled from "styled-components";
import {
  Overlay,
  ModalHeader
} from "./ModalComponents/EnergyStyle.jsx";


function Analysis({ onClose }) {
    return (
        <Overlay>
            <ModalHeader>
                <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
                <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
            </ModalHeader>

            <Titlediv>통합 분석</Titlediv>
            <Maindiv>
              <AnalysisLeft>
                <AnalysisLeftTop>
                  <TopLeft></TopLeft>
                  <TopRight></TopRight>
                </AnalysisLeftTop>



                <AnalysisLeftBottom>
                  <BottomTop>동 업종 대비 저비용 지출 분석</BottomTop>
                  
                  <BottomMiddle>
                    <BottomMiddleLeft>표</BottomMiddleLeft>
                    <BottomMiddleRight>
                      <BuildingAverageTop>
                        <div>상위 5% 평균</div>
                        <div>0,000,000원</div>
                      </BuildingAverageTop>
                      <BuildingAverageMiddle>
                        <div>전체 평균</div>
                        <div>0,000,000원</div>
                      </BuildingAverageMiddle>
                      <BuildingAverageBottom>
                        <div>우리 빌딩</div>
                        <div>0,000,000원</div>
                      </BuildingAverageBottom>
                    </BottomMiddleRight>
                  </BottomMiddle>

                  <BottomBottom>
                    동 업종 {}개 중 상위 {}% {}
                  </BottomBottom>
                </AnalysisLeftBottom>
              </AnalysisLeft>



              <AnalysisRight>

              </AnalysisRight>
            </Maindiv>
        </Overlay>
    );
}

export default Analysis;