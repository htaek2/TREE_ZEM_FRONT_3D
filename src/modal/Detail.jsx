import styled from "styled-components";
import { useState } from "react";
import {
  Overlay,
  ModalHeader
} from "./ModalComponents/EnergyStyle.jsx";

// 날짜 선택 라이브러리
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// MUI 테마 설정
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "dayjs/locale/ko";



const DetailBody = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 8px;
    gap: 8px;
`;
const DetailMain = styled.div`
    display: flex;
    flex-direction: column;
    width: 30%;
    height: 100%;
    background-color: #2B2D30;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    padding: 8px;
`;
const DetailChart = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70%;
    height: 100%;
    background-color: #2B2D30;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    padding: 8px;
    
    > div:last-child {
        width: 100%;
        height: 95%;
    }
`;




const DetailTop = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: calc(50% - 8px);
    gap: 8px;
`;
const DetailHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    width: 100%;
    height: 20%;
    font: 700 26px "나눔고딕";
    color: #FAFAFA;
    padding: 0 0 0 8px;
    cursor: pointer;
`;
const DetailDate = styled.div`
    display: flex;
    width: 100%;
    height: 70%;
    border: 2px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
`;
const DetailRealTime = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    width: 100%;
    height: 10%;
    font: 400 18px "나눔고딕";
    color: #FAFAFA;
    cursor: pointer;
`;

const DetailBottom = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: calc(50% - 8px);
    gap: 8px;
`;
const DetailFloor = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    width: 100%;
    height: 90%;
    padding: 8px;
    gap: 8px;

    > div.DetailTitle {
        width: 100%;
        height: 15%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid rgba(166, 166, 166, 0.2);
        border-radius: 10px;
        font: 700 20px "나눔고딕";
        color: #FAFAFA;
    }
`;
const DetailFloorSelect = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: calc(90% - 8px);
    gap: 8px;

    > div {
        width: 100%;
        height: 12%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid rgba(166, 166, 166, 0.2);
        border-radius: 10px;
        padding: 4px;
        font: 400 18px "나눔고딕";
        color: #FAFAFA;
        cursor: pointer;
    }
    > div:active {
        background: rgba(255, 255, 255, 0.2);
        color: #000000;
    }
`;
const DetailCharge = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 10%;
    border: 2px solid rgba(166, 166, 166, 0.2);
    border-radius: 10px;
    font: 400 18px "나눔고딕";
    color: #FAFAFA;
    cursor: pointer;
`;



const DetailShare = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 5%;

    > div {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid rgba(166, 166, 166, 0.2);
        border-radius: 10px;
        font: 400 18px "나눔고딕";
        color: #FAFAFA;
        cursor: pointer;
        width: 120px;
        height: 32px;
        padding: 4px;
        gap: 4px;
    }

    > div > img {
        width: 14px;
        height: 14px;
    }
`;

const Lines = styled.hr`
    display: flex;
    width: calc(100% + 16px);
    margin: 8px -9px;
    border: 1px solid rgba(166, 166, 166, 0.2);
`;

// 날짜 선택기 스타일
const DateTimePickerdiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
    width: 100%;
    height: 100%;
`;
dayjs.locale("ko");

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});



function Detail({ onClose }) {

    const [value, setValue] = useState(dayjs("2025-10-14T15:30"));

    return (        

        <Overlay>
            <ModalHeader>
                <div><img src="/Icon/ZEM_logo.svg" alt="로고" />ZEM</div>
                <div><img src="/Icon/ZEM_cancel.svg" alt="닫기" onClick={onClose} /></div>
            </ModalHeader>

            <DetailBody>
                {/* 좌측 리모컨 */}
                <DetailMain>
                    <DetailTop>
                        <DetailHeader>
                            <div>전력 상세 정보 <img src="/Icon/dropdown.svg" alt="드롭" /></div>
                        </DetailHeader>

                        <DetailDate>
                            {/* 날짜 선택기 */}
                            <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePickerdiv>
                                    <DateTimePicker
                                        label="시작 날짜"
                                        defaultValue={dayjs("2022-04-17T15:30")}
                                    />

                                    <DateTimePicker
                                        label="종료 날짜"
                                        value={value}
                                        onChange={(newValue) => setValue(newValue)}
                                        format="YYYY.MM.DD. hh:mm A" // 연/월/일 순서, 24시간 표시
                                    />
                                </DateTimePickerdiv>
                            </LocalizationProvider>
                            </ThemeProvider>
                        </DetailDate>

                        <DetailRealTime>실시간</DetailRealTime>
                    </DetailTop>
<Lines />
                    <DetailBottom>
                        <DetailFloor>
                            <div className="DetailTitle">건물 / 층별</div>
                            <DetailFloorSelect>
                                <div>전체 층</div>
                                <div>1층</div>
                                <div>2층</div>
                                <div>3층</div>
                                <div>4층</div>
                            </DetailFloorSelect>
                        </DetailFloor>

                        <DetailCharge>요금 보기</DetailCharge>
                    </DetailBottom>
                </DetailMain>

                <DetailChart>
                    <DetailShare>
                        <div><img src="/Icon/share_icon.svg" alt="공유" />공유하기</div>
                    </DetailShare>
                    <div>표</div>
                </DetailChart>
            </DetailBody>

        </Overlay>
    );
}

export default Detail;