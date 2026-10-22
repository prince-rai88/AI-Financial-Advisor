export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-white/50 font-mono">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#00e599]" />
      <span>{label}</span>
    </div>
  );
}
