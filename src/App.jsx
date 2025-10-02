import { Suspense, useEffect, useState } from 'react'
import './App.css'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import Model from './Model'
import { OrbitControls } from '@react-three/drei'
import styled from 'styled-components'
import { CAMERA_CONFIG } from './constants'

import CameraController from './components/CameraController'

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #BFBFC6;
  touch-action: none;
`

// 🎯 반응형 카메라 설정 함수
const getResponsiveCameraSettings = () => {
  const width = window.innerWidth;
  
  // 모바일 (768px 미만)
  if (width < 768) {
    return {
      defaultPosition: [-50, 30, 20],
      activePosition: [15, 8, 0],
      fov: 50,
      minDistance: 30,
      maxDistance: 60,
      target: [13, 8, -8]
    };
  } 
  // 태블릿 (768px ~ 1024px)
  else if (width <= 1024) {
    return {
      defaultPosition: [-60, 32, 22],
      activePosition: [18, 9, 0],
      fov: 40,
      minDistance: 35,
      maxDistance: 55,
      target: [13, 9, -8]
    };
  }
  // 데스크톱 (1024px 이상)
  else {
    return {
      defaultPosition: [-65, 35, 25],
      activePosition: CAMERA_CONFIG.DEFAULT_POSITION,
      fov: 35,
      minDistance: 40,
      maxDistance: 50,
      target: [13, 10, -8]
    };
  }
};



function App() {
  const [hoveredModel, setHoveredModel] = useState(null);
  const [active, setActive] = useState({active: false, model: null});
  const [cameraSettings, setCameraSettings] = useState(getResponsiveCameraSettings());
 
  // 🔄 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const newSettings = getResponsiveCameraSettings();
      setCameraSettings(newSettings);
      console.log('화면 크기 변경:', window.innerWidth, 'x', window.innerHeight);
      console.log('새 카메라 설정:', newSettings);
    };
    
    window.addEventListener('resize', handleResize);
    console.log('초기 화면 크기:', window.innerWidth, 'x', window.innerHeight);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleModelClick = (modelName) => {
    console.log("찍힘", modelName);
    setActive({active: !active.active, model: modelName});
  }

  useEffect(() => {
    console.log("active 변경:", active);
  }, [active])

  return (
   <Container>
    <Canvas
        camera={{
          position: cameraSettings.defaultPosition,
          fov: cameraSettings.fov,
          near: 0.1,
          far: 1000
        }}
      >
        {/* 🎥 카메라 컨트롤러 추가 */}
        <CameraController active={active} cameraSettings={cameraSettings} />
        
        {/* 조명 */}
        <ambientLight intensity={1} />
        <directionalLight 
          position={[10, 10, 20]} 
          intensity={1} 
        />
        <pointLight 
          position={[10, 10, 20]} 
          intensity={5} 
          distance={1} 
        />

        {/* 3D 모델 - 로딩 중 fallback 표시 */}
        <Suspense fallback={null}>
          {active.active && active.model === 'f1' && (
           <Model 
            model="f1"
            isHovered={hoveredModel === 'f1'}
            onPointerEnter={() => setHoveredModel('f1')}
            onPointerLeave={() => setHoveredModel(null)}
            onClick={() => handleModelClick('f1')}
            />  
          )}
          {active.active && active.model === 'f2' && (
          <Model 
            model="f2" 
            isHovered={hoveredModel === 'f2'}
            onPointerEnter={() => setHoveredModel('f2')}
            onPointerLeave={() => setHoveredModel(null)}
            onClick={() => handleModelClick('f2')}
          />
          )}
          {active.active && active.model === 'f3' && (
          <Model 
            model="f3" 
            isHovered={hoveredModel === 'f3'}
            onPointerEnter={() => setHoveredModel('f3')}
            onPointerLeave={() => setHoveredModel(null)}
            onClick={() => handleModelClick('f3')}
          />
          )}
          {active.active && active.model === 'f4' && (
          <Model 
            model="f4" 
            isHovered={hoveredModel === 'f4'}
            onPointerEnter={() => setHoveredModel('f4')}
            onPointerLeave={() => setHoveredModel(null)}
            onClick={() => handleModelClick('f4')}
          />
          )}
          {active.active && active.model === 'top' && (
          <Model 
            model="top" 
            isHovered={hoveredModel === 'top'}
            onPointerEnter={() => setHoveredModel('top')}
            onPointerLeave={() => setHoveredModel(null)}
            onClick={() => handleModelClick('top')}
          />
          )}
          {!active.active && (
            <>
              <Model 
                model="f1"
                isHovered={hoveredModel === 'f1'}
                onPointerEnter={() => setHoveredModel('f1')}
                onPointerLeave={() => setHoveredModel(null)}
                onClick={() => handleModelClick('f1')}
              />
              <Model 
                model="f2"
                isHovered={hoveredModel === 'f2'}
                onPointerEnter={() => setHoveredModel('f2')}
                onPointerLeave={() => setHoveredModel(null)}
                onClick={() => handleModelClick('f2')}
              />
              <Model 
                model="f3"
                isHovered={hoveredModel === 'f3'}
                onPointerEnter={() => setHoveredModel('f3')}
                onPointerLeave={() => setHoveredModel(null)}
                onClick={() => handleModelClick('f3')}
              />
              <Model 
                model="f4"
                isHovered={hoveredModel === 'f4'}
                onPointerEnter={() => setHoveredModel('f4')}
                onPointerLeave={() => setHoveredModel(null)}
                onClick={() => handleModelClick('f4')}
              />
              <Model 
                model="top"
                isHovered={hoveredModel === 'top'}
                onPointerEnter={() => setHoveredModel('top')}
                onPointerLeave={() => setHoveredModel(null)}
                onClick={() => handleModelClick('top')}
              />
            </>
          )}
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
    </Container>
  )
}

export default App