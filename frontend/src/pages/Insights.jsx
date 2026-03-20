import { useCallback, useEffect, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";
import ChartSection from "../components/ChartSection";

export default function Insights({ onLogout }) {
  const [insights, setInsights] = useState({
    highest_spending_category: "",
    unusual_transactions: [],
    savings_rate: 0,
    recommendation: "",
  });
  const [budget, setBudget] = useState({ predicted_budget: 0, confidence_note: "" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [iRes, bRes, tRes] = await Promise.all([
        financeApi.fetchInsights(),
        financeApi.fetchBudget(),
        financeApi.fetchTransactions(),
      ]);
      setInsights({
        highest_spending_category: iRes.data?.highest_spending_category || "",
        unusual_transactions: Array.isArray(iRes.data?.unusual_transactions)
          ? iRes.data.unusual_transactions
          : [],
        savings_rate: iRes.data?.savings_rate || 0,
        recommendation: iRes.data?.recommendation || "",
      });
      setBudget({
        predicted_budget: bRes.data?.predicted_budget || 0,
        confidence_note: bRes.data?.confidence_note || "",
      });
      setTransactions(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (e) {
      setError("Failed to load insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <Layout title="Insights" onLogout={onLogout}>
      {error && (
        <div className="mb-4 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-xl px-4 py-3 text-[13px] text-[#f43f5e]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-[#161b27] border border-white/[0.07] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">
                Savings rate
              </p>
              <p
                className={`text-[28px] font-bold leading-none mb-2 ${
                  insights.savings_rate >= 20
                    ? "text-[#10b981]"
                    : insights.savings_rate >= 10
                      ? "text-[#fbbf24]"
                      : "text-[#f43f5e]"
                }`}
              >
                {Number(insights.savings_rate).toFixed(1)}%
              </p>
              <p className="text-[11px] text-[#64748b]">
                {insights.savings_rate >= 20
                  ? "Great — keep it up"
                  : insights.savings_rate >= 10
                    ? "Room for improvement"
                    : "Below recommended 20%"}
              </p>
            </div>

            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">
                Top category
              </p>
              <p className="text-[20px] font-bold leading-none text-[#f1f5f9] mb-2 truncate">
                {insights.highest_spending_category || "—"}
              </p>
              <p className="text-[11px] text-[#64748b]">Highest spend area</p>
            </div>

            <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#6c63ff] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">
                Predicted budget
              </p>
              <p className="text-[22px] font-bold leading-none text-[#6c63ff] mb-2">
                ₹{Number(budget.predicted_budget).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#64748b]">Next 30 days</p>
            </div>

            <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#f43f5e] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">
                Anomalies
              </p>
              <p className="text-[28px] font-bold leading-none text-[#f43f5e] mb-2">
                {insights.unusual_transactions.length}
              </p>
              <p className="text-[11px] text-[#64748b]">Unusual transactions</p>
            </div>
          </div>

          {insights.recommendation && (
            <div className="bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#6c63ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6c63ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#f1f5f9] mb-1">AI recommendation</p>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                  {insights.recommendation}
                </p>
              </div>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mb-6">
              <ChartSection transactions={transactions} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-[#f1f5f9] mb-1">Budget prediction</p>
              <p className="text-[12px] text-[#64748b] mb-4">
                Based on last 3 months of expenses
              </p>
              <div className="flex items-end gap-3 mb-3">
                <p className="text-[32px] font-bold text-[#6c63ff] leading-none">
                  ₹{Number(budget.predicted_budget).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#64748b] pb-1">/ month</p>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <p className="text-[11px] text-[#64748b]">
                  {budget.confidence_note || "No confidence data"}
                </p>
              </div>
            </div>

            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-[#f1f5f9] mb-4">
                Unusual transactions
              </p>
              {insights.unusual_transactions.length ? (
                <div className="space-y-1">
                  {insights.unusual_transactions.map((tx, i) => (
                    <div
                      key={tx.id || i}
                      className="flex items-start justify-between gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#f1f5f9] truncate font-medium">
                          {tx.description}
                        </p>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          {tx.date} · {tx.category}
                        </p>
                        <p className="text-[10px] text-[#64748b]/70 mt-0.5 italic">
                          {tx.reason}
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-[#f43f5e] flex-shrink-0">
                        −₹{Math.abs(Number(tx.amount)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-[#f1f5f9]">All clear</p>
                  <p className="text-[12px] text-[#64748b]">
                    No unusual transactions detected
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
