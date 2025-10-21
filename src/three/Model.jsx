import { useGLTF, TransformControls } from "@react-three/drei";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import * as THREE from "three";

function Model({ model, onClick, isSelected }) {
  const { scene } = useGLTF(`../public/${model}.gltf`);

  const [hovered, setHovered] = useState(false);
  const originalData = useRef(new Map());

  // 부드러운 애니메이션
  const { progress } = useSpring({
    progress: hovered && !isSelected ? 1 : 0,
    config: { tension: 400, friction: 40 },
  });

  // 매 프레임마다 호버 효과 적용 -> 성능개선?
  useFrame(() => {
    const currentProgress = progress.get();

    scene.traverse((child) => {
      if (child.isMesh) {
        if (model === "top") return;

        if (!originalData.current.has(child)) {
          originalData.current.set(child, {
            color: child.material.color.clone(),
            transparent: child.material.transparent,
            opacity: child.material.opacity,
            emissive: child.material.emissive
              ? child.material.emissive.clone()
              : new THREE.Color(0x000000),
            emissiveIntensity: child.material.emissiveIntensity || 0,
          });
        }

        const original = originalData.current.get(child);

        child.material.transparent = true;
        child.material.color.lerpColors(
          original.color,
          new THREE.Color(0xffffff),
          currentProgress
        );
        child.material.opacity =
          original.opacity + (0.8 - original.opacity) * currentProgress;
        child.material.emissive =
          child.material.emissive || new THREE.Color();
        child.material.emissive.lerpColors(
          original.emissive,
          new THREE.Color(0x0000ff),
          currentProgress
        );
        child.material.emissiveIntensity =
          original.emissiveIntensity +
          (1.5 - original.emissiveIntensity) * currentProgress;

        if (currentProgress < 0.01) {
          child.material.transparent = original.transparent;
        }
      }
    });
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <group
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={scene} />
    </group>
  );
}

export default Model;
