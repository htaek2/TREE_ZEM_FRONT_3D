import { useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import { Html } from "@react-three/drei";
import { DEVICE_TYPES } from "../constants";

/**
 * 3D 공간에 표시되는 기기 마커 카드
 */
function DeviceMarker3D({ device, position, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false);

  // 호버/선택 시 스케일 애니메이션
  const { scale } = useSpring({
    scale: isSelected ? 1.2 : hovered ? 1.1 : 1,
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

  const deviceConfig = DEVICE_TYPES[device.type];

  return (
    <animated.group position={position} scale={scale}>
      {/* HTML 카드 UI */}
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        <div
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          style={{
            background: isSelected
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : hovered
              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            padding: "8px 12px",
            borderRadius: "12px",
            boxShadow: isSelected
              ? "0 8px 24px rgba(102, 126, 234, 0.6)"
              : hovered
              ? "0 6px 20px rgba(0, 0, 0, 0.4)"
              : "0 4px 12px rgba(0, 0, 0, 0.3)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            border: "2px solid white",
            minWidth: "100px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              marginBottom: "4px",
            }}
          >
            {deviceConfig.icon}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "white",
              whiteSpace: "nowrap",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {device.name}
          </div>
          {hovered && (
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255,255,255,0.9)",
                marginTop: "2px",
              }}
            >
              클릭하여 제어
            </div>
          )}
        </div>
      </Html>

      {/* 위치 표시용 빛나는 구체 */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#FFD700" : hovered ? "#FF6B6B" : "#4FACFE"}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 펄스 효과 */}
      {(hovered || isSelected) && (
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial
            color={isSelected ? "#FFD700" : "#FF6B6B"}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </animated.group>
  );
}

export default DeviceMarker3D;
