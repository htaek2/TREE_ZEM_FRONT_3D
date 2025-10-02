import { act, Suspense, useEffect, useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import Model from './Model'
import { OrbitControls } from '@react-three/drei'
import { Camera } from 'three'
import styled from 'styled-components'
import { CAMERA_CONFIG} from './constants'
import CameraController from './components/CameraController'
// import CameraController from './CameraController'


const Container = styled.div `
  width: 100vw;
  height: 100vh;
  background: #BFBFC6;
  `


function App() {
  const [count, setCount] = useState(0)
  const [hoveredModel, setHoveredModel] = useState(null);
  const [active, setActive] = useState({active: false, model: null});
 
  const handleModelClick = (modelName) => {
    console.log("찍힘", modelName);
    setActive({active: !active.active, model: modelName});
  }

  
  useEffect(() => {
    console.log("active 변경:", active);
    
  }, [active])

  return (
   <Container>
    {/* 3D 캔버스 생성 Canvas는 
    1. THREE.Scene() == 3D공간 생성 
    2. THREE.PerspectiveCamera == 카메라 생성 
    3. THREE.webGLRenderer == 렌더러 생성

    위 3가지를 자동으로 생성해줌
    그리고 애니메이션 루프도 자동 실행해줌
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
  }
    클릭 감지 , 마우스가 어느 3D 오브젝트 위에 있는지 감지 등등 화면업데이트도 자동으로 해줌
    */}
    <Canvas
        camera={{
    position: active.active ? CAMERA_CONFIG.DEFAULT_POSITION : [-65, 35, 25],  // 각도 변경
          fov: 35,
          near: 0.1,
          far: 1000
        }}
      >
        {/* 조명 */}
        {/* 1. ambientLight - 전체를 은은하게 밝힘 */}
        <ambientLight intensity={1} />
        {/* 2. directionalLight - 태양빛과 유사한 조명 position : 빛의 방향 위,오른쪽,앞*/}
        <directionalLight 
          position={[10, 10, 20]} 
          intensity={1} 
        />
        {/* 3. pointLight - 전구처럼 한 점에서 사방으로 빛 distance : 빛이 닿는 거리 (1 = 매우 가까움) */}
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
       

        {/* 컨트롤 */}
        {/* OrbitControls : 마우스 드래그로 카메라 이동 가능
          enableDamping : 부드럽게 이동
          dampingFactor : 부드러운 정도 (1.0 = 매우 부드럽게)
        */}

        {/* <CameraController /> */}
        <OrbitControls 
        target={[13, 10, -8]}  // 건물 중심을 바라보도록
    enableRotate={false}
    enableZoom={true}
    enablePan={false}
    enableDamping={true}
    dampingFactor={0.05} 
    minDistance={40}  // 최소 거리도 조정
    maxDistance={50}  // 최대 거리도 조정
          
        />
      </Canvas>
    </Container>
  )
}

export default App


