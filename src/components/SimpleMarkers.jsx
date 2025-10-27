import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

const Marker = ({ position , onClick, onPointerOver, onPointerOut , selectedMarker }) => {
  return (
    <group position={position} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* 검정색 테두리 (뒤쪽) */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={0x000000} side={THREE.BackSide} />
      </mesh>

      {/* 메인 구체 */}
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color={selectedMarker.status === 1 ? 0x00AA6F : 0xFF3B30} />
      </mesh>
    </group>
  );
};

export const SimpleMarkers = ({ markerInfo = [], selectFloor, selectedMarker, setSelectedMarker }) => {
  // markerInfo가 없거나 빈 배열이면 렌더링하지 않음
  if (!markerInfo || markerInfo.length === 0) {
    return null;
  }

  const floorMap = {
    'f1': '1F',
    'f2': '2F',
    'f3': '3F',
    'f4': '4F',
    'f5': '5F'
  };

  const targetFloor = floorMap[selectFloor];

  const filteredMarkers = targetFloor
    ? markerInfo.filter(marker => marker.deviceName.slice(0,2) === targetFloor)
    : markerInfo;


  // 필터링 후 마커가 없으면 렌더링하지 않음
  if (filteredMarkers.length === 0) {
    return null;
  }

  return (
    <>
      {filteredMarkers.map((marker, index) => (
        <Marker
          key={marker.deviceId || index}
          position={marker.position}
          selectedMarker={selectedMarker}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMarker(marker);
           console.log('마커 클릭됨:', marker);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
          }}
        />
      ))}
    </>
  );
};