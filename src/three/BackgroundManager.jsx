import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function BackgroundManager() {
    const { scene } = useGLTF(`../public/landscape.gltf`);

    useEffect(() => {
        scene.traverse((node) => {
            if (node.isMesh) {
                const mat = node.material

                if (mat.map) {
                    mat.transparent = true
                    mat.alphaTest = 0.5  // 투명 배경 제거
                    mat.side = THREE.DoubleSide
                    mat.depthWrite = false // 겹침 방지
                }
            }
        })
    }, [scene])

    return (
        <primitive object={scene} />
    )
}