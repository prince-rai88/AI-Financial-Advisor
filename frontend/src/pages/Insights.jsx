import { useCallback, useEffect, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";
import ChartSection from "../components/ChartSection";
import StatCard from "../components/StatCard";
import { formatINR } from "../utils/currency";

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
    } catch {
      setError("Failed to load insights. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <Layout title="AI Financial Intelligence" onLogout={onLogout}>
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/25 text-xs text-[#f43f5e]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 apple-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* 1. TOP METRIC CHIPS                                           */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Savings Velocity"
              value={`${Number(insights.savings_rate).toFixed(1)}%`}
              helper={
                insights.savings_rate >= 20
                  ? "Optimal surplus rate"
                  : insights.savings_rate >= 10
                  ? "Moderate savings"
                  : "Below target reserve"
              }
              tone={
                insights.savings_rate >= 20
                  ? "positive"
                  : insights.savings_rate >= 10
                  ? "highlight"
                  : "negative"
              }
            />

            <StatCard
              label="Peak Outflow Bucket"
              value={insights.highest_spending_category || "None"}
              helper="Highest expenditure domain"
              tone="default"
            />

            <StatCard
              label="30-Day Budget Target"
              value={formatINR(budget.predicted_budget)}
              numericValue={budget.predicted_budget}
              helper="Algorithmic run-rate limit"
              tone="positive"
            />

            <StatCard
              label="Flagged Outliers"
              value={insights.unusual_transactions.length}
              helper="IsolationForest anomalies"
              tone={insights.unusual_transactions.length > 0 ? "negative" : "positive"}
            />
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 2. APPLE INTELLIGENCE SYNTHESIS CARD                          */}
          {/* ───────────────────────────────────────────────────────────── */}
          {insights.recommendation ? (
            <div className="apple-card p-6 relative overflow-hidden bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-[#00e599]/[0.05] border-t-2 border-t-[#00e599]/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#00e599]">
                    Synthesis & Advisory
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  Confidence: {budget.confidence_note ? "Calibrated" : "Active"}
                </span>
              </div>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                "{insights.recommendation}"
              </p>
            </div>
          ) : null}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 3. CHARTS VISUALIZATION                                       */}
          {/* ───────────────────────────────────────────────────────────── */}
          {transactions.length > 0 && <ChartSection transactions={transactions} />}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 4. BUDGET PREDICTION & ANOMALIES SPLIT                        */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Projected Run-Rate */}
            <div className="apple-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white tracking-tight">Algorithmic Forecast</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.08]">
                    Regression Model
                  </span>
                </div>
                <p className="text-xs text-white/40 font-light mb-4">
                  Estimated 30-day requirement derived from trailing transaction patterns
                </p>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Monthly Target
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light tracking-tight font-mono tabular-numbers text-[#00e599]">
                      {formatINR(budget.predicted_budget)}
                    </span>
                    <span className="text-xs text-white/40 font-mono">/ 30 days</span>
                  </div>
                </div>
              </div>

              {budget.confidence_note && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-white/60 font-light">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e599" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>{budget.confidence_note}</span>
                </div>
              )}
            </div>

            {/* Anomaly Outliers Table */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white tracking-tight">Outlier Watchdog</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/20">
                  {insights.unusual_transactions.length} Flagged
                </span>
              </div>
              <p className="text-xs text-white/40 font-light mb-4">
                Statistically irregular expenditures requiring review
              </p>

              {insights.unusual_transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {insights.unusual_transactions.map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      className="p-3.5 rounded-xl bg-[#fb7185]/[0.05] border border-[#fb7185]/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/90 truncate">
                          {tx.description || "Unusual transaction"}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 mt-0.5">{tx.date}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#fb7185] whitespace-nowrap">
                        −{formatINR(Math.abs(Number(tx.amount || 0)))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-white/40 font-light">
                  No statistical anomalies or unusual deviations found in current ledger.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
