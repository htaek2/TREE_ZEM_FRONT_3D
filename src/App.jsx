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

// 🏢 헤더 박스 스타일
const HeaderBox = styled.div`
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translate(-50%, -120%);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  background: linear-gradient(
    to right,
    rgba(45, 45, 45, 0) 0%,
    rgba(45, 45, 45, 0.95) 20%,
    rgba(121, 121, 121, 0.95) 80%,
    rgba(174, 171, 171, 0) 100%
  );
  color: white;
  padding: 6px 80px;
  border-radius: 8px;

  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;

  box-shadow: none;

  /* 반응형 스타일 */
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 16px;
    top: 8%;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const HeaderIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
  }
`;

const HeaderText = styled.span`
  white-space: nowrap;
`;

// 🏢 층 버튼 컨테이너
const FloorButtons = styled.div`
  position: absolute;
  /* 열림이면 패널 옆, 닫힘이면 토글 옆 */
  left: ${({ $open }) =>
    $open
      ? "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap) + var(--wing-width) + var(--panel-gap))"
      : "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap))"};
  z-index: 10;
  top: 50%;
  width: var(--rail-width);
  transform: translateY(-50%);
  transition: left 340ms cubic-bezier(0.22,0.61,0.36,1);

  will-change: transform, opacity;
  pointer-events: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;       /* 버튼을 열 폭에 맞춰 꽉 차게 */

  @media (max-width: 768px) {
    left: ${({ $open }) =>
      $open
        ? "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap) + var(--wing-width) + var(--panel-gap))"
        : "calc(var(--edge-left) + var(--toggle-width) + var(--toggle-gap))"};
    gap: 6px;
  }
`;

// 🔘 층 버튼
const FloorButton = styled.button`
  padding: 14px 12px;
  background-color: rgba(45, 45, 45, 0.85);
  color: white;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateX(4px);
    background-color: rgba(60, 60, 60, 0.95);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background-color: rgba(100, 100, 100, 0.95);
    border-color: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
    transform: translateX(8px);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

// 🔄 리셋 버튼
const ResetButton = styled.button`
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    right: 10px;
    bottom: 10px;
    padding: 12px 20px;
    font-size: 13px;
  }
`;

// 🎯 반응형 카메라 설정 함수
const getResponsiveCameraSettings = (isAuthenticated) => {
  const width = window.innerWidth;
  console.log(isAuthenticated ? "로그인된 사용자" : "비로그인 사용자", "화면 너비:", width);
  // 모바일 (768px 미만)
  if (width < 768 && !isAuthenticated) {
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
  else if (width >= 768 && !isAuthenticated) {
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

  const [cameraSettings, setCameraSettings] = useState(
    getResponsiveCameraSettings(auth.isAuthenticated)
  );

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

  const ElectFetch = () => {
    console.log("api 요청!!!");
    fetch('/api/energy/sse/all')
  .then(response => {
    // 응답이 성공적인지 확인합니다.
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // 응답 본문을 JSON으로 파싱합니다.
  })
  .then(data => {
    console.log(data); // 파싱된 데이터를 출력합니다.
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
  }



  useEffect(() => {
   
     fetchUserInfo();
  }, []);
  
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

      <Wing railOpen={railOpen} onC />




      {auth.isAuthenticated && (
        <>
          {/* 헤더 박스 */}
          <HeaderBox>
            <HeaderIcon
              src="public/Icon/header_title_logo.svg"
              alt="토리 빌딩"
            />
            <HeaderText>
              {active.active
                ? `토리 빌딩 - ${MODEL_TO_FLOOR[active.model] + 1}층`
                : "토리 빌딩"}
            </HeaderText>
          </HeaderBox>

          {/* 층 버튼 */}
          <FloorButtons>
            <FloorButton $open={railOpen} className="floor-rail"
              onClick={() => setActive({ active: false, model: null })}
            >
              <img src="public/Icon/Home_logo.svg" alt="전체보기" width={24} />
            </FloorButton>
            {MODELS.filter((model) => model !== "top").map((modelName) => (
              <FloorButton
                key={modelName}
                onClick={() => handleModelButtonClick(modelName)}
                className={active.model === modelName ? "active" : ""}
              >
                {MODEL_TO_FLOOR[modelName] + 1}F
              </FloorButton>
            ))}
          </FloorButtons>

          {/* 기기 정보 카드 */}
          {selectedDevice && (
            <DeviceInfoCard
              device={selectedDevice}
              onClose={handleCloseDeviceCard}
              onControl={handleDeviceControl}
            />
          )}
        </>
      )}
      
    </Container>
    </>

  );
}

export default App;
