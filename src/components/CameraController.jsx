import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';

function CameraController() {
  const { camera } = useThree();
  
  useFrame(() => {
    // X축 제한 (-5 ~ 5 사이)
    if (camera.position.x < -5) camera.position.x = -5;
    if (camera.position.x > 5) camera.position.x = 5;
    
    // Y축 제한 (0 ~ 10 사이)
    if (camera.position.y < 0) camera.position.y = 0;
    if (camera.position.y > 10) camera.position.y = 10;
    
    // Z축 제한 (선택사항)
    if (camera.position.z < 2) camera.position.z = 2;
    if (camera.position.z > 20) camera.position.z = 20;
  });
  
  return null;
}

export default CameraController;