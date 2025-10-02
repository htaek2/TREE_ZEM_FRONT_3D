import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from 'three'
// 🎥 카메라 컨트롤러 컴포넌트
function CameraController({ active, cameraSettings }) {
  const { camera } = useThree();
  
  useEffect(() => {
    // active 상태에 따라 카메라 위치 변경
    const targetPosition = active.active 
      ? cameraSettings.activePosition 
      : cameraSettings.defaultPosition;
    
    // FOV 업데이트
    camera.fov = cameraSettings.fov;
    camera.updateProjectionMatrix();
    
    // 카메라 위치 부드럽게 이동
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...targetPosition);
    let progress = 0;
    
    const animateCamera = () => {
      progress += 0.03; // 속도 조절
      
      if (progress < 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress);
        requestAnimationFrame(animateCamera);
      } else {
        camera.position.copy(endPosition);
      }
    };
    
    animateCamera();
    
    console.log('카메라 위치 변경:', targetPosition, 'FOV:', cameraSettings.fov);
  }, [active, cameraSettings, camera]);
  
  // 화면 크기 변경 시 즉시 반영
  useEffect(() => {
    const targetPosition = active.active 
      ? cameraSettings.activePosition 
      : cameraSettings.defaultPosition;
    
    camera.position.set(...targetPosition);
    camera.fov = cameraSettings.fov;
    camera.updateProjectionMatrix();
    
    console.log('화면 크기 변경으로 카메라 업데이트:', targetPosition);
  }, [cameraSettings]);
  
  return null;
}

export default CameraController;