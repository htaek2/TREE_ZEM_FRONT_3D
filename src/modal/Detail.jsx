import styled, { css, keyframes } from "styled-components";
import { useState, useRef, useEffect, useCallback } from "react";
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
//
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { a } from "@react-spring/three";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);





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
    height: 720px;
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
    pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
    opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

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
        cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    }
    > div.active {
        background: rgba(255, 255, 255, 0.2);
        color: #FAFAFA;
    }


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


function Detail({ onClose, todayUsage }) {

    // ✅ 버튼 분류기
    // 분류 1 / 대 분류 선택기
    const [DetailSelected, setDetailSelected] = useState("전력");
    // 분류 2 / 날짜 선택기
    const [startValue, setStartValue] = useState(dayjs());
    const [endValue, setEndValue] = useState(dayjs());
    // 분류 3 / 실시간 버튼 상태 관리
    const [isRealtimeClick, setIsRealtimeClick] = useState(false);
    // 분류 4 /  선택 층 상태
    const [SelectedFloor, setSelectedFloor] = useState([]);
    // 분류 5 / 요금 보기 상태
    const [IsChargeClick, setIsChargeClick] = useState(false);

    // ✅ 차트 그릴 꺼
    const [chartData, setChartData] = useState({
        labels: [], // X축 (날짜 , 시간)
        datasets: [], // Y축 (사용량, 요금)
    });


    // useEffect(() => {
        // const startStr = startValue.format("YYYY-MM-DD HH:mm:ss");
        // const endStr = endValue.format("YYYY-MM-DD HH:mm:ss");
        // console.log("시작 날짜:", startStr);
        // console.log("종료 날짜:", endStr);
    //     const testapi = async () => {

    //         const response = await fetch(`/api/energy/elec?start=${startStr}&end=${endStr}&datetimeType=0`);
    //         console.log("TEST API 응답 상태:", response.status);
    //         const data = await response.json();
    //         console.log("TEST API 응답 데이터:", data);
    //     };
    //     testapi();
    // }, [startValue, endValue]);

    const myurl = [
        "/api/energy/elec?", // 전력 사용량 조회
        "/api/energy/gas", // 가스 사용량 조회
        "/api/energy/water", // 수도 사용량 조회
        "/api/energy/elec/{floor}", // 층별 전력
        "/api/energy/water/{floor}", // 층별 수도
        "/api/energy/sse/all", // 실시간 에너지 사용량 조회
        "/api/energy/bill/elec/{floor}", // 전력 층별 사용금액 조회
        "/api/energy/bill/water/{floor}", // 수도 층별 사용금액 조회
    ];


    const fetchData =  useCallback(async (urls) => {
        try {
            const response = await Promise.all(urls.map(url => fetch(url)));
            // 응답 검사
            response.forEach((res, index) => {
                if (!res.ok) throw new Error(`${urls[index]} 응답이 올바르지 않습니다.`);
            });

            const data = await Promise.all(response.map(res => res.json()));
            console.log("⭐ MAIN 데이터 가져오기 성공:", data);
        
            
            // 차트 데이터 가공쓰
            const energyTypes = {
                '전력': 'ELECTRICITY',
                '가스': 'GAS',
                '수도': 'WATER'
            };
            const selectedEnergy = energyTypes[DetailSelected];
            console.log("선택된 에너지 타입:", selectedEnergy); //

            let filteredData = [];
            let FloorCache = SelectedFloor;

            if (data.length > 0) {
                if (selectedEnergy === "GAS" || FloorCache.includes("전체")) {
                    filteredData = (Array.isArray(data[0]) ? data[0] : data).filter(item => item.energyType === selectedEnergy);
                    FloorCache = FloorCache.filter(floor => floor !== "전체");
                    if (FloorCache.length !== 0) {
                        filteredData = data.filter(item => item.energyType === selectedEnergy);    
                    }
                } else if (FloorCache.includes("전체") === false) {
                    filteredData = data.filter(item => item.energyType === selectedEnergy);
                }
                console.log("필터링된 데이터:", filteredData);
            }


            if (filteredData.length > 0) {
                // X축 라벨은 첫 번째 데이터 기준
                const labels = filteredData[0].datas.map(d => d.timestamp.split(' ')[0]);

                // 각 데이터 항목을 dataset으로 변환
                const colors = ['red', 'yellow', 'blue', 'green', 'orange', 'purple']; // 색상 배열
                const datasets = filteredData.map((item, index) => {

                    return {
                        label: `${DetailSelected} - ${SelectedFloor[index]}층`,
                        data: item.datas.map(d => d.usage),
                        borderColor: colors[index % colors.length],
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0,             // 직선 연결
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: "#FAFAFA",
                        pointBorderColor: colors[index % colors.length],
                    };
                });

            // 차트 데이터 업데이트
            setChartData({
                labels,
                datasets
            });

            console.log("가공된 차트 데이터:", { labels, datasets });
        }
        
        } catch (error) {
            console.error("⭐ MAIN 데이터 가져오기 실패:", error);
        }
    }, [SelectedFloor, DetailSelected]);



// 실시간 보기일 때 (날짜 무시)
    useEffect(() => {
        if (!isRealtimeClick) return;

        // const eventSource = new EventSource("/api/energy/sse/all");
        // eventSource.onmessage = (event) => {
        //     console.log("📡 실시간 데이터:", JSON.parse(event.data));
        // };
        // eventSource.onerror = (err) => {
        //     console.error("❌ SSE 연결 오류:", err);
        //     eventSource.close();
        // };

        // return () => {
        //     console.log("🔌 SSE 연결 종료");
        //     eventSource.close();
        // };
        console.log("💡오늘 사용량 데이터:", todayUsage);


    }, [isRealtimeClick, todayUsage]);


// 버튼 입력 받아 데이터 가져오기
    useEffect(() => {
        if (isRealtimeClick) return;
        
        const startStr = startValue.format("YYYY-MM-DD HH:mm:ss");
        const endStr = endValue.format("YYYY-MM-DD HH:mm:ss");

        // 시간 따지기
        const diffDays = endValue.diff(startValue, "day");
        const diffMonths = endValue.diff(startValue, "month");   
        const diffYears = endValue.diff(startValue, "year");     

        let datetimeType = 0;
        if (diffDays < 2) datetimeType = 0; // 시간 단위
        else if (diffDays < 60) datetimeType = 1; // 일 단위
        else if (diffMonths < 24) datetimeType = 2; // 월 단위
        else datetimeType = 3; // 연 단위



        let url = "";
        let urls = [];
        let FloorCache = SelectedFloor;

        // 요금 보기일 때
        if (IsChargeClick) {
            if (DetailSelected === "가스") {
                urls.push(`/api/energy/bill?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`);
                console.log("🍪", urls);
            }
            else {
                if (SelectedFloor.includes("전체")) {
                    urls.push(`/api/energy/bill?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`);
                    console.log("🍪🍪", urls);
                } 
                if (SelectedFloor.length > 0) {
                    SelectedFloor
                        .filter(floor => floor !== "전체")
                        .forEach(
                            (floor) => urls.push(`/api/energy/bill/${DetailSelected === "전력" ? "elec" : "water"}/${floor}?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`)
                        );
                    console.log("🍪🍪🍪");
                    console.log("🍪🍪🍪", SelectedFloor);
                    console.log("🍪🍪🍪", urls);
                }
            }
        }
        else if (DetailSelected === "가스") {
        urls.push(`/api/energy/gas?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`);
        console.log("🍪", urls);
        }


        // // 일반 전체 선택
        // else if (SelectedFloor.includes("전체")) {
        //     url = `/api/energy/${DetailSelected === "전력" ? "elec" : DetailSelected === "가스" ? "gas" : "water"}?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`;
        // }

        // 층별 선택
        else {
            if (SelectedFloor.includes("전체")) {
                urls.push(`/api/energy/${DetailSelected === "전력" ? "elec" : DetailSelected === "가스" ? "gas" : "water"}?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`);
                FloorCache = FloorCache.filter(floor => floor !== "전체");
                if (FloorCache.length !== 0) {
                    FloorCache
                    .forEach(
                        (floor) => urls.push(`/api/energy/${DetailSelected === "전력" ? "elec" : "water"}/${floor}?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`)
                    );
                }
            } else {
                    FloorCache
                    .forEach(
                        (floor) => urls.push(`/api/energy/${DetailSelected === "전력" ? "elec" : "water"}/${floor}?start=${startStr}&end=${endStr}&datetimeType=${datetimeType}`)
                    );
            }
            console.log("🍪🍪🍪🍪", SelectedFloor);
            console.log("🍪🍪🍪🍪", urls);
        }

        if (urls.length > 0) {
            fetchData(urls);
            urls = [];
        } else {console.warn("URL이 정의되지 않았습니다.");}

    }, [DetailSelected, startValue, endValue, SelectedFloor, IsChargeClick, isRealtimeClick, fetchData]);




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
    const [EveryFloor] = useState(["전체", "1", "2", "3", "4"]);


    const FloorClick = (floor) => {
    setSelectedFloor((prev) => {
        // if (floor === "전체") {
        //     return prev.includes("전체") ? [] : ["전체"];
        // }

        // 전체 층 제거
        let updated = prev;

        // 이미 선택된 층이면 제거, 아니면 추가
        updated = updated.includes(floor)
            ? updated.filter(f => f !== floor)
            : [...updated, floor];

        return updated;
    });
    };


    const options = {
        width: '100%',
        height: '100%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
            labels: {
                color: "white", // 레전드 글씨 색상
                font: {
                size: 14,
                weight: "bold",
                },
            },
            },
        },
        scales: {
            x: {
            ticks: { color: "yellow" }, // X축 글씨 색상
            grid: { color: "gray" },     // X축 그리드 색상
            },
            y: {
                ticks: { color: "yellow" },
                grid: { color: "gray" },
            },
        },
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
                            <DetailFloorSelect $disabled={DetailSelected === "가스"}>
                                {EveryFloor.map((floor) => (
                                    <div
                                    key={floor}
                                    onClick={() => {
                                        if (DetailSelected === "가스") return; // 클릭 차단
                                        FloorClick(floor);
                                    }}
                                    className={SelectedFloor.includes(floor) ? "active" : ""}
                                    >
                                        {floor} 층
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
                    <div><Line data={chartData} options={options} /></div>
                </DetailChart>
            </DetailBody>

        </Overlay>

    );
}

export default Detail;