import { useState } from "react";
import { useSpring, animated } from "@react-spring/three";

/**
 * 투명한 클릭 가능한 박스 마커
 * 3D 모델 내 특정 위치를 IOT 기기로 지정
 */
function DeviceMarker({ device, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false);

  // 호버/선택 시 스케일 애니메이션
  const { scale } = useSpring({
    scale: isSelected ? 1.5 : hovered ? 1.2 : 1,
    config: { tension: 300, friction: 25 },
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(device);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <animated.group position={device.position} scale={scale}>
      {/* 클릭 박스 - 강렬한 색상으로 표시 */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial
          color={isSelected ? "#FF0000" : hovered ? "#00FF00" : "#FF00FF"}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 호버/선택 시 표시되는 와이어프레임 */}
      {(hovered || isSelected) && (
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial
            color={isSelected ? "#FFD700" : "#FFFFFF"}
            wireframe
            opacity={1}
            transparent
          />
        </mesh>
      )}
    </animated.group>
  );
}

export default DeviceMarker;
