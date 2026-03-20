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

const pieColors = ["#6c63ff", "#22c55e", "#fbbf24", "#38bdf8", "#ef4444", "#9ca3af", "#5a52e0"];

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
      <section className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
        <h2 className="text-[13px] font-semibold text-[#f1f5f9]">Expense Visualizations</h2>
        <p className="text-[12px] text-[#64748b] mt-1">
          Upload statements to unlock monthly and category insights.
        </p>
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
        borderColor: "#6c63ff",
        backgroundColor: "rgba(108,99,255,0.08)",
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6c63ff",
        pointBorderColor: "#0a0c12",
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#64748b",
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#1c2235",
        borderColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${toCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: "#64748b",
          callback: (value) => toCurrency(value),
        },
        grid: {
          color: "rgba(255,255,255,0.04)",
        },
        border: { display: false },
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
        borderColor: "#1e2130",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#64748b", boxWidth: 10, padding: 16 },
      },
      tooltip: {
        backgroundColor: "#1c2235",
        borderColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${toCurrency(context.raw)}`,
        },
      },
    },
  };

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <article className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5 lg:col-span-2">
        <h3 className="text-[13px] font-semibold text-[#f1f5f9] mb-0.5">Monthly Expense Trend</h3>
        <p className="text-[12px] text-[#64748b] mb-4">Track spending patterns over time</p>
        <div className="mt-4 h-72 w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </article>

      <article className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-[13px] font-semibold text-[#f1f5f9] mb-0.5">Expense Categories</h3>
        <p className="text-[12px] text-[#64748b] mb-4">Distribution of expenses by category</p>
        <div className="mt-4 h-72 w-full">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </article>
    </section>
  );
}
