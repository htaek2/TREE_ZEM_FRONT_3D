import styled, { css, keyframes } from "styled-components";
import { useState, useRef, useEffect } from "react";
import {
  Overlay,
  ModalHeader
} from "./ModalComponents/EnergyStyle.jsx";

// 날짜 선택 라이브러리
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
// MUI 테마 설정
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "dayjs/locale/ko";




// 애니메이션
const rotateDown = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
`;

const rotateUp = keyframes`
  from { transform: rotate(180deg); }
  to { transform: rotate(0deg); }
`;

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
    gap: 8px;
    position: relative;

    > span {
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;

        > img {
            margin: 4px 0 0 4px;
            width: 18px;
            transition: transform 0.3s ease;
            ${({ DetailIsOpen }) =>
            DetailIsOpen
            ? css`
                animation: ${rotateDown} 0.3s forwards;
            `
            : css`
                animation: ${rotateUp} 0.3s forwards;
            `}
        }
    }
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
    cursor: pointer;
    margin-top: -4px;
    color: #FAFAFA;
    background-color: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};


    > span {
        font: 400 12px "나눔고딕";
    }
    
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
    > div.active {
        background: rgba(255, 255, 255, 0.2);
        color: #FAFAFA;
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
    cursor: pointer;
    color: #FAFAFA;
    background-color: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};
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


// 드롭 다운 메뉴 스타일
const DetailSelectMenu = styled.ul`
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid rgba(166, 166, 166, 0.2);
    border-radius: 6px;
    margin: -8px 40px;
    list-style: none;
    padding: 4px 0;
    width: 80px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    background-color: #2B2D30;
    color: #FAFAFA;
`;

const DetailSelectItem = styled.li`
    padding: 6px 10px;
    cursor: pointer;
    font: 400 18px "나눔고딕";
    &:hover {
        background-color: #2B2D30;
    }   
