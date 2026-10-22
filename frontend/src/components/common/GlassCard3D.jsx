import { useRef, useState } from "react";

export default function GlassCard3D({
  children,
  className = "",
  variant = "primary", // "primary" | "secondary" | "highlight"
  tilt = true,
  maxTilt = 8,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMouseMove = (e) => {
    if (!tilt || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`,
      transition: "transform 0.1s ease-out",
    });

    setSpotlight({
      x,
      y,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    if (!tilt || prefersReducedMotion) return;
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
    });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const variantClasses = {
    primary:
      "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] border-t-white/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
    secondary:
      "bg-white/[0.025] backdrop-blur-xl border border-white/[0.06] border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
    highlight:
      "bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-[#00e599]/[0.05] backdrop-blur-2xl border border-white/[0.08] border-t-[#00e599]/60 shadow-[0_8px_32px_rgba(0,229,153,0.06)]",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 will-change-transform ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {/* Specular Spotlight Reflection Layer */}
      {tilt && !prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: spotlight.opacity,
            background: `radial-gradient(circle 240px at ${spotlight.x}px ${spotlight.y}px, rgba(255, 255, 255, 0.12), transparent 80%)`,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
}
