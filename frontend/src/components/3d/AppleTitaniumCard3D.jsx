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
 * Creates an ultra-crisp 2048x1296 high-resolution texture with rich colors:
 * - Obsidian brushed titanium base with luminous radial sheen
 * - Precision guilloche security lattice
 * - Polished 3D gold EMV microchip with micro-circuit traces
 * - Vibrant iridescent rainbow holographic security band
 * - Razor-sharp typography and embossed card numbering
 * - Interlocking translucent emerald & cyan network spheres
 */
function createCardTexture(holderName = "GUEST EXPLORER") {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1296;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const W = 2048;
  const H = 1296;

  // 1. Base Obsidian Titanium Gradient with deep violet & emerald undertones
  const bgGrad = ctx.createRadialGradient(W * 0.45, H * 0.4, 100, W * 0.5, H * 0.5, W * 0.85);
  bgGrad.addColorStop(0, "#1c2230");
  bgGrad.addColorStop(0.35, "#141824");
  bgGrad.addColorStop(0.7, "#0c0f16");
  bgGrad.addColorStop(1, "#07080c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Micro-brushed horizontal titanium grain
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let y = 0; y < H; y += 3) {
    if ((y * 17) % 7 > 2) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  // 3. Security Guilloche lattice curves (ultra-fine cryptographic linework)
  ctx.save();
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 18; i++) {
    const offset = i * 28;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(0, 229, 153, 0.07)" : "rgba(56, 189, 248, 0.06)";
    ctx.beginPath();
    ctx.moveTo(0, 200 + offset);
    ctx.bezierCurveTo(W * 0.3, 100 + offset * 1.5, W * 0.7, 700 - offset, W, 400 + offset);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Vibrant Iridescent Holographic Security Band (diagonal ribbon)
  const holoBandY = 640;
  const holoBandH = 140;
  const holoGrad = ctx.createLinearGradient(0, holoBandY, W, holoBandY + holoBandH);
  holoGrad.addColorStop(0, "rgba(0, 245, 160, 0.35)");
  holoGrad.addColorStop(0.25, "rgba(0, 210, 255, 0.4)");
  holoGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.38)");
  holoGrad.addColorStop(0.75, "rgba(236, 72, 153, 0.35)");
  holoGrad.addColorStop(1, "rgba(255, 215, 0, 0.3)");
  ctx.fillStyle = holoGrad;
  ctx.fillRect(0, holoBandY, W, holoBandH);

  // Holographic fine microtext
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "600 24px 'SF Mono', Monaco, monospace";
  ctx.letterSpacing = "4px";
  ctx.fillText("FINAI NEURAL KERNEL · 256-BIT ENCLAVE · AUTONOMOUS LEDGER INTELLIGENCE", 140, holoBandY + 80);

  // 5. Laser-etched FinAI Brand Mark (Top Left)
  ctx.save();
  ctx.shadowColor = "rgba(0, 229, 153, 0.6)";
  ctx.shadowBlur = 18;
  ctx.font = "bold 96px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("FinAI", 140, 220);
  ctx.restore();

  // Titanium Edition Pill Badge
  ctx.strokeStyle = "rgba(0, 229, 153, 0.7)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(430, 150, 240, 60, 30);
  ctx.stroke();
  ctx.fillStyle = "rgba(0, 229, 153, 0.12)";
  ctx.fill();

  ctx.font = "700 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#00e599";
  ctx.letterSpacing = "2px";
  ctx.fillText("TITANIUM", 475, 188);

  // 6. Contactless Waves (Top Right)
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (let r = 26; r <= 74; r += 24) {
    ctx.beginPath();
    ctx.arc(1860, 190, r, 1.25 * Math.PI, 1.75 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Polished 3D Gold EMV Microchip (Left)
  const chipX = 140;
  const chipY = 360;
  const chipW = 280;
  const chipH = 210;

  // Chip Gold Bevel Gradient
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#fde68a");
  chipGrad.addColorStop(0.3, "#f59e0b");
  chipGrad.addColorStop(0.6, "#d97706");
  chipGrad.addColorStop(1, "#92400e");

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 22);
  ctx.fill();
  ctx.restore();

  // Chip inner metallic stroke
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(chipX + 4, chipY + 4, chipW - 8, chipH - 8, 18);
  ctx.stroke();

  // Chip etched contact circuit lines
  ctx.strokeStyle = "rgba(30, 20, 5, 0.65)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.strokeRect(chipX, chipY + 70, chipW, 70);
  ctx.moveTo(chipX + 140, chipY);
  ctx.lineTo(chipX + 140, chipY + chipH);
  ctx.moveTo(chipX, chipY + 105);
  ctx.lineTo(chipX + chipW, chipY + 105);
  ctx.stroke();

  // 8. Masked Card Number (Physical Emboss Style)
  ctx.save();
  ctx.font = "600 52px 'SF Mono', Monaco, monospace";
  ctx.letterSpacing = "6px";
  // Drop shadow for embossed physical depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillText("••••   ••••   ••••   8824", 143, 933);
  // Highlight
  ctx.fillStyle = "#ffffff";
  ctx.fillText("••••   ••••   ••••   8824", 140, 930);
  ctx.restore();

  // 9. Cardholder Name (Bottom Left)
  ctx.save();
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.letterSpacing = "3px";
  ctx.fillText("CARDHOLDER", 140, 1070);

  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.letterSpacing = "2px";
  const nameToRender = (holderName || "GUEST EXPLORER").trim().toUpperCase();
  ctx.fillText(nameToRender, 140, 1130);
  ctx.restore();

  // 10. Valid Thru Date
  ctx.save();
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.letterSpacing = "3px";
  ctx.fillText("EXPIRES", 1000, 1070);

  ctx.font = "600 38px 'SF Mono', Monaco, monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("10 / 30", 1000, 1130);
  ctx.restore();

  // 11. Network Emblem: Interlocking Glowing Spheres (Bottom Right)
  const sphereY = 1090;
  const r1X = 1720;
  const r2X = 1810;
  const radius = 60;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Emerald sphere
  const emeraldGrad = ctx.createRadialGradient(r1X - 15, sphereY - 15, 10, r1X, sphereY, radius);
  emeraldGrad.addColorStop(0, "#34d399");
  emeraldGrad.addColorStop(0.7, "#059669");
  emeraldGrad.addColorStop(1, "rgba(5, 150, 105, 0.2)");
  ctx.fillStyle = emeraldGrad;
  ctx.beginPath();
  ctx.arc(r1X, sphereY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Cyan sphere
  const cyanGrad = ctx.createRadialGradient(r2X + 15, sphereY - 15, 10, r2X, sphereY, radius);
  cyanGrad.addColorStop(0, "#38bdf8");
  cyanGrad.addColorStop(0.7, "#0284c7");
  cyanGrad.addColorStop(1, "rgba(2, 132, 199, 0.2)");
  ctx.fillStyle = cyanGrad;
  ctx.beginPath();
  ctx.arc(r2X, sphereY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Network Label
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "right";
  ctx.fillText("FINAI PLATINUM", 1870, 990);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
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

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Dynamic 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Interactive Key Light (moves with pointer, glides specular glint across titanium)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(3, 4, 4.5);
    scene.add(keyLight);

    // Electric Cyan Left Rim
    const rimCyan = new THREE.DirectionalLight(0x38bdf8, 2.8);
    rimCyan.position.set(-5, 2, -1);
    scene.add(rimCyan);

    // Radiant Emerald Underglow
    const glowEmerald = new THREE.PointLight(0x00e599, 3.5, 9);
    glowEmerald.position.set(0, -2.5, 2);
    scene.add(glowEmerald);

    // Ethereal Particle Starfield around the card
    const particleCount = 65;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cEmerald = new THREE.Color(0x00e599);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 7;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;

      const mixed = Math.random() > 0.5 ? cEmerald : cCyan;
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    // Card dimensions (ISO/IEC 7810 standard credit card ratio: 85.60 mm x 53.98 mm)
    const cardWidth = 3.37;
    const cardHeight = 2.125;
    const radius = 0.14;
    const thickness = 0.045;

    // Card Group
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // 1. Physical Rounded Titanium Body Slab
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
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const cardGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    cardGeometry.center();

    // Machined dark titanium edge/back
    const titaniumSlabMaterial = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      metalness: 0.94,
      roughness: 0.22,
    });

    const slabMesh = new THREE.Mesh(cardGeometry, titaniumSlabMaterial);
    cardGroup.add(slabMesh);

    // 2. High-Precision Razor-Sharp Front Face Mesh with Normalized [0, 1] UVs
    const cardTexture = createCardTexture(holderName);
    cardTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Shape geometry for exact rounded front face
    const frontShapeGeometry = new THREE.ShapeGeometry(shape, 24);
    frontShapeGeometry.center();

    // Normalizing UV coordinates to precisely map [0, 1] without distortion or clipping
    const posAttr = frontShapeGeometry.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      uvs[i * 2] = (px + cardWidth / 2) / cardWidth;
      uvs[i * 2 + 1] = (py + cardHeight / 2) / cardHeight;
    }
    frontShapeGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    const frontFaceMaterial = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      metalness: 0.84,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      iridescence: 0.85,
      iridescenceIOR: 1.35,
    });

    const frontFaceMesh = new THREE.Mesh(frontShapeGeometry, frontFaceMaterial);
    // Position front face precisely on top of the bevel
    frontFaceMesh.position.z = thickness / 2 + 0.0205;
    cardGroup.add(frontFaceMesh);

    // Mouse tracking with spring inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = nx * 0.55;
      mouse.targetY = ny * 0.45;

      // Glide keylight across the card face to highlight physical specular shine
      keyLight.position.set(nx * 5 + 3, ny * 4 + 3.5, 4.5);
    };

    const handlePointerLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      keyLight.position.set(3, 4, 4.5);
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
        // Natural floating breathing
        const floatZ = Math.sin(elapsedTime * 1.4) * 0.04;
        const floatRot = Math.cos(elapsedTime * 0.7) * 0.025;

        cardGroup.rotation.y = mouse.x * 0.85 + floatRot;
        cardGroup.rotation.x = -mouse.y * 0.7 + Math.sin(elapsedTime * 1.1) * 0.035;
        cardGroup.rotation.z = mouse.x * -0.12;
        cardGroup.position.y = floatZ;

        // Subtle slow orbit for background particles
        particleField.rotation.y = elapsedTime * 0.05;
        particleField.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;
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
      frontShapeGeometry.dispose();
      titaniumSlabMaterial.dispose();
      frontFaceMaterial.dispose();
      cardTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();

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
