import { useGLTF } from "@react-three/drei";
import { useState, useRef, useEffect } from "react"; // useEffect import
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import * as THREE from "three";
import { SortUtils } from "three/examples/jsm/Addons.js";

function Model({ model, onClick, isSelected, nodeInfo }) {
  const { scene } = useGLTF(`../public/${model}.gltf`);

  // const [hovered, setHovered] = useState(false);
  const originalData = useRef(new Map());
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [combinedNodeInfo, setCombinedNodeInfo] = useState([]);

  useEffect(() => {
    if (!scene || nodeInfo.length === 0) return;

    scene.traverse((child) => {
      if (child.isMesh && child.name.includes("mesh_")) {
        if (child.userData.id) {
          return;
        }

        const meshId = child.name.split("_")[1];
        const node = combinedNodeInfo.find((n) => n.name === meshId);

        if (node) {
          child.userData = { ...child.userData, ...node };
          console.log(
            `[${model}] Mesh '${child.name}' is linked to data:`,
            child.userData
          );
        }
      }
    });
  }, []);

  // ai의 쓰레기 더미. 나중에 폐지 주을려고 남겨 둠.
  // useEffect(() => {
  //   const fetchDeviceData = async () => {
  //     if (!model.startsWith("f")) {
  //       setDeviceInfo([]);
  //       return;
  //     }

  //     const floor = model.replace("f", "");
  //     try {

  //       const response = await fetch(`/api/devices/${floor}`);

  //       if (!response.ok) {
  //         throw new Error(`서버 연결 오류: ${response.statusText}`);
  //       }

  //       const data = await response.json();
  //       setDeviceInfo(data);
  //       // console.log(data);

  //     } catch (error) {
  //       console.error(`장비 정보 호출 오류 ${floor}:`, error);
  //       setDeviceInfo([]);
  //     }
  //   };

  //   fetchDeviceData();
  // }, [model]);

  // useEffect(() => {
  //   if (!nodeInfo || nodeInfo.length === 0) {
  //     setCombinedNodeInfo([]);
  //     return;
  //   }

  //   if (!deviceInfo || deviceInfo.length === 0) {
  //     setCombinedNodeInfo(nodeInfo);
  //     return;
  //   }

  //   const availableDevices = [...deviceInfo];
  //   const newCombinedInfo = nodeInfo.map((node) => {

  //     const deviceIndex = availableDevices.findIndex(
  //       (device) => device.deviceType === node.type
  //     );

  //     if (deviceIndex !== -1) {
  //       const matchedDevice = availableDevices[deviceIndex];
  //       availableDevices.splice(deviceIndex, 1);

  //       return { ...node, device: matchedDevice };
  //     }

  //     return node;
  //   });

  //   console.log(newCombinedInfo)

  //   setCombinedNodeInfo(newCombinedInfo);
  // }, [nodeInfo, deviceInfo]);

  // useEffect(() => {
  //   if (!scene || !combinedNodeInfo || combinedNodeInfo.length === 0) return;

  //   scene.traverse((child) => {
  //     if (child.isMesh && child.name.includes("mesh")) {
  //       if (child.userData.id) {
  //         return;
  //       }

  //       const meshId = child.name.split("_")[1];
  //       const node = combinedNodeInfo.find((n) => n.id === meshId);

  //       if (node) {
  //         child.userData = { ...child.userData, ...node };
  //         console.log(
  //           `[${model}] Mesh '${child.name}' is linked to data:`,
  //           child.userData
  //         );
  //       }
  //     }
  //   });
  // }, [scene, combinedNodeInfo, model]);


  // 호버 폐지 -> 일단 남겨둠
  // // 부드러운 애니메이션
  // const { progress } = useSpring({
  //   progress: hovered && !isSelected ? 1 : 0,
  //   config: { tension: 400, friction: 40 },
  // });

  // // 매 프레임마다 호버 효과 적용 -> 성능개선?
  // useFrame(() => {
  //   const currentProgress = progress.get();

  //   scene.traverse((child) => {
  //     if (child.isMesh) {
  //       if (model === "top") return;

  //       if (!originalData.current.has(child)) {
  //         originalData.current.set(child, {
  //           color: child.material.color.clone(),
  //           transparent: child.material.transparent,
  //           opacity: child.material.opacity,
  //           emissive: child.material.emissive
  //             ? child.material.emissive.clone()
  //             : new THREE.Color(0x000000),
  //           emissiveIntensity: child.material.emissiveIntensity || 0,
  //         });
  //       }

  //       const original = originalData.current.get(child);

  //       const baseColor = child.userData.id
  //         ? new THREE.Color(0x2ecc71) // 연결된 메쉬는 녹색으로
  //         : original.color;

  //       child.material.transparent = true;
  //       child.material.color.lerpColors(
  //         baseColor,
  //         new THREE.Color(0xffffff),
  //         currentProgress
  //       );
  //       child.material.opacity =
  //         original.opacity + (0.8 - original.opacity) * currentProgress;
  //       child.material.emissive =
  //         child.material.emissive || new THREE.Color();
  //       child.material.emissive.lerpColors(
  //         original.emissive,
  //         new THREE.Color(0x0000ff),
  //         currentProgress
  //       );
  //       child.material.emissiveIntensity =
  //         original.emissiveIntensity +
  //         (1.5 - original.emissiveIntensity) * currentProgress;

  //       if (currentProgress < 0.01) {
  //         child.material.transparent = original.transparent;
  //       }
  //     }
  //   });
  // });

  const handleClick = (e) => {
    e.stopPropagation();

    // 등록된 객체를 클릭했을 때
    if (e.object.userData.id) {
      console.log("등록된 객체 클릭: ", e.object.userData);
    }

    if (onClick) {
      onClick(e);
    }
  };

  // const handlePointerOver = (e) => {
  //   e.stopPropagation();
  //   if (!isSelected) {
  //     setHovered(true);
  //     document.body.style.cursor = "pointer";
  //   }
  // };

  // const handlePointerOut = (e) => {
  //   e.stopPropagation();
  //   setHovered(false);
  //   document.body.style.cursor = "default";
  // };

  return (
    <group
      onClick={handleClick}
      // onPointerOver={handlePointerOver}
      // onPointerOut={handlePointerOut}
    >
      <primitive object={scene} />
      
    </group>
  );
}

export default Model;