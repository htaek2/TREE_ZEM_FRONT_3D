import { Suspense, use, useEffect, useState, useMemo } from "react";
import "./App.css";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import Model from "./Model";
import { OrbitControls } from "@react-three/drei";
import styled from "styled-components";
import { CAMERA_CONFIG, MODEL_TO_FLOOR, MODELS } from "./constants";
import GlobalStyle from "./GlobalStyle";

import CameraController from "./components/CameraController";
import Login from "./components/Login";

// 🍪
import BrandClock from "./components/BrandClock";


import Wing2 from "./components/Wing2";



const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  // overflow: hidden;
  background: #bfbfc6;
  touch-action: none;
`;

// 🎯 반응형 카메라 설정 함수
const getResponsiveCameraSettings = (isAuthenticated) => {
  const width = window.innerWidth;
  console.log(
    isAuthenticated ? "로그인된 사용자" : "비로그인 사용자",
    "화면 너비:",
    width
  );
  // 모바일 (768px 미만)
  if (width < 768) {
    return {
      defaultPosition: [-50, 30, 20],
      activePosition: [15, 8, 0],
      defaultFov: 50,
      activeFov: 60,
      minDistance: 30,
      maxDistance: 60,
      target: [13, 8, -8],
    };
  }
  // 태블릿 및 PC (768px 이상) - 모두 태블릿 설정 사용
  else if (width >= 768) {
    return {
      defaultPosition: [-60, 32, 22],
      activePosition: [-15, 80, 30],
      defaultFov: 40,
      activeFov: 30,
      minDistance: 35,
      maxDistance: 55,
      target: [13, 5, -8],
    };
  }
};

function App() {
  const [auth, setAuthState] = useState({ isAuthenticated: false, user: null });
  const [active, setActive] = useState({ active: false, model: null });
  const modelsToShow = active.active ? [active.model] : MODELS; 
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [computers, setComputer] = useState([]);
  const [cameraSettings, setCameraSettings] = useState(
    getResponsiveCameraSettings(auth.isAuthenticated)
    
  );
  /*세구 1021 17:00*/
  const [weatherNow, setWeatherNow] = useState({
    humidity : 0,
    nowTemperature : 0,
    weatherStatus : 0,
    windSpeed :0
  });
  
  
  const [todayUsage, setTodayUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
    nowtimegas : 0,
    nowtimeelec : 0,
    nowtimewater : 0,

  });

  const [yesterdayUsage, setYesterdayUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
    maxGas: 0,
    maxElec: 0,
    maxWater: 0,
    nowtimegas : 0,
    nowtimeelec : 0,
    nowtimewater : 0,
  });

  const [monthUsage, setMonthUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
  });

  const [lastMonthUsage, setLastMonthUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
    maxGas: 0,
    maxElec: 0,
    maxWater: 0,
  });

  const [floors, setFloors] = useState([
    { devices: [] },
    { devices: [] },
    { devices: [] },
    { devices: [] },
  ]);


  const [buildingInfo, setBuildingInfo] = useState({
    totalArea: 0, // 건물 총 면적
  });


  const [billInfo, setBillInfo] = useState({
    electricRealTime: 0, // 전기 실시간 요금
    gasRealTime: 0, // 가스 실시간 요금
    waterRealTime: 0, // 수도 실시간 요금
    electricLastMonth: 0, // 전월 요금
    gasLastMonth: 0, // 가스 전월 요금
    waterLastMonth: 0, // 수도 전월 요금
    electricThisMonth: 0, // 금월 요금
    gasThisMonth: 0, // 금월 요금
    waterThisMonth: 0, // 금월 요금
  });


  const [AvgFee, setAvgFee] = useState({
    national : 0,
    location : 0,
  });

  
  const dataFormat = (data) => {
    let month = data.getMonth() + 1;
    let day = data.getDate();
    let hour = data.getHours();
    let minute = data.getMinutes();
    let second = data.getSeconds();

    month = month >= 10 ? month : "0" + month;
    day = day >= 10 ? day : "0" + day;
    hour = hour >= 10 ? hour : "0" + hour;
    minute = minute >= 10 ? minute : "0" + minute;
    second = second >= 10 ? second : "0" + second;

    return (
      data.getFullYear() +
      "-" +
      month +
      "-" +
      day +
      " " +
      hour +
      ":" +
      minute +
      ":" +
      second
    );
  };
 
  const ElectFetch = () => {
    console.log("SSE 연결 시작...");
    // sse 연결 - 프록시를 통해 상대 경로 사용
    const eventSource = new EventSource("/api/energy/sse/all");

    // SSE 연결 성공
    eventSource.onopen = function () {
      console.log("✅ SSE 연결 성공");
    };

    // 데이터 수신 시
    eventSource.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);  

        console.log("SSE 데이터 수신:", data.elecPrice);

        // 실시간 요금 업데이트
        setBillInfo((prev) => ({
          ...prev,
          electricThisMonth: prev.electricThisMonth + data.elecPrice,
          gasThisMonth: prev.gasThisMonth + data.gasPrice,
          waterThisMonth: prev.waterThisMonth + data.waterPrice,
        }));
        const waterUsages = data.floors.map(
          (floor) => floor.waterUsage.datas[0].usage
        );

        let totalWater = waterUsages.reduce((sum, usage) => sum + usage, 0);

        console.log("수도 사용량:", waterUsages);
        console.log("수도 사용량 합계:", totalWater);
        

        if(totalWater < 0) {
          totalWater = 0;
        }

        setFloors((prevFloors) => {
          const newFloors = [...prevFloors];
          data.floors.forEach((floor) => {
            if (floor.floorNum >= 1 && floor.floorNum <= 4) {
              newFloors[floor.floorNum - 1].devices = floor.devices;
            }
          });
          return newFloors;
        });

        if(data.floors.length === 0) {
          console.log("층 데이터가 없습니다.");
          return;
        }


        // 모든 층의 디바이스 전력 사용량 합산하여 elecUsage 업데이트
        let totalFloorElecUsage = data.floors.reduce((sum, floor) => {
          const floorTotal = floor.devices.reduce((deviceSum, device) => {
            const deviceUsage = device.electricityUsage?.datas?.[0]?.usage || 0;
            return deviceSum + deviceUsage;
          }, 0);
          return sum + floorTotal;
        }, 0);

        console.log("층별 전기 사용량 합계:", totalFloorElecUsage);

        if (totalFloorElecUsage < 0) {
          totalFloorElecUsage = 0;
        }

        
        if(data.gasUsage.datas[0].usage < 0) {
          data.gasUsage.datas[0].usage = 0;
        }

        let nowGasUsage = data.gasUsage.datas[0].usage;


        if(nowGasUsage < 0){
          nowGasUsage = 0;
        }

        setTodayUsage((prev) => ({
          ...prev,
          water: Math.floor((prev.water + totalWater) * 100000) / 100000,
          gas:
            Math.floor((prev.gas + nowGasUsage) * 10000) /
            10000,
          elec: Math.floor((prev.elec + totalFloorElecUsage) * 100) / 100,
        }));

        
        // 금월 사용량도 동일하게 누적
        setMonthUsage((prev) => ({
          ...prev,
          water: Math.floor((prev.water + totalWater) * 100000) / 100000,
          gas:
            Math.floor((prev.gas + data.gasUsage.datas[0].usage) * 10000) /
            10000,
          elec: Math.floor((prev.elec + totalFloorElecUsage) * 10) / 10,
        }));
      } catch (error) {
        console.log("텍스트 데이터:", event.data);
      }
    };

    // 오류 발생 시
    eventSource.onerror = function (err) {
      console.error("❌ SSE 연결 오류:", err);
      eventSource.close();
    };
  };



/*세구 1021 17:00*/
// 현재 날씨 가져오기 (5분마다 갱신)
const fetchWeatherNow = async () => {
  console.log("날짜요청이야아아아아아아아아아아아아앙아")
  fetch('/api/weather/now') // GET 요청 (기본값)
  .then(response => {
    // 응답 헤더를 확인하거나, 응답이 성공적이지 않다면 여기서 처리할 수 있습니다.
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // 응답 본문을 JSON으로 파싱
  })
  .then(data => {
    console.log("받은날짜아아아아아아아아아아아",data); // 파싱된 JSON 데이터를 사용
      setWeatherNow({
        ...prev,
        humidity : data.humidity,
        nowTemperature : data.nowTemperature,
        weatherStatus : data.weatherStatus,
        windSpeed : data.windSpeed
      });
  })
  .catch(error => {
    console.error('Fetch error:', error); // 오류 처리
  });

    
  };





  const getBillStat = async () => {
    try {
      console.log("12개월 월 평균 사용금액 조회 Fetch 시작");
      fetch(`/api/bill/stat`)
        .then((response) => response.json())
        .then((data) => {
          console.log("12개월 통계 API 응답 데이터:", data);

          // data.avgAll이 존재하고 배열인지 확인
          if (data?.avgAll && Array.isArray(data.avgAll) && data.avgAll.length > 0) {
            const total = data.avgAll.reduce((sum, item) => {
              const amount = Number(item) || 0;
              return sum + amount;
            }, 0);
            const average = total / data.avgAll.length;
            console.log("12개월 월 평균 사용금액:", average, "원");
            

            setAvgFee((prev) => ({
              ...prev,
              national: Math.trunc(average),
            }));  
          } else {
            console.warn("avgAll 데이터가 없거나 비어있습니다:", data);
          }

          if (data?.avgLocal && Array.isArray(data.avgLocal) && data.avgLocal.length > 0) {
            const totalLocal = data.avgLocal.reduce((sum, item) => {
              const amount = Number(item) || 0;
              return sum + amount;
            }, 0);
            const averageLocal = totalLocal / data.avgLocal.length;
            console.log("12개월 지역 월 평균 사용금액:", averageLocal, "원");
            setAvgFee((prev) => ({
              ...prev,
              location: Math.trunc(averageLocal),
            }));
          } else {
            console.warn("avgLocal 데이터가 없거나 비어있습니다:", data);
          }
        });
        
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  
  /* 🍪 - 백 25-10-20 -*/
  const getLastMonthlyBill = async () => {
    try {
      console.log("전월 요금 Fetch 시작");
      let now = new Date();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      lastMonth.setHours(0, 0, 0, 0);
      const params = new URLSearchParams({
        start: dataFormat(lastMonth),
        end: dataFormat(lastMonthEnd),
        datetimeType: 2, // 0=시간, 1=일, 2=월, 3=년
      });
      fetch(`/api/energy/bill?${params}`)
        .then((response) => response.json())
        .then((data) =>
          data.map((energy) => {
            if (energy.energyType === "ELECTRICITY") {
              const totalElecUsage = energy.datas.reduce(
                (sum, el) => sum + el.usage,
                0
              );
              console.log("전월 전기 요금 합계:", Math.trunc(totalElecUsage));
              setBillInfo((prev) => ({
                ...prev,
                electricLastMonth: Math.trunc(totalElecUsage),
              }));
            } else if (energy.energyType === "GAS") {
              const totalGasUsage = energy.datas.reduce(
                (sum, el) => sum + el.usage,
                0
              );
              console.log("전월 가스 요금 합계:", Math.trunc(totalGasUsage));  
              setBillInfo((prev) => ({  
                ...prev,
                gasLastMonth: Math.trunc(totalGasUsage),
              }));
            } else if (energy.energyType === "WATER") {
              const totalWaterUsage = energy.datas.reduce(
                (sum, el) => sum + el.usage,
                0 
              );
              console.log("전월 수도 요금 합계:", Math.trunc(totalWaterUsage));
              setBillInfo((prev) => ({
                ...prev,
                waterLastMonth: Math.trunc(totalWaterUsage),
              }));
            }
            return null;
          })
        )
        .catch((error) => console.error("Error:", error));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  /* 🍪 - 백 25-10-20 -*/
  const getMonthlyBill = async () => {
    try {
      console.log("금월 요금 Fetch 시작");


      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
     
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    thisMonth.setHours(0, 0, 0, 0);

    const params = new URLSearchParams({
      start: dataFormat(thisMonth),
      end: dataFormat(now),
      datetimeType: 0, // 0=시간, 1=일, 2=월, 3=년
    });

    

  fetch(`/api/energy/bill?${params}`)
    .then(response => response.json())
  .then(data => data.map(energy => {
    console.log("금월 요금 데이터:", data);
    if (energy.energyType === 'ELECTRICITY') {
      const totalElecUsage = energy.datas.reduce((sum, el) => sum + el.usage, 0);
      console.log("전기 요금 합계:", Math.trunc(totalElecUsage));
    } else if (energy.energyType === 'GAS') {
      const totalGasUsage = energy.datas.reduce((sum, el) => sum + el.usage, 0);
      console.log("가스 요금 합계:", Math.trunc(totalGasUsage));
    } else if (energy.energyType === 'WATER') {
      const totalWaterUsage = energy.datas.reduce((sum, el) => sum + el.usage, 0);
      console.log("수도 요금 합계:", Math.trunc(totalWaterUsage));
    }
    setBillInfo(prev => ({
      ...prev,
      electricThisMonth: energy.energyType === 'ELECTRICITY' ? Math.trunc(energy.datas.reduce((sum, el) => sum + el.usage, 0)) : prev.electricThisMonth,
      gasThisMonth: energy.energyType === 'GAS' ? Math.trunc(energy.datas.reduce((sum, el) => sum + el.usage, 0)) : prev.gasThisMonth,
      waterThisMonth: energy.energyType === 'WATER' ? Math.trunc(energy.datas.reduce((sum, el) => sum + el.usage, 0)) : prev.waterThisMonth,
    }));


    return null;
  }))
    .catch(error => console.error('Error:', error));
    } catch (error) {
      console.error("Fetch error:", error);
    }


  };
  const getYesterdayUsage = async () => {
    try {
      console.log("어제 사용량 Fetch 시작");

      let now = new Date();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      let start = dataFormat(yesterday);
      let end = dataFormat(
        new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      );

      console.log("Fetch 시작 시간:", start, "끝 시간:", end);
      const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`/api/energy/gas?start=${start}&end=${end}&datetimeType=0`),
        fetch(`/api/energy/elec?start=${start}&end=${end}&datetimeType=0`),
        fetch(`/api/energy/water?start=${start}&end=${end}&datetimeType=0`),
      ]);

      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json(),
      ]);

      let nowtime = dataFormat(new Date()).slice(11,13);

    
      let yesterdayGasUsage = gasJson.datas[nowtime].usage;
      console.log("가스 어제 이 시간 데이터:", yesterdayGasUsage);

      let yesterdayElecUsage = elecJson.datas[nowtime].usage;
      console.log("전기 어제 이 시간 데이터:", yesterdayElecUsage);

      let yesterdayWaterUsage = waterJson.datas[nowtime].usage;
      console.log("수도 어제 이 시간 데이터:", yesterdayWaterUsage);


      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        const maxGasUsage = Math.max(
          ...gasJson.datas.map((item) => item.usage)
        );
        const maxElecUsage = Math.max(
          ...elecJson.datas.map((item) => item.usage)
        );
        const maxWaterUsage = Math.max(
          ...waterJson.datas.map((item) => item.usage)
        );

        const totalGasUsage = gasJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalElecUsage = elecJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalWaterUsage = waterJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );
        setYesterdayUsage({
          gas: Math.floor(totalGasUsage * 100) / 100000,
          elec: Math.floor(totalElecUsage * 100000) / 100000,
          water: Math.floor(totalWaterUsage * 100) / 100000,
          maxGas: maxGasUsage,
          maxElec: maxElecUsage,
          maxWater: maxWaterUsage,
          nowtimegas : yesterdayGasUsage,
          nowtimeelec : yesterdayElecUsage,
          nowtimewater : yesterdayWaterUsage,
        });
      } else {
        console.error(
          "Fetch 실패:",
          gasResponse.status,
          elecResponse.status,
          waterResponse.status
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const getHourlyUsageFecth = async () => {
    try {
      console.log("Fetch 시작");

      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let start = dataFormat(today);
      let end = dataFormat(now);
      
      console.log("Fetch 시작 시간:", start, "끝 시간:", end);
      const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`/api/energy/gas?start=${start}&end=${end}&datetimeType=0`),
        fetch(`/api/energy/elec?start=${start}&end=${end}&datetimeType=0`),
        fetch(`/api/energy/water?start=${start}&end=${end}&datetimeType=0`),
      ]);

      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json(),
      ]);

      
      let nowtime = dataFormat(new Date()).slice(11,13);

    
      let todayGasUsage = gasJson.datas[nowtime].usage;
      console.log("가스 오늘 이 시간 데이터:", todayGasUsage);

      let todayElecUsage = elecJson.datas[nowtime].usage;
      console.log("전기 오늘 이 시간 데이터:", todayElecUsage);

      let todayWaterUsage = waterJson.datas[nowtime].usage;
      console.log("수도 오늘 이 시간 데이터:", todayWaterUsage);


      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        // 모든 usage 합산
        const totalGasUsage = gasJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        // const totalElecUsage = elecJson.datas.reduce(
        //   (sum, item) => sum + item.usage,
        //   0
        // );

        let totalElecUsage = 252.42; // 임시 고정값

        console.log("전기 전체 사용량:", totalElecUsage);

        const totalWaterUsage = waterJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        setTodayUsage((prev) => ({
          ...prev,
          gas: Math.floor((prev.gas + totalGasUsage) * 10000) / 10000,
          elec: Math.floor((prev.elec + totalElecUsage) * 100) / 100,
          water: Math.floor((prev.water + totalWaterUsage) * 100000) / 100000,
          nowtimegas : todayGasUsage,
          nowtimeelec : todayElecUsage,
          nowtimewater : todayWaterUsage,
        }));
      } else {
        console.error(
          "Fetch 실패:",
          gasResponse.status,
          elecResponse.status,
          waterResponse.status
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const getLastMonthUsage = async () => {
    try {
      console.log("전월 사용량 Fetch 시작");

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      let start = dataFormat(lastMonth);
      let end = dataFormat(lastMonthEnd);

      console.log("전월 Fetch 시작 시간:", start, "끝 시간:", end);
      const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`/api/energy/gas?start=${start}&end=${end}&datetimeType=2`),
        fetch(`/api/energy/elec?start=${start}&end=${end}&datetimeType=2`),
        fetch(`/api/energy/water?start=${start}&end=${end}&datetimeType=2`),
      ]);

      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json(),
      ]);

     

      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        const maxGasUsage = Math.max(
          ...gasJson.datas.map((item) => item.usage)
        );
        const maxElecUsage = Math.max(
          ...elecJson.datas.map((item) => item.usage)
        );
        const maxWaterUsage = Math.max(
          ...waterJson.datas.map((item) => item.usage)
        );

        const totalGasUsage = gasJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalElecUsage = elecJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalWaterUsage = waterJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        console.log("전월 가스 사용량:", totalGasUsage);
        console.log("전월 전기 사용량:", totalElecUsage);
        console.log("전월 수도 사용량:", totalWaterUsage);

        setLastMonthUsage({
          gas: totalGasUsage,
          elec: totalElecUsage,
          water: totalWaterUsage,
          maxGas: maxGasUsage,
          maxElec: maxElecUsage,
          maxWater: maxWaterUsage,
        });
      } else {
        console.error(
          "전월 Fetch 실패:",
          gasResponse.status,
          elecResponse.status,
          waterResponse.status
        );
      }
    } catch (error) {
      console.error("전월 Fetch error:", error);
    }
  };

  const getMonthlyUsageFetch = async () => {
    try {
      console.log("금월 Fetch 시작");

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      thisMonth.setHours(0, 0, 0, 0);

      let start = dataFormat(thisMonth);
      let end = dataFormat(now);

      console.log("금월 Fetch 시작 시간:", start, "끝 시간:", end);
      const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`/api/energy/gas?start=${start}&end=${end}&datetimeType=2`),
        fetch(`/api/energy/elec?start=${start}&end=${end}&datetimeType=2`),
        fetch(`/api/energy/water?start=${start}&end=${end}&datetimeType=2`),
      ]);

      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json(),
      ]);

      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        const totalGasUsage = gasJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalElecUsage = elecJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalWaterUsage = waterJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        console.log("금월 전기 전체 사용량:", totalElecUsage);

        setMonthUsage((prev) => ({
          ...prev,
          gas: Math.floor((prev.gas + totalGasUsage) * 10000) / 10000,
          elec: Math.floor((prev.elec + totalElecUsage) * 10) / 10,
          water: Math.floor((prev.water + totalWaterUsage) * 100000) / 100000,
        }));
      } else {
        console.error(
          "금월 Fetch 실패:",
          gasResponse.status,
          elecResponse.status,
          waterResponse.status
        );
      }
    } catch (error) {
      console.error("금월 Fetch error:", error);
    }
  };

  // 빌딩 정보 조회 함수
  const fetchBuildingInfo = async () => {
    try {
      const response = await fetch("/api/buildings");
      if (response.ok) {
        const data = await response.json();
        console.log("빌딩 정보 API 응답:", data);
        console.log("totalArea 값:", data[0]?.totalArea);
        setBuildingInfo({
          totalArea: data[0]?.totalArea || 0,
        });
      } else {
        console.error("빌딩 정보 조회 실패:", response.status);
      }
    } catch (error) {
      console.error("빌딩 정보 조회 에러:", error);
    }
  };

  // 로그인된 사용자 정보 조회 함수
  const fetchUserInfo = async () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userObj = JSON.parse(user);
        console.log("로그인된 사용자 정보 조회", userObj);
        setAuthState({ isAuthenticated: true, user: userObj });
      } catch (error) {
        console.error("사용자 정보 파싱 실패:", error);
      }
    } else {
      console.log("[Auth] 로그인된 사용자가 없습니다.");
      setAuthState({ isAuthenticated: false, user: null });
    }
    return null;
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 로그인 됫을때 작동하는 useEffect
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    // 최초 접속 시 즉시 실행
    fetchWeatherNow();

    fetchBuildingInfo();
    getLastMonthlyBill();
    getBillStat();
    getMonthlyBill();
    getYesterdayUsage().then(() => {});
    getLastMonthUsage().then(() => {});
    getHourlyUsageFecth().then(() => { ElectFetch(); });
    getMonthlyUsageFetch().then(() => {});
  }, [auth.isAuthenticated]);

  const handleModelClick = (modelName) => {
    // top은 클릭해도 확대하지 않음
    if (modelName === "top") {
      return;
    }

    setActive({
      active: !active.active,
      model: active.model === modelName ? null : modelName,
    });
    setSelectedDevice(null); // 층 변경 시 기기 선택 해제
  };

 

  const handleDeviceClick = (device) => {
    console.log("🎯 handleDeviceClick 호출됨:", device);
    setSelectedDevice((prev) => {
      const newDevice = prev?.id === device.id ? null : device;
      console.log("📱 selectedDevice 변경:", prev, "→", newDevice);
      return newDevice;
    });
  };

  const handleCloseDeviceCard = () => {
    setSelectedDevice(null);
  };

  const handleDeviceControl = (device, isOn) => {
    // TODO: 실제 IOT 제어 API 호출
    console.log(`${device.name} 제어: ${isOn ? "ON" : "OFF"}`);

    // 임시로 알림 표시
    alert(`${device.name}을(를) ${isOn ? "켰습니다" : "껐습니다"}.`);

    // 카드 닫기
    setSelectedDevice(null);
  };

  // 🍪 전일 동시간 대비 증감률 계산 (금일 사용량)
  const todayComparisonRatio = useMemo(() => {
    const calculateRatio = (today, yesterday) => {
      if (!yesterday || yesterday === 0) return 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };

    return {
      gas: calculateRatio(todayUsage.nowtimegas, yesterdayUsage.nowtimegas),
      elec: calculateRatio(todayUsage.nowtimeelec, yesterdayUsage.nowtimeelec),
      water: calculateRatio(todayUsage.nowtimewater, yesterdayUsage.nowtimewater),
    };
  }, [
    todayUsage.nowtimegas,
    todayUsage.nowtimeelec,
    todayUsage.nowtimewater,
    yesterdayUsage.nowtimegas,
    yesterdayUsage.nowtimeelec,
    yesterdayUsage.nowtimewater,
  ]);

  // 🍪 전월 동시간 대비 증감률 계산 (금월 사용량)
  const monthComparisonRatio = useMemo(() => {
    const calculateRatio = (thisMonth, lastMonth) => {
      if (!lastMonth || lastMonth === 0) return 0;
      return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    };

    return {
      gas: calculateRatio(monthUsage.gas, lastMonthUsage.gas),
      elec: calculateRatio(monthUsage.elec, lastMonthUsage.elec),
      water: calculateRatio(monthUsage.water, lastMonthUsage.water),
    };
  }, [
    monthUsage.gas,
    monthUsage.elec,
    monthUsage.water,
    lastMonthUsage.gas,
    lastMonthUsage.elec,
    lastMonthUsage.water,
  ]);

  // 좌측 층 버튼 패널 접힘/펼침 상태
  const [railOpen, setRailOpen] = useState(() => {
    try {
      const s = localStorage.getItem("floor-rail-open");
      if (s != null) return s === "1";
    } catch {
      console.log("로컬스토리지 접근 불가");
    }
    return window.innerWidth > 900; // 데스크탑=열림, 모바일=닫힘
  });

  useEffect(() => {
    try {
      localStorage.setItem("floor-rail-open", railOpen ? "1" : "0");
    } catch {}
  }, [railOpen]);

  return (
    <>
      {!auth.isAuthenticated && <Login onLoginSuccess={fetchUserInfo} />}

      <Container>
        <GlobalStyle />


        <Canvas
          camera={{
            position: cameraSettings.defaultPosition,
            fov: cameraSettings.defaultFov,
            near: 0.1,
            far: 1000,
          }}
        >
          {auth.isAuthenticated && (
            <>
              {/* 🎥 카메라 컨트롤러 추가 */}
              <CameraController
                active={active}
                cameraSettings={cameraSettings}
              />
            </>
          )}

          {/* 조명 */}
          <ambientLight intensity={2.0} />
          <directionalLight position={[10, 10, 20]} intensity={1} />
          <pointLight position={[10, 10, 20]} intensity={5} distance={1} />

          {/* 3D 모델 - 로딩 중 fallback 표시 */}
          <Suspense fallback={null}>
            {modelsToShow.map((modelName) => (
              <Model
                key={modelName}
                model={modelName}
                onClick={
                  auth.isAuthenticated
                    ? () => handleModelClick(modelName)
                    : undefined
                }
                isSelected={auth.isAuthenticated ? active.active : undefined}
                onDeviceClick={
                  auth.isAuthenticated ? handleDeviceClick : undefined
                }
                selectedDevice={
                  auth.isAuthenticated ? selectedDevice : undefined
                }
                ishover={
                  
                  auth.isAuthenticated ? true : false
                }
              />
            ))}
          </Suspense>
          {auth.isAuthenticated ? (
            <>
              {/* 컨트롤 - 반응형 설정 적용 */}
              <OrbitControls
                target={cameraSettings.target}
                enableRotate={true}
                enableZoom={true}
                enablePan={true}
                enableDamping={true}
                dampingFactor={0.05}
                minDistance={cameraSettings.minDistance}
                maxDistance={cameraSettings.maxDistance}
              />
            </>
          ) : (
            <>
              <OrbitControls
                target={cameraSettings.target}
                enableZoom={false}
                enableRotate={false}
                enablePan={false}
                enableDamping={false}
                minDistance={cameraSettings.minDistance}
                maxDistance={cameraSettings.maxDistance}
              />
            </>
          )}
        </Canvas>

        <BrandClock />

        <Wing
          railOpen={railOpen} setRailOpen={setRailOpen}
          onClose={() => setRailOpen(false)}
          active={active}
          setActive={setActive}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          todayUsage={todayUsage}
          yesterdayUsage={yesterdayUsage}
          monthUsage={monthUsage}
          lastMonthUsage={lastMonthUsage}
          buildingInfo={buildingInfo}
          billInfo={billInfo}
          // 3개 추가
          todayComparisonRatio={todayComparisonRatio}
          monthComparisonRatio={monthComparisonRatio}
          AvgFee={AvgFee}
          weatherNow = {weatherNow}
        />
      </Container>
    </>
  );
}

export default App;
