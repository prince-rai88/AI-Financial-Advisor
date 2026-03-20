const toneClasses = [
  "border-border-subtle text-text-primary",
  "border-border-subtle text-text-primary",
  "border-border-subtle text-text-primary",
  "border-border-subtle text-text-primary",
];

export default function StatCard({ label, value, helper, index = 0 }) {
  const tone = toneClasses[index % toneClasses.length];

  return (
    <article className={`rounded-xl border bg-bg-surface p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Summary</p>
      <p className="mt-2 text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {helper ? <p className="mt-1 text-xs text-text-muted">{helper}</p> : null}
    </article>
  );
}
