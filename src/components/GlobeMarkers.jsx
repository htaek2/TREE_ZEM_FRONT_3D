import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useMarkerData } from '../../hooks/useMarkerData';
import { MarkerMaterial } from './MarkerMaterial';

export const GlobeMarkers = () => {
  const markerInfo = useMarkerData(30, 5);
  const materialRef = useRef();

  // 시간 업데이트 (애니메이션)
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  // Phase 속성을 위한 InstancedBufferAttribute
  const phaseAttribute = useMemo(() => {
    const phases = new Float32Array(markerInfo.map(m => m.phase));
    return new THREE.InstancedBufferAttribute(phases, 1);
  }, [markerInfo]);

  return (
    <Instances limit={markerInfo.length}>
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute
          attach="attributes-phase"
          args={[phaseAttribute.array, 1]}
        />
      </planeGeometry>
      <markerMaterial ref={materialRef} />

      {markerInfo.map((marker) => (
        <MarkerInstance key={marker.id} marker={marker} />
      ))}
    </Instances>
  );
};

// 개별 마커 인스턴스
const MarkerInstance = ({ marker }) => {
  const ref = useRef();

  useMemo(() => {
    if (ref.current) {
      // 지구 중심을 향하도록 회전
      ref.current.lookAt(
        marker.position.clone().setLength(marker.position.length() + 1)
      );
    }
  }, [marker.position]);

  return (
    <Instance
      ref={ref}
      position={marker.position}
      userData={{ markerId: marker.id, markerData: marker }}
    />
  );
};