import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import Model from "./Model";
import CameraController from "./CameraController";
import * as constants from "../constants";
import BackgroundManager from "./BackgroundManager";
import * as THREE from "three";
import { nodeData } from "../data/nodeInfo";
import { SortUtils } from "three/examples/jsm/Addons.js";

export default function SceneContainer({
  isAuthenticated,
  active,
  cameraSettings,
  modelsToShow,
  selectedDevice,
  setSelectedDevice,
  setActive,
  onFloorButtonClick,
}) {
  const controlsRef = useRef();

  const handleModelClick = (e, modelName) => {
    // top은 클릭해도 확대하지 않음
    if (modelName === "top") {
      return;
    }

    // OrbitControls 타겟을 해당 층 위치로 변경
    if (controlsRef.current && constants.FLOOR_HEIGHTS[modelName] !== undefined) {
      const targetY = constants.FLOOR_HEIGHTS[modelName];
      controlsRef.current.target.copy(new THREE.Vector3(0, targetY, 0));
      controlsRef.current.update();
    }

    if (!active.active) {
      setActive({
        active: !active.active,
        model: active.model === modelName ? null : modelName,
      });
    }

    // 층 안에서 클릭 동작 구현
    console.log(e.point.x, e.point.y, e.point.z);

    setSelectedDevice(null); // 층 변경 시 기기 선택 해제
  };

  // FloorButton 클릭 시 호출되는 함수
  const handleFloorButtonClick = (modelName) => {
    if (modelName === "top") return;

    // OrbitControls 타겟을 해당 층 위치로 변경
    if (controlsRef.current && constants.FLOOR_HEIGHTS[modelName] !== undefined) {
      const targetY = constants.FLOOR_HEIGHTS[modelName];
      controlsRef.current.target.copy(new THREE.Vector3(0, targetY, 0));
      controlsRef.current.update();
    }

    setActive({ active: true, model: modelName });
    setSelectedDevice(null);
  };

  // onFloorButtonClick prop으로 함수 전달
  useEffect(() => {
    if (onFloorButtonClick) {
      onFloorButtonClick.current = handleFloorButtonClick;
    }
  }, [onFloorButtonClick]);

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

  return (
    <>
      <BackgroundManager />
      {isAuthenticated && (
        <CameraController active={active} cameraSettings={cameraSettings} />
      )}

      {/* 조명 */}
      <ambientLight intensity={2.0} />
      <directionalLight position={[10, 10, 20]} intensity={1} />
      <pointLight position={[10, 10, 20]} intensity={5} distance={1} />

      {/* 3D 모델 - 로딩 중 fallback 표시 */}
      <Suspense fallback={null}>
        {modelsToShow.map((modelName) => {
          const floorNumber = modelName.replace("f", "");
          // 해당 층의 노드 정보를 가져옵니다.
          const floorNodeInfo = nodeData[floorNumber] || [];

          return (
            <Model
              key={modelName}
              model={modelName}
              // modelsToShow.length !== 1 &&
              onClick={
                isAuthenticated
                  ? (e) => handleModelClick(e, modelName)
                  : undefined
              }
              isSelected={isAuthenticated ? active.active : undefined}
              onDeviceClick={isAuthenticated ? handleDeviceClick : undefined}
              selectedDevice={isAuthenticated ? selectedDevice : undefined}
              ishover={isAuthenticated ? true : false}
              nodeInfo={floorNodeInfo}
            />
          );
        })}
      </Suspense>
      {isAuthenticated ? (
        <>
          {/* 컨트롤 - 반응형 설정 적용 */}
          <OrbitControls
            ref={controlsRef}
            target={cameraSettings.target}
            enableRotate={true}
            enableZoom={true}
            enablePan={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={cameraSettings.minDistance}
            maxDistance={cameraSettings.maxDistance}
            maxPolarAngle={THREE.MathUtils.degToRad(80)}
          />
        </>
      ) : (
        <>
          <OrbitControls
            ref={controlsRef}
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
    </>
  );
}
