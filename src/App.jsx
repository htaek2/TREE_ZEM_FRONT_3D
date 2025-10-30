import { Suspense, use, useEffect, useState, useMemo, useRef } from "react";
import "./App.css";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import styled from "styled-components";
import { CAMERA_CONFIG, MODEL_TO_FLOOR, MODELS } from "./constants";
import GlobalStyle from "./GlobalStyle";
import * as THREE from 'three';

import Login from "./components/Login";

// 🍪
import BrandClock from "./components/BrandClock";

import Wing from "./components/Wing";
import SceneContainer from "./three/SceneContainer";
import { SimpleMarkers } from "./components/SimpleMarkers";
import { floor } from "three/tsl";
import MarkerPanel from "./modal/MarkerPanel";

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
const getResponsiveCameraSettings = (isAuthenticated, active) => {
  const width = window.innerWidth;

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
      defaultPosition: [-60, 28, 22],
      // activePosition: active.model === 'f1' ? [-15, 80, 30] : active.model === 'f2' ? [-15, 150, 30] : active.model === 'f3' ? [-15, 140, 30] : active.model === 'f4' ? [-15, 210, 30] : [15, 5, 0],
      activePosition: [-15, 150, 30],
      defaultFov: 40,
      activeFov: 35,
      minDistance: 0,
      maxDistance: 65,
      target: [13, 5, -8],
    };
  }
};

