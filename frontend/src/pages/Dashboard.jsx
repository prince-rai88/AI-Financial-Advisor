import { useEffect, useState } from "react";
import API from "../api";
import StatCard from "../components/StatCard";
import ChartSection from "../components/ChartSection";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });

  useEffect(() => {
    API.get("summary/").then((res) => setStats(res.data.stats));
    API.get("transactions/").then((res) => {
      setChartData({
        labels: res.data.map((t) => t.date),
        values: res.data.map((t) => t.amount),
      });
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">
        Dashboard
      </h1>
      <div className="flex flex-wrap gap-6">
        {stats.map((s, idx) => (
          <StatCard key={idx} title={s.title} value={s.value} />
        ))}
      </div>
      <ChartSection data={chartData} />
    </div>
  );
}