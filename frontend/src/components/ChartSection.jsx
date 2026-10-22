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
import { Doughnut, Line } from "react-chartjs-2";
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

const applePalette = [
  "#00e599", // Emerald
  "#38bdf8", // Sapphire
  "#fbbf24", // Amber
  "#a78bfa", // Violet
  "#fb7185", // Coral
  "#94a3b8", // Slate
  "#34d399", // Mint
];

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
    const category =
      typeof tx.category === "object" && tx.category !== null
        ? tx.category.name || "Uncategorized"
        : tx.category || "Uncategorized";
    expenseByMonth[month] = (expenseByMonth[month] || 0) + Math.abs(amount);
    expenseByCategory[category] = (expenseByCategory[category] || 0) + Math.abs(amount);
  });

  const monthlyEntries = Object.entries(expenseByMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const categoryEntries = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  if (!monthlyEntries.length && !categoryEntries.length) {
    return (
      <section className="apple-card p-6">
        <h2 className="text-sm font-medium text-white">Expense Visualizations</h2>
        <p className="text-xs text-white/50 mt-1 font-light">
          Upload statements to unlock monthly trends and category allocation.
        </p>
      </section>
    );
  }

  const lineData = {
    labels: monthlyEntries.map(([month]) => month),
    datasets: [
      {
        label: "Monthly Outflow",
        data: monthlyEntries.map(([, amount]) => amount),
        fill: true,
        borderWidth: 2,
        borderColor: "#00e599",
        backgroundColor: "rgba(0, 229, 153, 0.08)",
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#00e599",
        pointBorderColor: "#07090e",
        pointBorderWidth: 2,
        tension: 0.35,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(12, 16, 24, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        titleColor: "#f8fafc",
        titleFont: { size: 12, weight: "600" },
        bodyColor: "#00e599",
        bodyFont: { size: 13, weight: "bold" },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` Outflow: ${toCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10, family: "monospace" },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: { size: 10, family: "monospace" },
          callback: (value) => toCurrency(value),
        },
      },
    },
  };

  const doughnutData = {
    labels: categoryEntries.map(([category]) => category),
    datasets: [
      {
        data: categoryEntries.map(([, amount]) => amount),
        backgroundColor: applePalette.slice(0, categoryEntries.length),
        borderWidth: 2,
        borderColor: "#07090e",
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgba(255, 255, 255, 0.6)",
          font: { size: 11 },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(12, 16, 24, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        titleColor: "#f8fafc",
        titleFont: { size: 12, weight: "600" },
        bodyColor: "#94a3b8",
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` ${toCurrency(context.parsed)}`,
        },
      },
    },
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Monthly Velocity Curve */}
      <div className="lg:col-span-7 apple-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Spending Velocity</h3>
            <p className="text-xs text-white/40 font-light mt-0.5">Historical monthly outflow aggregation</p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/50">
            Trend
          </span>
        </div>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Doughnut Allocation Ring */}
      <div className="lg:col-span-5 apple-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Category Allocation</h3>
            <p className="text-xs text-white/40 font-light mt-0.5">Distribution across spending buckets</p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/50">
            Ratio
          </span>
        </div>
        <div className="h-64 flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </section>
  );
}
