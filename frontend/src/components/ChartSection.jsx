import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { formatINR } from "../utils/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const pieColors = ["#0f766e", "#0ea5e9", "#22c55e", "#f59e0b", "#6366f1", "#f97316", "#ef4444"];

function toCurrency(value) {
  return formatINR(value, { maximumFractionDigits: 0 });
}

export default function ChartSection({ transactions }) {
  const expenseByMonth = {};
  const expenseByCategory = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    if (amount >= 0) return;

    const month = String(tx.date || "").slice(0, 7);
    const category = tx.category || "Uncategorized";
    expenseByMonth[month] = (expenseByMonth[month] || 0) + Math.abs(amount);
    expenseByCategory[category] = (expenseByCategory[category] || 0) + Math.abs(amount);
  });

  const monthlyEntries = Object.entries(expenseByMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const categoryEntries = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  if (!monthlyEntries.length && !categoryEntries.length) {
    return (
      <section className="surface-card mt-6 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Expense Visualizations</h2>
        <p className="mt-2 text-sm text-slate-600">Upload statements to unlock monthly and category insights.</p>
      </section>
    );
  }

  const lineData = {
    labels: monthlyEntries.map(([month]) => month),
    datasets: [
      {
        label: "Monthly Expenses",
        data: monthlyEntries.map(([, amount]) => amount),
        fill: true,
        borderWidth: 2,
        borderColor: "#0f766e",
        backgroundColor: "rgba(45, 212, 191, 0.18)",
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: "#0b5d57",
        tension: 0.35,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#334155",
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${toCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#64748b",
          callback: (value) => toCurrency(value),
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
  };

  const pieData = {
    labels: categoryEntries.map(([category]) => category),
    datasets: [
      {
        label: "Expenses by Category",
        data: categoryEntries.map(([, amount]) => amount),
        backgroundColor: categoryEntries.map((_, index) => pieColors[index % pieColors.length]),
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#334155" },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${toCurrency(context.raw)}`,
        },
      },
    },
  };

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <article className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-teal-50/40 p-6 shadow-lg shadow-slate-900/5 lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Monthly Expense Trend</h3>
        <p className="text-sm text-slate-600">Track spending patterns over time</p>
        <div className="mt-4 h-80 w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </article>

      <article className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-sky-50/40 p-6 shadow-lg shadow-slate-900/5">
        <h3 className="text-lg font-semibold text-slate-900">Expense Categories</h3>
        <p className="text-sm text-slate-600">Distribution of expenses by category</p>
        <div className="mt-4 h-80 w-full">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </article>
    </section>
  );
}