function App() {
  const [auth, setAuthState] = useState({ isAuthenticated: false, user: null });
  const [active, setActive] = useState({ active: false, model: null });
  const modelsToShow = active.active ? [active.model] : MODELS;
  const [selectedDevice, setSelectedDevice] = useState(null);
  const cameraSettings = useMemo(
    () => getResponsiveCameraSettings(auth.isAuthenticated, active),
    [auth.isAuthenticated, active]
  );
  const onFloorButtonClick = useRef(null);
  /*세구 1022 11:00*/
  const [weatherNow, setWeatherNow] = useState({
    humidity: null,
    nowTemperature: null,
    weatherStatus: null,
    windSpeed: null,
  });

  const [todayUsage, setTodayUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
    nowtimegas: 0,
    nowtimeelec: 0,
    nowtimewater: 0,
  });

  const [yesterdayUsage, setYesterdayUsage] = useState({
    gas: 0,
    elec: 0,
    water: 0,
    maxGas: 0,
    maxElec: 0,
    maxWater: 0,
    nowtimegas: 0,
    nowtimeelec: 0,
    nowtimewater: 0,
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

  const [deviceInfo, setDeviceInfo] = useState([
    { floorNum: 1, devices: [] },
    { floorNum: 2, devices: [] },
    { floorNum: 3, devices: [] },
    { floorNum: 4, devices: [] },
  ]);

  const [makerInfo, setMakerInfo] = useState({
    markerCount : 0,
    markerInfo : []
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  const [selectedFloorMarkers, setSelectedFloorMarkers] = useState([]);

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
    national: 0,
    location: 0,
  });


  
  const handleResetView = () => {
  // OrbitControls target 초기화
  if (controlsRef.current) {
    const initialTarget = new THREE.Vector3(13, 5, -8);
    controlsRef.current.target.copy(initialTarget);
    controlsRef.current.update();
  }

  setActive({ active: false, model: null });
};

   const handleFloorSelect = (floorsArray) => {
    const markers = makerInfo.markerInfo.filter(marker =>
      floorsArray.includes(marker.floor)
    );

    console.log("선택된 층들:", floorsArray);
    console.log("선택된 층의 모든 마커들:", markers); // 계산된 최신 값 출력
    setSelectedFloorMarkers(prev => [...markers]);
  };


  
  const postSwitching = async (selectedMarker, selectedFloorMarkers) => {
    try {
      console.log("선택된 마커:", selectedMarker);
      const newStatus = !selectedMarker.status ? 1 : 0;

      // selectedFloorMarkers가 존재하면 Promise.all로 여러 기기 상태 변경
      if (selectedFloorMarkers && selectedFloorMarkers.length > 0) {
        console.log("선택된 층의 마커들:", selectedFloorMarkers);

        const responses = await Promise.all(
          selectedFloorMarkers.map(async (marker) => {
            const response = await fetch(`/api/device/${marker.deviceId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: newStatus
              })
            });

            if (!response.ok) {
              throw new Error(`Network response was not ok for device ${marker.deviceId}`);
            }

            // 서버 응답 파싱
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await response.json();
            }
            return await response.text();
          })
        );

        console.log('층 전체 기기 상태 변경 성공:', responses);

        // state 업데이트: 서버 응답 데이터로 상태 변경
        setMakerInfo(prev => {
          const updatedMarkers = prev.markerInfo.map(marker => {
            // 서버 응답에서 해당 deviceId 찾기
            const serverData = responses.find(res =>
              res.deviceId === marker.deviceId || res.id === marker.deviceId
            );

            if (serverData) {
              return {
                ...marker,
                status: serverData.status // 서버가 반환한 실제 상태 사용
              };
            }
            return marker;
          });
          return {
            ...prev,
            markerInfo: updatedMarkers
          };
        });

        // selectedMarker도 서버 응답으로 업데이트
        const selectedMarkerData = responses.find(res =>
          res.deviceId === selectedMarker.deviceId || res.id === selectedMarker.deviceId
        );

        if (selectedMarkerData) {
          setSelectedMarker(prev => ({
            ...prev,
            status: selectedMarkerData.status
          }));
        }

        return responses;
      } else {
        // 단일 기기 상태 변경
        const response = await fetch(`/api/device/${selectedMarker.deviceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // 응답이 JSON인지 텍스트인지 확인
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        console.log('단일 기기 상태 변경 성공:', data);

        // state 업데이트: 서버 응답 데이터로 상태 변경
        const serverStatus = typeof data === 'object' && data.status !== undefined
          ? data.status
          : newStatus; // 서버가 status를 반환하지 않으면 fallback

        setMakerInfo(prev => {
          const updatedMarkers = prev.markerInfo.map(marker => {
            if (marker.deviceId === selectedMarker.deviceId) {
              return {
                ...marker,
                status: serverStatus // 서버 응답 사용
              };
            }
            return marker;
          });
          return {
            ...prev,
            markerInfo: updatedMarkers
          };
        });

        // selectedMarker도 서버 응답으로 업데이트
        setSelectedMarker(prev => ({
          ...prev,
          status: serverStatus
        }));

        return data;
      }
    } catch (error) {
      console.error('실패:', error);
      throw error;
    }
  };



  const getDevices = () => {
    const eventSource = new EventSource(`/api/energy/sse/devices`);

    eventSource.onopen = function () {
      console.log("✅ 장치 SSE 연결 성공");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 새로운 deviceInfo 객체 생성
        const newDeviceInfo = [
          { floorNum: 1, devices: [] },
          { floorNum: 2, devices: [] },
          { floorNum: 3, devices: [] },
          { floorNum: 4, devices: [] },
        ];

        // 층별로 장비 분류
        data.forEach((device) => {
          const floorIndex = parseInt(device.floorNum) - 1;
          if (floorIndex >= 0 && floorIndex < 4) {
            newDeviceInfo[floorIndex].devices.push(device);
          }
        });

        const markerCount = data.length;
        let markerInfo = [];

        data.forEach((device) => {
          markerInfo.push({
            deviceId: device.deviceId,
            deviceType: device.deviceType,
            deviceName: device.deviceName,
            floor: device.floorNum,
            installedTime: device.installedTime,
            position: new THREE.Vector3(device.x, device.y, device.z),
            status: device.status
          });
        });

        // state 업데이트
        setMakerInfo({
          markerCount: markerCount,
          markerInfo: markerInfo,
        });

        setDeviceInfo(newDeviceInfo);
      } catch (error) {
        console.error("❌ 장치 데이터 파싱 오류:", error);
      }
    };

    eventSource.onerror = function (err) {
      console.error("❌ 장치 SSE 연결 오류:", err);
      eventSource.close();
    };
  };



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
    // sse 연결 - 프록시를 통해 상대 경로 사용
    const eventSource = new EventSource("/api/energy/sse/all");

    // SSE 연결 성공
    eventSource.onopen = function () {
    };

    // 데이터 수신 시
    eventSource.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);

        // console.log("data!!!!!!!!!",data);

        // 실시간 요금 업데이트
        setBillInfo((prev) => ({
          ...prev,
          electricThisMonth: prev.electricThisMonth + (data.elecPrice < 0 ? 0 : data.elecPrice),
          gasThisMonth: prev.gasThisMonth + (data.gasPrice < 0 ? 0 : data.gasPrice),
          waterThisMonth: prev.waterThisMonth + (data.waterPrice < 0 ? 0 : data.waterPrice),
        }));
        const waterUsages = data.floors.map(
          (floor) => floor.waterUsage.datas[0].usage
        );

        let totalWater = waterUsages.reduce((sum, usage) => sum + usage, 0);


        if (totalWater < 0) {
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

        if (data.floors.length === 0) {
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


        if (totalFloorElecUsage < 0) {
          totalFloorElecUsage = 0;
        }

        if (data.gasUsage.datas[0].usage < 0) {
          data.gasUsage.datas[0].usage = 0;
        }

        let nowGasUsage = data.gasUsage.datas[0].usage;

        if (nowGasUsage < 0) {
          nowGasUsage = 0;
        }
      
        setTodayUsage((prev) => ({
          ...prev,
          water: Math.floor((prev.water + totalWater) * 100000) / 100000,
          gas: Math.floor((prev.gas + nowGasUsage) * 10000) / 10000,
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
    fetch("/api/weather/now") // GET 요청 (기본값)
      .then((response) => {
        // 응답 헤더를 확인하거나, 응답이 성공적이지 않다면 여기서 처리할 수 있습니다.
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // 응답 본문을 JSON으로 파싱
      })
      .then((data) => {
        setWeatherNow((prev) => {
          const toNumber = (v) => {
            if (v === null || v === undefined) return null;
            if (typeof v === "string") {
              const m = v.match(/-?\d+(\.\d+)?/);
              return m ? Number(m[0]) : null;
            }
            return Number.isFinite(v) ? v : null;
          };

          // 값 정규화
          let temp = toNumber(data?.nowTemperature);
          // Kelvin → Celsius 추정 변환
          if (temp != null && temp > 170 && temp < 400) temp = temp - 273.15;

          let hum = toNumber(data?.humidity);
          // 0~1로 오는 습도라면 %로 변환
          if (hum != null && hum <= 1) hum = hum * 100;

          return {
            ...prev,
            nowTemperature: temp,
            humidity: hum,
            windSpeed: toNumber(data?.windSpeed),
            weatherStatus: data?.weatherStatus ?? data?.weather ?? null,
          };
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error); // 오류 처리
        setWeatherNow((prev) => prev); //세구1022 11:00 실패시 재시도
      });
  };

  const getBillStat = async () => {
    try {
      fetch(`/api/bill/stat`)
        .then((response) => response.json())
        .then((data) => {

          // data.avgAll이 존재하고 배열인지 확인
          if (
            data?.avgAll &&
            Array.isArray(data.avgAll) &&
            data.avgAll.length > 0
          ) {
            const total = data.avgAll.reduce((sum, item) => {
              const amount = Number(item) || 0;
              return sum + amount;
            }, 0);
            const average = total / data.avgAll.length;

            setAvgFee((prev) => ({
              ...prev,
              national: Math.trunc(average),
            }));
          } else {
            console.warn("avgAll 데이터가 없거나 비어있습니다:", data);
          }

          if (
            data?.avgLocal &&
            Array.isArray(data.avgLocal) &&
            data.avgLocal.length > 0
          ) {
            const totalLocal = data.avgLocal.reduce((sum, item) => {
              const amount = Number(item) || 0;
              return sum + amount;
            }, 0);
            const averageLocal = totalLocal / data.avgLocal.length;
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
      let now = new Date();
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );
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
              setBillInfo((prev) => ({
                ...prev,
                electricLastMonth: Math.trunc(totalElecUsage),
              }));
            } else if (energy.energyType === "GAS") {
              const totalGasUsage = energy.datas.reduce(
                (sum, el) => sum + el.usage,
                0
              );
              setBillInfo((prev) => ({
                ...prev,
                gasLastMonth: Math.trunc(totalGasUsage),
              }));
            } else if (energy.energyType === "WATER") {
              const totalWaterUsage = energy.datas.reduce(
                (sum, el) => sum + el.usage,
                0
              );
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
        .then((response) => response.json())
        .then((data) =>
          data.map((energy) => {
            if (energy.energyType === "ELECTRICITY") {
              const totalElecUsage = energy.datas.reduce(
                (sum, el) => sum + Math.max(el.usage, 0),
                0
              );
            } else if (energy.energyType === "GAS") {
              const totalGasUsage = energy.datas.reduce(
                (sum, el) => sum + Math.max(el.usage, 0),
                0
              );
            } else if (energy.energyType === "WATER") {
              const totalWaterUsage = energy.datas.reduce(
                (sum, el) => sum + Math.max(el.usage, 0),
                0
              );
            }
            setBillInfo((prev) => ({
              ...prev,
              electricThisMonth:
                energy.energyType === "ELECTRICITY"
                  ? Math.trunc(
                      energy.datas.reduce((sum, el) => sum + Math.max(el.usage, 0),0)
                    )
                  : prev.electricThisMonth,
              gasThisMonth:
                energy.energyType === "GAS"
                  ? Math.trunc(
                      energy.datas.reduce((sum, el) => sum +Math.max(el.usage, 0),0)
                    )
                  : prev.gasThisMonth,
              waterThisMonth:
                energy.energyType === "WATER"
                  ? Math.trunc(
                      energy.datas.reduce((sum, el) => sum + Math.max(el.usage, 0),0)
                    )
                  : prev.waterThisMonth,
            }));

            return null;
          })
        )
        .catch((error) => console.error("Error:", error));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  const getYesterdayUsage = async () => {
    try {

      let now = new Date();
      let yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      let start = dataFormat(yesterday);
      let end = dataFormat(
        new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      );

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
  

      yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      let nowtime = dataFormat(yesterday).slice(0, 13);

      // let yesterdayGasUsage = gasJson.datas[nowtime].usage;
      let yesterdayGasUsage =
        gasJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

      // let yesterdayElecUsage = elecJson.datas[nowtime].usage;
      let yesterdayElecUsage =
        elecJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

      // let yesterdayWaterUsage = waterJson.datas[nowtime].usage;
      let yesterdayWaterUsage =
        waterJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

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
          elec: Math.floor(totalElecUsage * 100000) / 100000,
          gas: Math.floor(totalGasUsage * 100) / 100000,
          water: Math.floor(totalWaterUsage * 100) / 100000,
          maxGas: maxGasUsage,
          maxElec: maxElecUsage,
          maxWater: maxWaterUsage,
          nowtimegas: yesterdayGasUsage,
          nowtimeelec: yesterdayElecUsage,
          nowtimewater: yesterdayWaterUsage,
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

      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let start = dataFormat(today);
      let end = dataFormat(now);

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


      let nowtime = dataFormat(now).slice(0, 13);
    

      // let todayGasUsage = gasJson.datas[nowtime].usage;
      let todayGasUsage =
        gasJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

      // let todayElecUsage = elecJson.datas[nowtime].usage;
      let todayElecUsage =
        elecJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

      // let todayWaterUsage = waterJson.datas[nowtime].usage;
      let todayWaterUsage =
        waterJson.datas.find((item) => item.timestamp.startsWith(nowtime))
          ?.usage ?? 0;

      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        // 모든 usage 합산
        const totalGasUsage = gasJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        const totalElecUsage = elecJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        // let totalElecUsage = 252.42; // 임시 고정값


        const totalWaterUsage = waterJson.datas.reduce(
          (sum, item) => sum + item.usage,
          0
        );

        setTodayUsage((prev) => ({
          ...prev,
          gas: Math.floor((prev.gas + totalGasUsage) * 10000) / 10000,
          elec: Math.floor((prev.elec + totalElecUsage) * 100) / 100,
          water: Math.floor((prev.water + totalWaterUsage) * 100000) / 100000,
          nowtimegas: todayGasUsage,
          nowtimeelec: todayElecUsage,
          nowtimewater: todayWaterUsage,
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

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );

      let start = dataFormat(lastMonth);
      let end = dataFormat(lastMonthEnd);

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

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      thisMonth.setHours(0, 0, 0, 0);

      let start = dataFormat(thisMonth);
      let end = dataFormat(now);

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

    // iot 장비 층별로 제어하기
  const FloorsButtonClick = async (floorNum) => {
    console.log("층 선택!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",floorNum);
  }

  // 로그인된 사용자 정보 조회 함수
  const fetchUserInfo = async () => {
    const user = sessionStorage.getItem("user");
    if (user) {
      try {
        const userObj = JSON.parse(user);
        setAuthState({ isAuthenticated: true, user: userObj });
      } catch (error) {
        console.error("사용자 정보 파싱 실패:", error);
      }
    } else {
      setAuthState({ isAuthenticated: false, user: null });
    }
    return null;
  };



  useEffect(() => {
    fetchUserInfo();
  }, []);

  // ㅈ인 됫을때 작동하는 useEffect
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    // 최초 접속 시 즉시 실행
    getDevices();

    fetchWeatherNow();

    fetchBuildingInfo();
    getLastMonthlyBill();
    getBillStat();
    getMonthlyBill();
    getYesterdayUsage().then(() => {});
    getLastMonthUsage().then(() => {});
    getHourlyUsageFecth().then(() => {
      ElectFetch();
    });
    getMonthlyUsageFetch().then(() => {});
  }, [auth.isAuthenticated]);

  // 🍪 전일 동시간 대비 증감률 계산 (금일 사용량)
  const todayComparisonRatio = useMemo(() => {
    const calculateRatio = (today, yesterday) => {
      if (!yesterday || yesterday === 0) return 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };

    return {
      gas: calculateRatio(todayUsage.nowtimegas, yesterdayUsage.nowtimegas),
      elec: calculateRatio(todayUsage.nowtimeelec, yesterdayUsage.nowtimeelec),
      water: calculateRatio(
        todayUsage.nowtimewater,
        yesterdayUsage.nowtimewater
      ),
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
      const s = sessionStorage.getItem("floor-rail-open");
      if (s != null) return s === "1";
    } catch {
      console.log("로컬스토리지 접근 불가");
    }
    return window.innerWidth > 900; // 데스크탑=열림, 모바일=닫힘
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("floor-rail-open", railOpen ? "1" : "0");
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
        
       
          <SceneContainer
            active={active}
            cameraSettings={cameraSettings}
            isAuthenticated={auth.isAuthenticated}
            modelsToShow={modelsToShow}
            selectedDevice={selectedDevice}
            setSelectedDevice={setSelectedDevice}
            setActive={setActive}
            onFloorButtonClick={onFloorButtonClick}
          />


          <SimpleMarkers markerInfo={makerInfo.markerInfo} selectFloor={active.model} selectedMarker={selectedMarker} setSelectedMarker={setSelectedMarker} />
        </Canvas>

        <BrandClock />

        <Wing
          railOpen={railOpen}
          setRailOpen={setRailOpen}
          onClose={() => setRailOpen(false)}
          active={active}
          setActive={setActive}
          selectedDevice={selectedDevice} 
          setSelectedDevice={setSelectedDevice}
          onFloorButtonClick={onFloorButtonClick}
          todayUsage={todayUsage}
          yesterdayUsage={yesterdayUsage}
          monthUsage={monthUsage}
          lastMonthUsage={lastMonthUsage}
          buildingInfo={buildingInfo}
          billInfo={billInfo}
          onResetView={handleResetView}
          // 3개 추가
          todayComparisonRatio={todayComparisonRatio}
          monthComparisonRatio={monthComparisonRatio}
          AvgFee={AvgFee}
          weatherNow={weatherNow}
        />

        {selectedMarker && (
          <MarkerPanel
            floors={floors}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
            postSwitching={postSwitching}
            FloorsButtonClick={FloorsButtonClick}
            onFloorSelect={handleFloorSelect}
            selectedFloorMarkers={selectedFloorMarkers}
            setSelectedFloorMarkers={setSelectedFloorMarkers}
          />
      )}
      </Container>  
    </>
  );
}

export default App;