`;


function Detail({ onClose }) {

    // ✅ 날짜 선택기
    const [startValue, setStartValue] = useState(dayjs());
    const [endValue, setEndValue] = useState(dayjs());
    

    useEffect(() => {
        
        const startStr = startValue.format("YYYY-MM-DD HH:mm:ss");
        const endStr = endValue.format("YYYY-MM-DD HH:mm:ss");

        console.log("시작 날짜:", startStr);
        console.log("종료 날짜:", endStr);

        const testapi = async () => {

            const response = await fetch(`/api/energy/elec?start=${startStr}&end=${endStr}&datetimeType=0`);
            console.log("API 응답 상태:", response.status);
            const data = await response.json();
            console.log("API 응답 데이터:", data);
        };
        testapi();
    }, [startValue, endValue]);





        // 실시간 버튼 상태 관리
    const [isRealtimeClick, setIsRealtimeClick] = useState(false);

    // ✅ 대 분류 선택기
    const [DetailSelected, setDetailSelected] = useState("전력");
    const [DetailIsOpen, setDetailIsOpen] = useState(false);
    const ref = useRef(null);
    const ToggleDetail = () => setDetailIsOpen((prev) => !prev);
    const DetailSelect = (item) => {
        setDetailSelected(item);
        setDetailIsOpen(false);
    };
        // 메뉴 내외부 클릭 시 닫기
        useEffect(() => {
        const DetailClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
            setDetailIsOpen(false);
            }
        };
        document.addEventListener("mousedown", DetailClickOutside);
        return () => 
            document.removeEventListener("mousedown", DetailClickOutside);
        }, []);

    // ✅ 층 버튼 활성화 관리
    const [EveryFloor, setEveryFloor] = useState(["전체 층", "F1", "F2", "F3", "F4"]);
    // ✅ 선택 층 상태
    const [SelectedFloor, setSelectedFloor] = useState([""]);

    const FloorClick = (floor) => {
        if (floor === "전체 층") {
            if (SelectedFloor.includes("전체 층")) {
                setSelectedFloor([]);
            } else {
                setSelectedFloor(["전체 층"]);
            }
        } else {
            setSelectedFloor((prev) => {
                let updatedFloors = prev.filter((f) => f !== "전체 층");

                if (updatedFloors.includes(floor)) {
                    updatedFloors = updatedFloors.filter((f) => f !== floor);
                } else {
                    updatedFloors.push(floor);
                }
                return updatedFloors;
            });
        }
        
    };

    // ✅ 실시간, 요금보기 상태관리
    const [IsChargeClick, setIsChargeClick] = useState(false);
    


    const fetchData = async () => {
        try {
            const urls = [
                "/api/energy/elec?", // 전력 사용량 조회
                "/api/energy/gas", // 가스 사용량 조회
                "/api/energy/water", // 수도 사용량 조회
                "/api/energy/elec/{floor}", // 층별 전력
                "/api/energy/water/{floor}", // 층별 수도
                "/api/energy/sse/all", // 실시간 에너지 사용량 조회
                "/api/energy/bill/{floor}", // 전력, 수도 층별 사용금액 조회
            ];
            const response = await Promise.all(urls.map(url => fetch(url)));
            // 응답 검사
            response.forEach(res => {
                if (!res.ok) throw new Error(`${res.url} 응답이 올바르지 않습니다.`);
            });

            const data = await Promise.all(response.map(res => res.json()));
            console.log("데이터 가져오기 성공:", data);
        } catch (error) {
            console.error("데이터 가져오기 실패:", error);
        }
    };

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
                        <DetailHeader $ref={ref} DetailIsOpen={DetailIsOpen} onClick={ToggleDetail}>
                            <div>상세 정보</div>
                            <span>
                                {DetailSelected} <img src="/Icon/dropdown.svg" alt="드롭" />
                            </span>

                            {DetailIsOpen && (
                                <DetailSelectMenu>
                                    {["전력", "가스", "수도"].map((item, index) => (
                                        <DetailSelectItem 
                                            key={index} 
                                            onClick={(event) => {
                                                event.stopPropagation(); // 이벤트 전파 방지(내장 함수)
                                                DetailSelect(item);
                                            }}>
                                            {item}
                                        </DetailSelectItem>
                                    ))}
                                </DetailSelectMenu>
                            )}
                        </DetailHeader>

                        <DetailDate>
                            {/* 날짜 선택기 */}
                            <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePickerdiv>
                                    <DateTimePicker
                                        label="시작 날짜"
                                        value={startValue}
                                        onChange={setStartValue}
                                        defaultValue={dayjs("2022-10-01T00:00")}
                                        minDateTime={dayjs("2022-10-01T00:00")}  // ✅ 2022년 10월 이전 선택 불가
                                        maxDateTime={dayjs()}                     // ✅ 현재 시각 이후 선택 불가
                                        disabled={isRealtimeClick}     // 실시간 모드 시 비활성화
                                    />

                                    <DateTimePicker
                                        label="종료 날짜"
                                        value={endValue}
                                        onChange={setEndValue}
                                        format="YYYY.MM.DD. hh:mm A" // 연/월/일 순서, 24시간 표시
                                        minDateTime={dayjs("2022-10-01T00:00")}  // ✅ 시작 제한 동일
                                        maxDateTime={dayjs()}                    // ✅ 현재 시각까지만 가능
                                        disabled={isRealtimeClick}     // 실시간 모드 시 비활성화
                                    />
                                </DateTimePickerdiv>
                            </LocalizationProvider>
                            </ThemeProvider>
                        </DetailDate>

                        <DetailRealTime 
                            $active={isRealtimeClick}
                            onClick={() => setIsRealtimeClick(prev => !prev)}>
                            실시간 보기<span>(오늘 기준)</span>
                        </DetailRealTime>
                    </DetailTop>
<Lines />
                    <DetailBottom>
                        <DetailFloor>
                            <div className="DetailTitle">건물 / 층별</div>
                            <DetailFloorSelect>
                                {EveryFloor.map((floor) => (
                                    <div
                                    key={floor}
                                    onClick={() => FloorClick(floor)}
                                    className={SelectedFloor.includes(floor) ? "active" : ""}
                                    >
                                        {floor}
                                    </div>
                                ))}
                            </DetailFloorSelect>
                        </DetailFloor>

                        <DetailCharge $active={IsChargeClick} onClick={() => setIsChargeClick(prev => !prev)}>
                            요금 보기
                        </DetailCharge>
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