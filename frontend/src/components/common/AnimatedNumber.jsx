import { useEffect, useRef, useState } from "react";
import { formatINR } from "../../utils/currency";

export default function AnimatedNumber({
  value = 0,
  duration = 900,
  prefix = "",
  className = "",
}) {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const startVal = prevTargetRef.current;
    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numericValue - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        prevTargetRef.current = numericValue;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [numericValue, duration]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <span className={`font-mono tabular-numbers ${className}`}>
      {prefix}
      {formatINR(prefersReduced ? numericValue : displayValue)}
    </span>
  );
}
