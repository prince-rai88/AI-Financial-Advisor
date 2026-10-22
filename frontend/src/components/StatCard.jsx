export default function StatCard({ label, value, helper, tone = "default", icon }) {
  const getToneStyle = () => {
    switch (tone) {
      case "positive":
        return {
          indicator: "text-[#00e599]",
          bg: "bg-[#00e599]/10",
          border: "border-t-[#00e599]/60",
        };
      case "negative":
        return {
          indicator: "text-[#f43f5e]",
          bg: "bg-[#f43f5e]/10",
          border: "border-t-[#f43f5e]/60",
        };
      case "highlight":
        return {
          indicator: "text-[#38bdf8]",
          bg: "bg-[#38bdf8]/10",
          border: "border-t-[#38bdf8]/60",
        };
      default:
        return {
          indicator: "text-white/90",
          bg: "bg-white/5",
          border: "border-t-white/20",
        };
    }
  };

  const style = getToneStyle();

  return (
    <article className={`apple-card p-5 relative overflow-hidden group border-t-2 ${style.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-light tracking-tight tabular-numbers ${style.indicator}`}>
            {value}
          </p>
          {helper && (
            <p className="text-xs text-white/50 font-light mt-2 flex items-center gap-1.5">
              {helper}
            </p>
          )}
        </div>

        {icon && (
          <div className={`w-8 h-8 rounded-xl ${style.bg} ${style.indicator} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
            {icon}
          </div>
        )}
      </div>
    </article>
  );
}
