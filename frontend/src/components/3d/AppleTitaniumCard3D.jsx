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
 * Creates a high-resolution texture with laser-etched titanium details,
 * contactless wave, EMV chip contact pads, and embossed typography.
 */
function createCardTexture(holderName = "GUEST EXPLORER") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 648;
  const ctx = canvas.getContext("2d");

  // Base titanium gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 648);
  bgGrad.addColorStop(0, "#161922");
  bgGrad.addColorStop(0.35, "#232834");
  bgGrad.addColorStop(0.65, "#181c25");
  bgGrad.addColorStop(1, "#12141a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 648);

  // Micro-brushed titanium horizontal texture noise
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let i = 0; i < 648; i += 2) {
    if (Math.random() > 0.3) {
      ctx.fillRect(0, i, 1024, 1);
    }
  }

  // Laser-etched FinAI wordmark (Top Left)
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("FinAI", 70, 95);

  ctx.font = "300 24px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillStyle = "#00e599";
  ctx.fillText("TITANIUM", 195, 95);

  // Contactless wave symbol (Top Right)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(940, 85, 12, 1.2 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(940, 85, 22, 1.2 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(940, 85, 32, 1.2 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();

  // EMV Chip (Left Center)
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.roundRect(70, 180, 140, 110, 12);
  ctx.fill();

  // EMV chip micro-circuits
  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(70, 215, 140, 40);
  ctx.beginPath();
  ctx.moveTo(140, 180);
  ctx.lineTo(140, 290);
  ctx.moveTo(70, 235);
  ctx.lineTo(210, 235);
  ctx.stroke();

  // Holographic iridescent band across lower middle
  const holoGrad = ctx.createLinearGradient(0, 340, 1024, 400);
  holoGrad.addColorStop(0, "rgba(0, 229, 153, 0.15)");
  holoGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.2)");
  holoGrad.addColorStop(0.6, "rgba(167, 139, 250, 0.15)");
  holoGrad.addColorStop(1, "rgba(0, 229, 153, 0.1)");
  ctx.fillStyle = holoGrad;
  ctx.fillRect(0, 340, 1024, 70);

  // Security Hologram Seal
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "mono 18px monospace";
  ctx.fillText("CALIBRATED FINANCIAL INTELLIGENCE · 2026", 70, 385);

  // Card Number masked
  ctx.font = "500 28px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText("••••  ••••  ••••  8824", 70, 475);

  // Cardholder name (Bottom Left)
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(holderName.toUpperCase(), 70, 565);

  // Security status / Network (Bottom Right)
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("FINAI OS", 860, 565);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export default function AppleTitaniumCard3D({
  holderName = "GUEST EXPLORER",
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

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

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
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Pointer-tracking Key Light (casts specular sheen across titanium)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    // Cold Rim Light (left flank)
    const rimLightLeft = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLightLeft.position.set(-5, 2, -1);
    scene.add(rimLightLeft);

    // Emerald Edge Light (underglow)
    const emeraldLight = new THREE.PointLight(0x00e599, 2.2, 8);
    emeraldLight.position.set(0, -3, 2);
    scene.add(emeraldLight);

    // Create Physical Card Mesh with Rounded Corners
    const cardWidth = 3.37;
    const cardHeight = 2.125;
    const radius = 0.14;
    const thickness = 0.045;

    const shape = new THREE.Shape();
    const x = -cardWidth / 2;
    const y = -cardHeight / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + cardWidth - radius, y);
    shape.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
    shape.lineTo(x + cardWidth, y + cardHeight - radius);
    shape.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
    shape.lineTo(x + radius, y + cardHeight);
    shape.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.018,
    };

    const cardGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    cardGeometry.center();

    // Map UVs for front face
    const cardTexture = createCardTexture(holderName);

    // Materials: Front Face (Detailed Titanium with Texture), Edge/Back (Machined Titanium)
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      metalness: 0.85,
      roughness: 0.24,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x222632,
      metalness: 0.92,
      roughness: 0.25,
    });

    const cardMesh = new THREE.Mesh(cardGeometry, [frontMaterial, edgeMaterial]);
    scene.add(cardMesh);

    // Mouse tracking with spring inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = nx * 0.45;
      mouse.targetY = ny * 0.35;

      // Move keyLight to follow pointer for interactive sheen
      keyLight.position.set(nx * 4 + 2, ny * 4 + 3, 4);
    };

    const handlePointerLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      keyLight.position.set(3, 4, 4);
    };

    window.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

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

    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      if (!prefersReducedMotion) {
        // Subtle floating breathing
        const floatZ = Math.sin(elapsedTime * 1.5) * 0.04;
        const floatRot = Math.cos(elapsedTime * 0.8) * 0.03;

        cardMesh.rotation.y = mouse.x * 0.8 + floatRot;
        cardMesh.rotation.x = -mouse.y * 0.7 + Math.sin(elapsedTime * 1.2) * 0.04;
        cardMesh.rotation.z = mouse.x * -0.15;
        cardMesh.position.y = floatZ;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
      resizeObserver.disconnect();

      cardGeometry.dispose();
      frontMaterial.dispose();
      edgeMaterial.dispose();
      cardTexture.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [holderName, webglSupported]);

  if (!webglSupported) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="w-64 h-40 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-white/50">
          FinAI Titanium Card
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Interactive 3D Apple Titanium FinAI Smart Card"
    />
  );
}
