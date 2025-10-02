import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function Model({ model, position=[0,5,0],isHovered, onPointerEnter, onPointerLeave , onClick}) {
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

        groupRef.current.traverse((child) => {
            if (child.isMesh) {
                child.userData.clickable = true;
            }
        })
    }, [isHovered]);

    const handleClick = (e) => {
        e.stopPropagation(); // 이벤트 전파 중지
        // console.log("Model 클릭됨:", model);
        if (onClick) onClick(e);
    };

    return (
       //  여러 3d 물체를 묶는 폴더 역할
        <group 
            ref={groupRef}
            position={position}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onClick={handleClick} // 여기서 클릭 이벤트를 받음.
        >
        {/* 외부에서 만든 3D 모델을 화면에 */}
            <primitive object={gltf.scene.clone()} />
        </group>
    );
}

export default Model;