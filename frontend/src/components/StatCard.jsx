const toneClasses = [
  "from-teal-50 to-cyan-50 text-teal-900 border-teal-100",
  "from-sky-50 to-blue-50 text-sky-900 border-sky-100",
  "from-amber-50 to-orange-50 text-amber-900 border-amber-100",
  "from-emerald-50 to-teal-50 text-emerald-900 border-emerald-100",
];

export default function StatCard({ label, value, helper, index = 0 }) {
  const tone = toneClasses[index % toneClasses.length];

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Summary</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}
