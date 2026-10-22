import GlassCard3D from "./common/GlassCard3D";
import AnimatedNumber from "./common/AnimatedNumber";

export default function StatCard({
  label,
  value,
  numericValue,
  helper,
  tone = "default",
  icon,
}) {
  const getToneStyle = () => {
    switch (tone) {
      case "positive":
        return {
          indicator: "text-[#00e599]",
          bg: "bg-[#00e599]/10",
          border: "border-t-[#00e599]/60",
          variant: "highlight",
        };
      case "negative":
        return {
          indicator: "text-[#fb7185]",
          bg: "bg-[#fb7185]/10",
          border: "border-t-[#fb7185]/60",
          variant: "primary",
        };
      case "highlight":
        return {
          indicator: "text-[#38bdf8]",
          bg: "bg-[#38bdf8]/10",
          border: "border-t-[#38bdf8]/60",
          variant: "highlight",
        };
      default:
        return {
          indicator: "text-white/90",
          bg: "bg-white/5",
          border: "border-t-white/20",
          variant: "primary",
        };
    }
  };

  const style = getToneStyle();

  return (
    <GlassCard3D
      variant={style.variant}
      tilt={true}
      maxTilt={6}
      className={`p-6 border-t-2 ${style.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">
            {label}
          </p>
          <div className={`text-2xl sm:text-3xl font-light tracking-tight ${style.indicator}`}>
            {numericValue !== undefined ? (
              <AnimatedNumber value={numericValue} />
            ) : (
              <span className="tabular-numbers">{value}</span>
            )}
          </div>
          {helper && (
            <p className="text-xs text-white/50 font-light mt-2.5 flex items-center gap-1.5">
              {helper}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`w-9 h-9 rounded-xl ${style.bg} ${style.indicator} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm`}
          >
            {icon}
          </div>
        )}
      </div>
    </GlassCard3D>
  );
}
