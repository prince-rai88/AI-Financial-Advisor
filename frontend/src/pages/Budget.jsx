import { useEffect, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import AnimatedNumber from "../components/common/AnimatedNumber";
import { formatINR } from "../utils/currency";

const categoryColors = ["#00e599", "#38bdf8", "#fbbf24", "#a78bfa", "#fb7185", "#34d399"];

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

  const totalCategorySpend = Object.values(summary.category_breakdown).reduce(
    (s, v) => s + v,
    0
  );

  return (
    <Layout title="Budget & Forecast" onLogout={onLogout}>
      <div className="space-y-6">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. HERO PREDICTED MONTHLY BUDGET CARD                         */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="apple-card p-6 sm:p-8 border-t-2 border-t-[#00e599]/60 bg-gradient-to-br from-white/[0.04] via-transparent to-[#00e599]/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00e599] block mb-2">
                Predictive AI Forecast
              </span>
              <p className="text-xs text-white/50 font-light mb-3">
                Estimated capital allocation for next 30 days
              </p>
              {loading ? (
                <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-3">
                  <AnimatedNumber
                    value={budget.predicted_budget}
                    className="text-4xl sm:text-5xl font-light tracking-tight text-white font-mono tabular-numbers"
                  />
                  <span className="text-xs text-white/40 font-mono">/ month</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-right self-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                Model Confidence
              </span>
              <p className="text-xs text-white/90 font-medium max-w-[220px]">
                {budget.confidence_note || "Deterministic Velocity Calibration"}
              </p>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. CATEGORY ALLOCATION PROGRESS BARS                          */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="apple-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white tracking-tight">Category Limits & Velocity</h3>
              <p className="text-xs text-white/40 font-light mt-0.5">Calculated from historical transaction weights</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Distribution
            </span>
          </div>

          {Object.keys(summary.category_breakdown).length ? (
            <div className="space-y-4 pt-2">
              {Object.entries(summary.category_breakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt], idx) => {
                  const pct = totalCategorySpend > 0 ? (amt / totalCategorySpend) * 100 : 0;
                  const barColor = categoryColors[idx % categoryColors.length];

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80 font-medium">{cat}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-white/40">
                            {pct.toFixed(0)}%
                          </span>
                          <span className="font-mono tabular-numbers text-white/80 font-medium">
                            {formatINR(amt)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct.toFixed(1)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-white/40 font-light">
              Upload transactions to generate category spending limits.
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. CASH-FLOW BASELINE RECAP STATS                             */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Total Monthly Income"
            value={formatINR(summary.total_income)}
            numericValue={summary.total_income}
            helper="Gross recurring deposits"
            tone="positive"
          />

          <StatCard
            label="Total Monthly Expenses"
            value={formatINR(summary.total_expense)}
            numericValue={summary.total_expense}
            helper="Current trailing run-rate"
            tone="negative"
          />

          <StatCard
            label="Net Monthly Surplus"
            value={formatINR(summary.net_balance)}
            numericValue={summary.net_balance}
            helper="Estimated retained surplus"
            tone="highlight"
          />
        </div>
      </div>
    </Layout>
  );
}
