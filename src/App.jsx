import { Suspense, use, useEffect, useState } from "react";
import "./App.css";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import Model from "./Model";
import { OrbitControls } from "@react-three/drei";
import styled from "styled-components";
import { CAMERA_CONFIG, MODEL_TO_FLOOR, MODELS } from "./constants";
import GlobalStyle from "./GlobalStyle";

import CameraController from "./components/CameraController";
import DeviceInfoCard from "./components/DeviceInfoCard";
import Login from "./components/Login";

// 🍪
import BrandClock from "./components/BrandClock";
import Wing from "./components/Wing";
import HiddenToggle from "./components/HiddenToggle"; 
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
  console.log(isAuthenticated ? "로그인된 사용자" : "비로그인 사용자", "화면 너비:", width);
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
  
  }


function App() {
  const [auth, setAuthState] = useState({ isAuthenticated: false, user: null });
  const [active, setActive] = useState({ active: false, model: null });
  const modelsToShow = active.active ? [active.model] : MODELS;
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [computers, setComputer] = useState([]);
  const [cameraSettings, setCameraSettings] = useState(
    getResponsiveCameraSettings(auth.isAuthenticated)
  );
  const [gasUsage, setGasUsage] = useState({totalUsage: 0, datas: [{timestamp: '', usage: 0}]});
  const [elecUsage, setElecUsage] = useState({totalUsage: 0, datas: [{timestamp: '', usage: 0}]});
  const [waterUsage, setWaterUsage] = useState({totalUsage: 0, datas: {usage: 0}});

  const [floors, setFloors] = useState([
    {waterUsage : 0, devices: []},{waterUsage : 0, devices: []},{waterUsage : 0, devices: []},{waterUsage : 0, devices: []}
  ]);

  const dataFormat = (data) => {
     let month = data.getMonth() + 1;
        let day = data.getDate();
        let hour = data.getHours();
        let minute = data.getMinutes();
        let second = data.getSeconds();

        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        hour = hour >= 10 ? hour : '0' + hour;
        minute = minute >= 10 ? minute : '0' + minute;
        second = second >= 10 ? second : '0' + second;

        return data.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  }

  const ElectFetch = () => {
      console.log("SSE 연결 시작...");
      // sse 연결 - 프록시를 통해 상대 경로 사용
      const eventSource = new EventSource("/api/energy/sse/all");

      // SSE 연결 성공
      eventSource.onopen = function() {
        console.log("✅ SSE 연결 성공");
      };

      // 데이터 수신 시
      eventSource.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          
          console.log("수도 사용량:", data.floors.map(floor => floor.waterUsage.datas[0].usage));

          console.log("가스 데이터:", data.gasUsage.datas[0].usage);
        
          console.log("전력 데이터:", data.florrs.map(floor => floor));
          

        //   // SSE로 받은 usage를 기존 totalUsage에 누적
        //   setGasUsage(prevGasUsage => {
        //     const newUsage = data.gasUsage.datas.reduce((sum, item) => sum + item.usage, 0);
        //     const newTotalUsage = prevGasUsage.totalUsage + newUsage;
            
        //     console.log("newTotalUsage:", newTotalUsage);
        //     console.log(`SSE 가스 누적: ${Math.floor(prevGasUsage.totalUsage * 10000) / 10000} + ${Math.floor(newUsage * 10000) / 10000} = ${Math.floor(newTotalUsage * 10000) / 10000}`);

        //     return {
        //       // 4자리수까지만 저장
        //       totalUsage: Math.floor(newTotalUsage * 10000) / 10000, 
        //       datas: [...prevGasUsage.datas, ...data.gasUsage.datas]
        //     };
        //   });
          
        //   setFloors([
        //     floors[0].devices = data.floors[0].devices,
        //     floors[1].devices = data.floors[1].devices,
        //     floors[2].devices = data.floors[2].devices,
        //     floors[3].devices = data.floors[3].devices,
        //     floors[0].waterUsage = data.floors[0].waterUsage,
        //     floors[1].waterUsage = data.floors[1].waterUsage,
        //     floors[2].waterUsage = data.floors[2].waterUsage,
        //     floors[3].waterUsage = data.floors[3].waterUsage
        //   ])

        //   // 모든 층의 물 사용량 합산
        //   const totalWaterUsage = floors.reduce((sum, floor, index) => {
        //     console.log(`${index+1}층 물 사용량:`, floor.waterUsage);
        //     return sum + (floor.waterUsage?.datas?.[0]?.usage || 0);
        //   }, 0);

        //   // 객체 형태로 상태 업데이트
        //   setWaterUsage(prev => ({
        //     ...prev,
        //     totalUsage: totalWaterUsage
        //   }));
          
          
        // console.log("업데이트된 층 데이터:", floors);

        } catch (error) {
          console.log("텍스트 데이터:", event.data);
        }
      };

      // 오류 발생 시
      eventSource.onerror = function(err) {
        console.error("❌ SSE 연결 오류:", err);
        eventSource.close();
      };
    }



  const getHourlyUsageFecth = async () => {
    try {
      console.log('Fetch 시작');

      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      let start = dataFormat(today);
      let end = dataFormat(now);

      
      console.log('Fetch 시작 시간:', start, '끝 시간:', end);
       const [gasResponse, elecResponse, waterResponse] = await Promise.all([
        fetch(`api/energy/gas?start=${start}&end=${end}&datetimeType=0`),
        fetch(`api/energy/elec?start=${start}&end=${end}&datetimeType=0`),
        fetch(`api/energy/water?start=${start}&end=${end}&datetimeType=0`)
      ]);
    
      const [gasJson, elecJson, waterJson] = await Promise.all([
        gasResponse.json(),
        elecResponse.json(),
        waterResponse.json()
      ]);

      if (gasResponse.ok && elecResponse.ok && waterResponse.ok) {
        // 모든 usage 합산
        const totalGasUsage = gasJson.datas.reduce((sum, item) => sum + item.usage, 0);

        setGasUsage({
          totalUsage: Math.floor(totalGasUsage * 10000) / 10000,
          datas: gasJson.datas
        });


        

        const totalElecUsage = elecJson.datas.reduce((sum, item) => sum + item.usage, 0);
     

        setElecUsage({
          totalUsage: Math.floor(totalElecUsage * 10) / 10,
          datas: elecJson.datas
        });
        
       

        const totalWaterUsage = waterJson.datas.reduce((sum,item) => sum + item.usage, 0);

        setWaterUsage({
          totalUsage: Math.floor(totalWaterUsage * 10000) / 10000,
          datas: waterJson.datas
        });



      } else {
        console.error('Fetch 실패:', gasResponse.status, elecResponse.status, waterResponse.status);
      }
    } catch (error) {
      console.error('Fetch error:', error);
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
    if(!auth.isAuthenticated) return;

    // 최초 접속 시 즉시 실행
    getHourlyUsageFecth().then(() => {
      ElectFetch();
    });

    // // 1시간마다 반복 실행
    // const interval = setInterval(() => {
    //   getHourlyUsage().then(() => {
    //     ElectFetch();
    //   });
    // }, 3600000);

    // return () => clearInterval(interval);
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

  const handleModelButtonClick = (modelName) => {
    if (modelName === "top") {
      return;
    }

    setActive({
      active: true,
      model: modelName,
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


  // 좌측 층 버튼 패널 접힘/펼침 상태
  const [railOpen, setRailOpen] = useState(() => {
    try {
      const s = localStorage.getItem("floor-rail-open");
      if (s != null) return s === "1";
    } catch {}
    return window.innerWidth > 900; // 데스크탑=열림, 모바일=닫힘
  });

  useEffect(() => {
    try { localStorage.setItem("floor-rail-open", railOpen ? "1" : "0"); } catch {}

  }, [railOpen]);
  




  return (
    <>
      {!auth.isAuthenticated && <Login onLoginSuccess={fetchUserInfo} />}
    
    <Container>
      <GlobalStyle />

      <HiddenToggle railOpen={railOpen} setRailOpen={setRailOpen} />


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
            <CameraController active={active} cameraSettings={cameraSettings} />
          </>
        )}

        {/* 조명 */}
        <ambientLight intensity={1.5} />
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
              selectedDevice={auth.isAuthenticated ? selectedDevice : undefined}
              ishover={auth.isAuthenticated ? true : false}
            />
          ))}
        </Suspense>
        {auth.isAuthenticated ?  (
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

      <Wing railOpen={railOpen} onClose={() => setRailOpen(false)} gasUsage={gasUsage.totalUsage} elecUsage={elecUsage.totalUsage} waterUsage={waterUsage.totalUsage} active={active} setActive={setActive} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} />

    </Container>
    </>

  );
}

export default App;
