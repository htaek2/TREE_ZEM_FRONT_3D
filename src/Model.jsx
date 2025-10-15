import { useGLTF } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import * as THREE from "three";
import DeviceMarker3D from "./components/DeviceMarker3D";
import { FLOOR_DEVICES } from "./constants";

function Model({ model, onClick, isSelected, onDeviceClick, selectedDevice }) {
  const { scene } = useGLTF(`../public/${model}.gltf`);

  const [hovered, setHovered] = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState(null);
  const originalData = useRef(new Map());
  const deviceOriginalData = useRef(new Map());
  const [devicePositions, setDevicePositions] = useState([]);

  const devices = FLOOR_DEVICES[model] || [];

  // 🔍 메시에 IOT 기기 정보 할당
  useEffect(() => {
    if (!scene) {
      console.warn("⚠️ scene이 아직 로드되지 않음");
      return;
    }

    // console.log(`\n🏗️ ===== ${model} 층 모델 분석 시작 =====`);

    const deviceMeshMapping = {
      f1: {
        mesh_128: { type: "COMPUTER", name: "1층 컴퓨터 #1" },
        mesh_132: { type: "COMPUTER", name: "1층 컴퓨터 #2" },
        mesh_146: { type: "AIRCON", name: "1층 에어컨" },
        mesh_150: { type: "LIGHT", name: "1층 조명 #1" },
      },
      f2: {
        mesh_20: { type: "COMPUTER", name: "2층 컴퓨터 #1" },
        mesh_78: { type: "COMPUTER", name: "2층 컴퓨터 #2" },
        mesh_114: { type: "AIRCON", name: "2층 에어컨" },
        mesh_281: { type: "LIGHT", name: "2층 조명 #1" },
      },
      f3: {
        mesh_13: { type: "COMPUTER", name: "3층 컴퓨터 #1" },
        mesh_31: { type: "COMPUTER", name: "3층 컴퓨터 #2" },
        mesh_44: { type: "AIRCON", name: "3층 에어컨" },
        mesh_234: { type: "LIGHT", name: "3층 조명 #1" },
      },
      f4: {
        mesh_61: { type: "COMPUTER", name: "4층 컴퓨터 #1" },
        mesh_107: { type: "AIRCON", name: "4층 에어컨" },
        mesh_124: { type: "LIGHT", name: "4층 조명 #1" },
        mesh_144: { type: "LIGHT", name: "4층 조명 #2" },
      },
    };

    const meshMapping = deviceMeshMapping[model] || {};
    // console.log(`📋 ${model} 층에서 찾을 기기 목록:`, Object.keys(meshMapping));

    const positions = [];
    let meshCount = 0;
    let deviceCount = 0;
    const allMeshNames = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        allMeshNames.push(child.name);

        // 기기로 등록된 메시인지 확인
        if (meshMapping[child.name]) {
          deviceCount++;
          const deviceInfo = meshMapping[child.name];

          child.userData.isDevice = true;
          child.userData.deviceType = deviceInfo.type;
          child.userData.deviceName = deviceInfo.name;
          child.userData.deviceId = `${model}-${child.name}`;
          child.userData.clickable = true;

          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);

          positions.push({
            id: `${model}-${child.name}`,
            type: deviceInfo.type,
            name: deviceInfo.name,
            position: [worldPos.x, worldPos.y + 1.5, worldPos.z],
          });

          // console.log(`✅ IOT 기기 등록 성공:`, {
          //   메시이름: child.name,
          //   기기이름: deviceInfo.name,
          //   타입: deviceInfo.type,
          //   위치: worldPos,
          // });
        }
      }
    });

    // console.log(`\n📊 ${model} 층 분석 결과:`);
    // console.log(`  - 전체 메시 개수: ${meshCount}`);
    // console.log(`  - 등록된 기기 개수: ${deviceCount}`);
    // console.log(`  - 모든 메시 이름 목록:`, allMeshNames);

    // if (deviceCount === 0) {
    //   console.warn(`⚠️ ${model} 층에서 IOT 기기를 찾지 못했습니다!`);
    //   // console.log(`💡 찾으려는 메시:`, Object.keys(meshMapping));
    // }

    setDevicePositions(positions);
    // console.log(`✅ ${model} 층 기기 위치 설정 완료:`, positions);
    // console.log(`===== ${model} 층 모델 분석 종료 =====\n`);
  }, [scene, model]);

  // 부드러운 애니메이션
  const { progress } = useSpring({
    progress: hovered && !isSelected ? 1 : 0,
    config: { tension: 400, friction: 40 },
  });

  // 매 프레임마다 호버 효과 적용
  useFrame(() => {
    const currentProgress = progress.get();

    scene.traverse((child) => {
      if (child.isMesh) {
        if (model === "top") return;

        if (!originalData.current.has(child)) {
          originalData.current.set(child, {
            color: child.material.color.clone(),
            transparent: child.material.transparent,
            opacity: child.material.opacity,
            emissive: child.material.emissive
              ? child.material.emissive.clone()
              : new THREE.Color(0x000000),
            emissiveIntensity: child.material.emissiveIntensity || 0,
          });
        }

        const original = originalData.current.get(child);

        if (child.userData.isDevice) {
          const isHovered = hoveredDevice === child.userData.deviceId;
          const deviceProgress = isHovered ? 1 : 0;

          child.material.emissive =
            child.material.emissive || new THREE.Color();
          child.material.emissive.lerpColors(
            original.emissive,
            new THREE.Color(0xffff00),
            deviceProgress
          );
          child.material.emissiveIntensity =
            original.emissiveIntensity +
            (2.0 - original.emissiveIntensity) * deviceProgress;
        } else {
          child.material.transparent = true;
          child.material.color.lerpColors(
            original.color,
            new THREE.Color(0xffffff),
            currentProgress
          );
          child.material.opacity =
            original.opacity + (0.8 - original.opacity) * currentProgress;
          child.material.emissive =
            child.material.emissive || new THREE.Color();
          child.material.emissive.lerpColors(
            original.emissive,
            new THREE.Color(0xff0000),
            currentProgress
          );
          child.material.emissiveIntensity =
            original.emissiveIntensity +
            (1.5 - original.emissiveIntensity) * currentProgress;

          if (currentProgress < 0.01) {
            child.material.transparent = original.transparent;
          }
        }
      }
    });
  });

  const handleClick = (e) => {
    e.stopPropagation();

    console.log("\n🖱️ ===== 클릭 이벤트 발생 =====");
    console.log("클릭된 객체 정보:", {
      이름: e.object?.name,
      타입: e.object?.type,
      isMesh: e.object?.isMesh,
      userData: e.object?.userData,
    });

    if (e.object && e.object.isMesh && e.object.userData.isDevice) {
      console.log("🎯 IOT 기기 클릭됨!");

      const device = {
        id: e.object.userData.deviceId,
        type: e.object.userData.deviceType,
        name: e.object.userData.deviceName,
        status: "정상",
        specs: "Intel i5, 16GB RAM",
        lastCheck: "2025-10-10",
      };

      console.log("📱 기기 정보:", device);

      if (onDeviceClick) {
        console.log("✅ onDeviceClick 콜백 호출");
        onDeviceClick(device);
        return;
      } else {
        console.error("❌ onDeviceClick이 정의되지 않음!");
      }
    } else {
      console.log("🏢 층 전체 클릭됨 (기기 아님)");
    }

    if (onClick) {
      console.log("✅ onClick 콜백 호출");
      onClick(e);
    }
    console.log("===== 클릭 이벤트 종료 =====\n");
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();

    if (e.object && e.object.isMesh && e.object.userData.isDevice) {
      console.log("👆 IOT 기기 호버:", e.object.userData.deviceName);
      setHoveredDevice(e.object.userData.deviceId);
      document.body.style.cursor = "pointer";
      return;
    }

    if (!isSelected) {
      console.log("👆 층 호버:", model);
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();

    if (e.object && e.object.isMesh && e.object.userData.isDevice) {
      console.log("👋 IOT 기기 호버 해제");
      setHoveredDevice(null);
    }

    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <group>
      <group
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive object={scene} />
      </group>

      {isSelected &&
        devicePositions.map((devicePos) => {
          console.log(`🏷️ 기기 마커 렌더링:`, devicePos.name);
          return (
            <DeviceMarker3D
              key={devicePos.id}
              device={{
                id: devicePos.id,
                type: devicePos.type,
                name: devicePos.name,
                status: "정상",
                specs: "Intel i5, 16GB RAM",
                lastCheck: "2025-10-10",
              }}
              position={devicePos.position}
              onClick={onDeviceClick}
              isSelected={selectedDevice?.id === devicePos.id}
            />
          );
        })}
    </group>
  );
}

export default Model;
