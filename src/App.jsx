import { Suspense, useEffect, useState } from "react";
import "./App.css";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import Model from "./Model";
import { OrbitControls } from "@react-three/drei";
import styled from "styled-components";
import { CAMERA_CONFIG, MODEL_TO_FLOOR, MODELS } from "./constants";

import CameraController from "./components/CameraController";
import DeviceInfoCard from "./components/DeviceInfoCard";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    left: 10px;
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
const getResponsiveCameraSettings = () => {
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
  // 태블릿 (768px ~ 1024px)
  else if (width <= 1024) {
    return {
      defaultPosition: [-60, 32, 22],
      activePosition: [-15, 80, 30],
      defaultFov: 60,
      activeFov: 60,
      minDistance: 35,
      maxDistance: 55,
      target: [13, 9, -8],
    };
  }
  // 데스크톱 (1024px 이상)
  else {
    return {
      defaultPosition: [-65, 35, 25],
      activePosition: CAMERA_CONFIG.DEFAULT_POSITION,
      defaultFov: CAMERA_CONFIG.DEFAULT_FOV,
      activeFov: CAMERA_CONFIG.ACTIVE_FOV,
      minDistance: 20,
      maxDistance: 45,
      target: [13, 5, -8],
    };
  }
};

function App() {
  const [active, setActive] = useState({ active: false, model: null });
  const modelsToShow = active.active ? [active.model] : MODELS;
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [cameraSettings, setCameraSettings] = useState(
    getResponsiveCameraSettings()
  );

  // 🔄 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const newSettings = getResponsiveCameraSettings();
      setCameraSettings(newSettings);
      console.log(
        "화면 크기 변경:",
        window.innerWidth,
        "x",
        window.innerHeight
      );
      console.log("새 카메라 설정:", newSettings);
    };

    window.addEventListener("resize", handleResize);
    console.log("초기 화면 크기:", window.innerWidth, "x", window.innerHeight);

    return () => window.removeEventListener("resize", handleResize);
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

  useEffect(() => {
    console.log("active 변경:", active);
  }, [active]);

  useEffect(() => {
    console.log("selectedDevice 변경:", selectedDevice);
  }, [selectedDevice]);

  return (
    <Container>
      <Canvas
        camera={{
          position: cameraSettings.defaultPosition,
          fov: cameraSettings.defaultFov,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* 🎥 카메라 컨트롤러 추가 */}
        <CameraController active={active} cameraSettings={cameraSettings} />

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
              onClick={() => handleModelClick(modelName)}
              isSelected={active.active}
              onDeviceClick={handleDeviceClick}
              selectedDevice={selectedDevice}
            />
          ))}
        </Suspense>

        {/* 컨트롤 - 반응형 설정 적용 */}
        <OrbitControls
          target={cameraSettings.target}
          enableRotate={false}
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={cameraSettings.minDistance}
          maxDistance={cameraSettings.maxDistance}
        />
      </Canvas>

      {/* 헤더 박스 */}
      <HeaderBox>
        <HeaderIcon src="public/Icon/header_title_logo.svg" alt="토리 빌딩" />
        <HeaderText>
          {active.active
            ? `토리 빌딩 - ${MODEL_TO_FLOOR[active.model] + 1}층`
            : "토리 빌딩"}
        </HeaderText>
      </HeaderBox>

      {/* 층 버튼 */}
      <FloorButtons>
        <FloorButton onClick={() => setActive({ active: false, model: null })}>
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
    </Container>
  );
}

export default App;
