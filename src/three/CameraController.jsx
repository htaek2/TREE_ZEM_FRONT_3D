import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
// 🎥 카메라 컨트롤러 컴포넌트
function CameraController({ active, cameraSettings }) {
  const { camera } = useThree();

  useEffect(() => {
    // active 상태에 따라 카메라 위치 변경
    const targetPosition = active.active && active.model === 'f1'
      ? cameraSettings.f1activePosition
      : active.active && active.model === 'f2'
      ? cameraSettings.f2activePosition
      : active.active && active.model === 'f3'
      ? cameraSettings.f3activePosition
      : active.active && active.model === 'f4'
      ? cameraSettings.f4activePosition
      : cameraSettings.defaultPosition;

    // FOV 업데이트 (클릭 여부에 따라 다른 FOV)
    const targetFov = active.active
      ? cameraSettings.activeFov
      : cameraSettings.defaultFov;

    camera.fov = targetFov;
    camera.updateProjectionMatrix();

    // 카메라 위치 부드럽게 이동
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...targetPosition);
    let progress = 0;

    const animateCamera = () => {
      progress += 0.04; // 속도 조절

      if (progress < 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress);
        requestAnimationFrame(animateCamera);
      } else {
        camera.position.copy(endPosition);
      }
    };

    animateCamera();

    console.log("카메라 위치 변경:", targetPosition, "FOV:", targetFov);
  }, [active, cameraSettings, camera]);

  // 화면 크기 변경 시 즉시 반영
  useEffect(() => {
    const targetPosition = active.active
      ? cameraSettings.activePosition
      : cameraSettings.defaultPosition;

    const targetFov = active.active
      ? cameraSettings.activeFov
      : cameraSettings.defaultFov;

    camera.position.set(...targetPosition);
    camera.fov = targetFov;
    camera.updateProjectionMatrix();

    console.log(
      "화면 크기 변경으로 카메라 업데이트:",
      targetPosition,
      "FOV:",
      targetFov
    );
  }, [cameraSettings]);

  return null;
}

export default CameraController;
