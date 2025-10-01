import { Suspense, useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import Model from './Model'
import { OrbitControls } from '@react-three/drei'
import { Camera } from 'three'
// import CameraController from './CameraController'




function App() {
  const [count, setCount] = useState(0)
  const [hoveredModel, setHoveredModel] = useState(null);


  return (
    <div style={{width: '100vw', height: '100vh', background:"#BFBFC6"}}>
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
    */}
    <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 125,
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
           <Model 
            model="f1" 
            isHovered={hoveredModel === 'f1'}
            onPointerEnter={() => setHoveredModel('f1')}
            onPointerLeave={() => setHoveredModel(null)}
            />  
          <Model 
            model="f2" 
            isHovered={hoveredModel === 'f2'}
            onPointerEnter={() => setHoveredModel('f2')}
            onPointerLeave={() => setHoveredModel(null)}
          />
          <Model 
            model="f3" 
            isHovered={hoveredModel === 'f3'}
            onPointerEnter={() => setHoveredModel('f3')}
            onPointerLeave={() => setHoveredModel(null)}
          />
          <Model 
            model="f4" 
            isHovered={hoveredModel === 'f4'}
            onPointerEnter={() => setHoveredModel('f4')}
            onPointerLeave={() => setHoveredModel(null)}
          />
          <Model 
            model="top" 
            isHovered={hoveredModel === 'top'}
            onPointerEnter={() => setHoveredModel('top')}
            onPointerLeave={() => setHoveredModel(null)}
          />
        </Suspense>
       

        {/* 컨트롤 */}
        {/* OrbitControls : 마우스 드래그로 카메라 이동 가능
          enableDamping : 부드럽게 이동
          dampingFactor : 부드러운 정도 (1.0 = 매우 부드럽게)
        */}

        {/* <CameraController /> */}
        <OrbitControls 
         enableRotate={false}    // 회전 불가
          enableZoom={true}        // 줌 가능
          enablePan={true}
          enableDamping={true}
          dampingFactor={1.0} 
        />
      </Canvas>
     </div>
  )
}

export default App
