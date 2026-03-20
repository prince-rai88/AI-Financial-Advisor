import { useEffect, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";

export default function Budget({ onLogout }) {
  const [budget, setBudget] = useState({ predicted_budget: 0, confidence_note: "" });
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    category_breakdown: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([financeApi.fetchBudget(), financeApi.fetchSummary()])
      .then(([bRes, sRes]) => {
        if (!active) return;
        setBudget({
          predicted_budget: bRes.data?.predicted_budget || 0,
          confidence_note: bRes.data?.confidence_note || "",
        });
        setSummary({
          total_income: sRes.data?.total_income || 0,
          total_expense: sRes.data?.total_expense || 0,
          net_balance: sRes.data?.net_balance || 0,
          category_breakdown: sRes.data?.category_breakdown || {},
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout title="Budget" onLogout={onLogout}>
      <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#6c63ff] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-2">
              Predicted monthly budget
            </p>
            {loading ? (
              <div className="h-10 w-40 bg-white/5 rounded-xl animate-pulse" />
            ) : (
              <p className="text-[40px] font-bold text-[#6c63ff] leading-none">
                ₹{Number(budget.predicted_budget).toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-[12px] text-[#64748b] mt-2">
              Estimated spend for next 30 days
            </p>
          </div>
          <div className="bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded-2xl px-4 py-3 text-right">
            <p className="text-[11px] text-[#64748b] mb-1">Confidence</p>
            <p className="text-[12px] text-[#f1f5f9] font-medium max-w-[200px]">
              {budget.confidence_note || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5 mb-6">
        <p className="text-[13px] font-semibold text-[#f1f5f9] mb-4">
          Expense breakdown by category
        </p>
        {Object.keys(summary.category_breakdown).length ? (
          Object.entries(summary.category_breakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => {
              const total = Object.values(summary.category_breakdown).reduce((s, v) => s + v, 0);
              const pct = total > 0 ? (amt / total) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3 mb-3">
                  <span className="text-[12px] text-[#64748b] w-28 flex-shrink-0">
                    {cat}
                  </span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6c63ff] transition-all duration-700"
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-[#64748b] w-8 text-right flex-shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="text-[12px] font-medium text-[#f1f5f9] w-24 text-right flex-shrink-0">
                    ₹{Number(amt).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })
        ) : (
          <p className="text-[12px] text-[#64748b] py-4 text-center">
            Upload transactions to see category breakdown
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total income", value: summary.total_income, color: "#10b981" },
          { label: "Total expenses", value: summary.total_expense, color: "#f43f5e" },
          { label: "Net balance", value: summary.net_balance, color: "#f1f5f9" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">
              {stat.label}
            </p>
            <p className="text-[22px] font-bold leading-none" style={{ color: stat.color }}>
              ₹{Number(stat.value || 0).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
