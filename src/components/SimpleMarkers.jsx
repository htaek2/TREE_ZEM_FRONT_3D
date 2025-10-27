import { Instance, Instances } from '@react-three/drei';

export const SimpleMarkers = ({ markerInfo = [], selectFloor }) => {
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

  console.log("마커정보!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", filteredMarkers);

  // 필터링 후 마커가 없으면 렌더링하지 않음
  if (filteredMarkers.length === 0) {
    return null;
  }

  return (
    <Instances limit={filteredMarkers.length}>
      {/* 마커 모양 정의 (작은 구체) */}
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="yellow" />

      {/* markerInfo를 순회하며 각 위치에 마커 배치 */}
      {filteredMarkers.map((marker, index) => (
        <Instance
          key={marker.deviceId || index}
          position={marker.position}  // ← Vector3(x, y, z)
        />
      ))}
    </Instances>
  );
};