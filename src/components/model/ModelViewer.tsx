"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type ModelFormat = "stl" | "glb" | "gltf" | "3mf";

export interface ModelViewerProps {
  /** 模型文件地址（STL / GLB / GLTF） */
  src: string;
  /** 可显式指定格式，缺省时根据扩展名推断 */
  format?: ModelFormat;
  /** STL 无材质，使用此颜色渲染 */
  color?: string;
  className?: string;
}

function inferFormat(src: string): ModelFormat {
  const clean = src.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".stl")) return "stl";
  if (clean.endsWith(".glb")) return "glb";
  if (clean.endsWith(".gltf")) return "gltf";
  if (clean.endsWith(".3mf")) return "3mf";
  // 默认按 glb 处理
  return "glb";
}

/** STL 模型：加载几何体并套用统一材质 */
function StlModel({ src, color }: { src: string; color: string }) {
  const geometry = useLoader(STLLoader, src);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.05,
        roughness: 0.65,
      }),
    [color],
  );

  // STL 常见问题：缺少法线，光照会全黑。这里强制重算。
  useMemo(() => {
    geometry.computeVertexNormals();
  }, [geometry]);

  return (
    <Center>
      <mesh geometry={geometry} material={material} />
    </Center>
  );
}

/** GLB / GLTF 模型：自带材质 */
function GltfModel({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

/** 3MF 模型：拓竹社区主力格式，加载为 Group。部分文件缺材质/法线，做兜底处理。 */
function ThreeMfModel({ src, color }: { src: string; color: string }) {
  const group = useLoader(ThreeMFLoader, src);

  const prepared = useMemo(() => {
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.05,
      roughness: 0.65,
    });

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 缺法线会导致光照全黑，强制重算
        if (!child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
        // 缺材质时套用统一渲染色
        const hasMaterial = Array.isArray(child.material)
          ? child.material.length > 0
          : Boolean(child.material);
        if (!hasMaterial) {
          child.material = fallbackMaterial;
        }
      }
    });

    return group;
  }, [group, color]);

  return (
    <Center>
      <primitive object={prepared} />
    </Center>
  );
}

function ModelContent({
  src,
  format,
  color,
}: {
  src: string;
  format: ModelFormat;
  color: string;
}) {
  if (format === "stl") {
    return <StlModel src={src} color={color} />;
  }
  if (format === "3mf") {
    return <ThreeMfModel src={src} color={color} />;
  }
  return <GltfModel src={src} />;
}

/**
 * 3D 模型预览组件。
 * - 支持 STL / GLB / GLTF / 3MF
 * - 旋转（左键）、缩放（滚轮）、平移（右键）
 * - 自动居中并适配视野
 * - 使用自带灯光，不依赖外部 HDR 环境贴图
 */
export function ModelViewer({
  src,
  format,
  color = "#6b7bff",
  className,
}: ModelViewerProps) {
  const resolvedFormat = format ?? inferFormat(src);

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-xl border bg-gradient-to-b from-gray-50 to-gray-100",
        className,
      )}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        {/* 三点式布光，保证任意角度都有明暗层次 */}
        <ambientLight intensity={0.8} />
        <hemisphereLight
          args={["#ffffff", "#8090a0", 0.6]}
        />
        <directionalLight position={[5, 8, 6]} intensity={1.2} />
        <directionalLight position={[-6, 2, -4]} intensity={0.6} />
        <directionalLight position={[0, -5, 3]} intensity={0.3} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <ModelContent src={src} format={resolvedFormat} color={color} />
          </Bounds>
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={0.5}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
}
