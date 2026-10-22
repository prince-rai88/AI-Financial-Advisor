import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function checkWebGLSupport() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * FinAiCore3D
 * An interactive, real 3D financial intelligence centerpiece.
 * Features:
 * - Real Three.js WebGL rendering with physical transmission (IOR 1.52)
 * - Titanium orbital gimbal rings with specular reflections
 * - Inner glowing emerald computational crystal
 * - Inertia-damped pointer tracking and natural floating physics
 * - Reduced motion & WebGL support checks
 */
export default function FinAiCore3D({
  variant = "hero", // "hero" | "compact"
  interactive = true,
  className = "",
}) {
  const mountRef = useRef(null);
  const [webglSupported] = useState(checkWebGLSupport);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, variant === "hero" ? 5.8 : 4.8);

    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-5, 2, -3);
    scene.add(rimLight);

    const emeraldCoreLight = new THREE.PointLight(0x00e599, 2.5, 8);
    emeraldCoreLight.position.set(0, 0, 0);
    scene.add(emeraldCoreLight);

    // Group for entire sculpture
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Optical Quartz Crystal
    const crystalGeo = new THREE.DodecahedronGeometry(variant === "hero" ? 1.05 : 0.85, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      metalness: 0.05,
      ior: 1.52,
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    rootGroup.add(crystalMesh);

    // 2. Inner Glowing Emerald Octahedron
    const coreGeo = new THREE.OctahedronGeometry(variant === "hero" ? 0.55 : 0.42, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00e599,
      emissive: 0x00e599,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.4,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 3. Inner Titanium Gimbal Ring
    const innerRingGeo = new THREE.TorusGeometry(
      variant === "hero" ? 1.45 : 1.15,
      variant === "hero" ? 0.035 : 0.025,
      16,
      80
    );
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.22,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, titaniumMat);
    innerRing.rotation.x = Math.PI / 3;
    rootGroup.add(innerRing);

    // 4. Outer Titanium Gimbal Ring
    const outerRingGeo = new THREE.TorusGeometry(
      variant === "hero" ? 1.75 : 1.38,
      variant === "hero" ? 0.03 : 0.022,
      16,
      90
    );
    const outerRing = new THREE.Mesh(outerRingGeo, titaniumMat);
    outerRing.rotation.y = Math.PI / 4;
    rootGroup.add(outerRing);

    // 5. Subtle Orbital Micro-nodes
    const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00e599,
      emissive: 0x00e599,
      emissiveIntensity: 1.8,
    });
    const nodes = [];
    for (let i = 0; i < 3; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      rootGroup.add(node);
      nodes.push(node);
    }

    // Interactive pointer inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.7;
      mouse.targetY = y * 0.7;
    };

    const handlePointerLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia damping for mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      if (!prefersReducedMotion) {
        // Sculptural rotation
        crystalMesh.rotation.y = elapsedTime * 0.35 + mouse.x * 0.6;
        crystalMesh.rotation.x = Math.sin(elapsedTime * 0.25) * 0.15 - mouse.y * 0.5;

        coreMesh.rotation.y = -elapsedTime * 0.6;
        coreMesh.rotation.z = Math.cos(elapsedTime * 0.3) * 0.2;

        innerRing.rotation.z = elapsedTime * 0.25;
        innerRing.rotation.x = Math.PI / 3 + mouse.y * 0.3;
        innerRing.rotation.y = mouse.x * 0.3;

        outerRing.rotation.y = Math.PI / 4 + elapsedTime * 0.18 + mouse.x * 0.4;
        outerRing.rotation.z = Math.sin(elapsedTime * 0.2) * 0.15 + mouse.y * 0.3;

        // Animate orbital nodes
        nodes.forEach((node, idx) => {
          const angle = elapsedTime * 0.8 + (idx * Math.PI * 2) / 3;
          const radius = variant === "hero" ? 1.45 : 1.15;
          node.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * Math.cos(Math.PI / 3) * radius,
            Math.sin(angle) * Math.sin(Math.PI / 3) * radius
          );
        });

        // Breathing float
        rootGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
      resizeObserver.disconnect();

      // Clean up geometries and materials
      crystalGeo.dispose();
      crystalMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerRingGeo.dispose();
      outerRingGeo.dispose();
      titaniumMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [variant, interactive, webglSupported]);

  if (!webglSupported) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="w-24 h-24 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs">
          3D Core
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Interactive 3D FinAI Intelligence Centerpiece"
    />
  );
}
