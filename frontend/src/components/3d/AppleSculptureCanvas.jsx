import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function checkWebGLSupport() {
  if (typeof window === "undefined") return false;
  try {
    const testCanvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * AppleSculptureCanvas
 * 
 * An Apple-quality, sculptural 3D centerpiece for FinAI.
 * Features:
 * - Precision-machined titanium outer shells that deconstruct along mechanical axes
 * - Internal optical quartz crystal with physical refraction (IOR 1.52)
 * - Micro-etched titanium gimbal rings with chamfered specular highlights
 * - Coordinated cinematic scroll sequence: Monolith -> Deconstruction -> Spectrum -> Anomaly -> Convergence
 * - Damped pointer inertia responding like physical hardware under studio lighting
 * - Zero external asset dependencies (100% procedurally generated geometry & materials)
 */
export default function AppleSculptureCanvas({ scrollProgress = 0, anomalyActive = false }) {
  const mountRef = useRef(null);
  const [webglSupported] = useState(checkWebGLSupport);
  const progressRef = useRef(scrollProgress);
  const anomalyRef = useRef(anomalyActive);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    anomalyRef.current = anomalyActive;
  }, [anomalyActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE & STUDIO ENVIRONMENT SETUP
    // ─────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.04);

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

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

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────────────────
    // STUDIO LIGHTING (Apple-caliber soft rim and chamfer highlights)
    // ─────────────────────────────────────────────────────────────────────────
    // 1. Soft Studio Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // 2. Main Key Light (Polished silver overhead bounce)
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    // 3. Cool Titanium Rim Light (Left flank)
    const rimLightLeft = new THREE.DirectionalLight(0x94a3b8, 2.0);
    rimLightLeft.position.set(-6, 2, -2);
    scene.add(rimLightLeft);

    // 4. Emerald Core Fill Light (Under-glow reflecting off the crystal)
    const emeraldCoreLight = new THREE.PointLight(0x00e599, 2.2, 12);
    emeraldCoreLight.position.set(0, -1.5, 2);
    scene.add(emeraldCoreLight);

    // 5. Anomaly Alert Accent Light
    const alertPointLight = new THREE.PointLight(0xf43f5e, 0, 10);
    alertPointLight.position.set(1.5, 0.5, 2.5);
    scene.add(alertPointLight);

    // ─────────────────────────────────────────────────────────────────────────
    // THE SCULPTURE: THE FINAI PRECISION PRISM
    // ─────────────────────────────────────────────────────────────────────────
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Group for the deconstructing titanium chassis
    const chassisLeft = new THREE.Group();
    const chassisRight = new THREE.Group();
    masterGroup.add(chassisLeft);
    masterGroup.add(chassisRight);

    // Titanium Material (Apple Grade 5 brushed metal finish)
    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: 0x242a35,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.2,
    });

    const polishedEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08,
      emissive: 0x00e599,
      emissiveIntensity: 0.1,
    });

    // 1. Left Titanium Shell (Precision machined curved half-capsule)
    const shellGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.35, 64, 1, false, 0, Math.PI);
    const leftShell = new THREE.Mesh(shellGeo, titaniumMaterial);
    leftShell.rotation.z = Math.PI / 2;
    chassisLeft.add(leftShell);

    const leftBezelGeo = new THREE.TorusGeometry(1.65, 0.02, 16, 64, Math.PI);
    const leftBezel = new THREE.Mesh(leftBezelGeo, polishedEdgeMaterial);
    leftBezel.rotation.y = Math.PI / 2;
    chassisLeft.add(leftBezel);

    // 2. Right Titanium Shell
    const rightShell = new THREE.Mesh(shellGeo, titaniumMaterial);
    rightShell.rotation.z = -Math.PI / 2;
    chassisRight.add(rightShell);

    const rightBezel = new THREE.Mesh(leftBezelGeo, polishedEdgeMaterial);
    rightBezel.rotation.y = -Math.PI / 2;
    chassisRight.add(rightBezel);

    // 3. Central Optical Glass Prism (Floating refractive core)
    const prismGeo = new THREE.OctahedronGeometry(1.2, 0);
    const prismMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      roughness: 0.06,
      metalness: 0.05,
      ior: 1.52,
      thickness: 1.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      flatShading: true,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMaterial);
    masterGroup.add(prismMesh);

    // 4. Internal Luminous Emerald Data Heart
    const heartGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const heartMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e599,
      emissive: 0x00e599,
      emissiveIntensity: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMaterial);
    masterGroup.add(heartMesh);

    // 5. Calibrated Titanium Gimbal Rings (Laser indexed)
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.015, 16, 128);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });
    const gimbalRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    masterGroup.add(gimbalRing1);

    const ring2Geo = new THREE.TorusGeometry(2.35, 0.012, 16, 128);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const gimbalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    gimbalRing2.rotation.x = Math.PI / 3;
    masterGroup.add(gimbalRing2);

    // 6. Precision Anomaly Reticle Ring
    const reticleGeo = new THREE.RingGeometry(1.35, 1.38, 64);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const anomalyReticle = new THREE.Mesh(reticleGeo, reticleMat);
    anomalyReticle.position.set(0, 0, 1.4);
    masterGroup.add(anomalyReticle);

    // ─────────────────────────────────────────────────────────────────────────
    // DISCIPLINED DATA STREAM PARTICLES (1,200 Balanced Stream Vectors)
    // ─────────────────────────────────────────────────────────────────────────
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleY = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);

    const emeraldColor = new THREE.Color(0x00e599);
    const platinumColor = new THREE.Color(0xf1f5f9);
    const iceBlueColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 3.2;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.8;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleRadii[i] = radius;
      particleAngles[i] = angle;
      particleY[i] = y;
      particleSpeeds[i] = 0.25 + Math.random() * 0.45;

      const pick = Math.random();
      const col = pick < 0.4 ? emeraldColor : pick < 0.75 ? platinumColor : iceBlueColor;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    // Particle disk texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      map: particleTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ─────────────────────────────────────────────────────────────────────────
    // POINTER TRACKING WITH PHYSICAL INERTIA
    // ─────────────────────────────────────────────────────────────────────────
    const pointer = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? rect.width / 2;
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? rect.height / 2;

      pointer.targetX = ((clientX - rect.left) / rect.width - 0.5) * 1.5;
      pointer.targetY = -((clientY - rect.top) / rect.height - 0.5) * 1.5;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────────────────
    // ANIMATION & SCROLL CHOREOGRAPHY
    // ─────────────────────────────────────────────────────────────────────────
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const progress = progressRef.current;
      const isAnomaly = anomalyRef.current;

      const motionFactor = prefersReducedMotion ? 0.2 : 1.0;

      // Pointer spring interpolation
      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.04;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.04;

      // Master sculpture gentle studio idle + pointer reaction
      masterGroup.rotation.y = time * 0.18 * motionFactor + pointer.currentX * 0.45 * motionFactor;
      masterGroup.rotation.x = Math.sin(time * 0.3) * 0.08 + pointer.currentY * 0.35 * motionFactor;

      // Internal optical crystal differential spin
      prismMesh.rotation.y += 0.3 * delta * motionFactor;
      prismMesh.rotation.z = Math.cos(time * 0.5) * 0.15;
      heartMesh.rotation.y -= 0.5 * delta * motionFactor;

      // Gimbal rings rotation
      gimbalRing1.rotation.z += 0.2 * delta * motionFactor;
      gimbalRing2.rotation.y -= 0.25 * delta * motionFactor;

      // ─────────────────────────────────────────────────────────────────────
      // CHOREOGRAPHED SCROLL SEQUENCE
      // Chapter 1 (0.00 - 0.22): The Monolith (Sealed, serene)
      // Chapter 2 (0.22 - 0.48): Deconstruction (Titanium shells slide outward)
      // Chapter 3 (0.48 - 0.72): Refraction of Spending (Optical prism exposed)
      // Chapter 4 (0.72 - 0.88): Anomaly Reticle Isolation
      // Chapter 5 (0.88 - 1.00): Convergence into Precision Equilibrium
      // ─────────────────────────────────────────────────────────────────────

      // 1. Axial deconstruction of titanium shells
      let separation = 0;
      if (progress >= 0.18 && progress < 0.85) {
        // Expand outwards smoothly
        const t = (progress - 0.18) / (0.45 - 0.18);
        separation = THREE.MathUtils.smoothstep(t, 0, 1) * 0.95;
      } else if (progress >= 0.85) {
        // Re-converge and seal tight
        const t = (progress - 0.85) / (1.0 - 0.85);
        separation = (1 - THREE.MathUtils.smoothstep(t, 0, 1)) * 0.95;
      }
      chassisLeft.position.x = -separation;
      chassisRight.position.x = separation;

      // 2. Camera perspective adjustments
      camera.position.z = 7.5 - progress * 1.8;
      camera.position.y = Math.sin(progress * Math.PI) * 0.75;
      camera.lookAt(0, 0, 0);

      // 3. Anomaly Reticle and Lighting Response
      if (isAnomaly || (progress >= 0.70 && progress <= 0.88)) {
        alertPointLight.intensity = THREE.MathUtils.lerp(alertPointLight.intensity, 3.8, 0.08);
        reticleMat.opacity = THREE.MathUtils.lerp(reticleMat.opacity, 0.85, 0.1);
        anomalyReticle.rotation.z += 0.8 * delta;
        prismMaterial.emissive = new THREE.Color(0xf43f5e);
        prismMaterial.emissiveIntensity = 0.2 + Math.sin(time * 6) * 0.15;
      } else {
        alertPointLight.intensity = THREE.MathUtils.lerp(alertPointLight.intensity, 0, 0.05);
        reticleMat.opacity = THREE.MathUtils.lerp(reticleMat.opacity, 0, 0.1);
        prismMaterial.emissive = new THREE.Color(0x000000);
        prismMaterial.emissiveIntensity = 0;
      }

      // 4. Particle stream orbital dynamics
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        particleAngles[i] += particleSpeeds[i] * delta * 0.75 * motionFactor;

        let r = particleRadii[i];
        if (progress > 0.25 && progress < 0.75) {
          // Flow tightly around the separated crystal core
          r = THREE.MathUtils.lerp(r, 1.45 + (i % 5) * 0.2, 0.02);
        }

        positions[idx] = Math.cos(particleAngles[i]) * r;
        positions[idx + 1] = particleY[i] + Math.sin(time * 0.8 + i) * 0.1;
        positions[idx + 2] = Math.sin(particleAngles[i]) * r;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      // Clean up geometries and materials
      shellGeo.dispose();
      leftBezelGeo.dispose();
      prismGeo.dispose();
      prismMaterial.dispose();
      heartGeo.dispose();
      heartMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      reticleGeo.dispose();
      reticleMat.dispose();
      titaniumMaterial.dispose();
      polishedEdgeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTex.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [webglSupported]);

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-[#00e599]/30" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}
