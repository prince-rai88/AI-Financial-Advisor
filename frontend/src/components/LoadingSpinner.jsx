export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-sm text-text-muted">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
      <span>{label}</span>
    </div>
  );
}
