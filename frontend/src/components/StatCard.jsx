export default function StatCard({ title, value }) {
  return (
    <div className="card w-60">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold text-indigo-600 mt-2">{value}</h2>
    </div>
  );
}