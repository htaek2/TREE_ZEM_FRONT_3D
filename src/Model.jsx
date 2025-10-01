import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function Model({ model, isHovered, onPointerEnter, onPointerLeave }) {
    const gltf = useGLTF(`../public/${model}.gltf`);
    const groupRef = useRef();

    // 호버 시 테두리 효과
    useEffect(() => {
        if (!groupRef.current) return;

        // 기존 테두리 제거
        const existingEdges = groupRef.current.children.filter(
            child => child.type === 'LineSegments'
        );
        existingEdges.forEach(edge => groupRef.current.remove(edge));

        if (isHovered) {
            // 모든 메쉬에 테두리 추가
            groupRef.current.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    const edges = new THREE.EdgesGeometry(child.geometry);
                    const line = new THREE.LineSegments(
                        edges,
                        new THREE.LineBasicMaterial({ 
                            color: '#00ffff', 
                            linewidth: 2 
                        })
                    );
                    
                    // 메쉬와 같은 위치/회전/스케일 적용
                    line.position.copy(child.position);
                    line.rotation.copy(child.rotation);
                    line.scale.copy(child.scale);
                    
                    groupRef.current.add(line);
                }
            });
        }
    }, [isHovered]);

    return (
        <group 
            ref={groupRef}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <primitive object={gltf.scene.clone()} />
        </group>
    );
}

export default Model;