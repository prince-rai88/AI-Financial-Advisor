import { useCallback, useEffect, useMemo, useState } from "react";
import { Chart as ChartJS } from "chart.js";
import { motion } from "framer-motion";
import { authApi, financeApi } from "../api";
import ChartSection from "../components/ChartSection";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import UploadSection from "../components/UploadSection";
import { notify } from "../utils/toast";
import { formatINR } from "../utils/currency";

ChartJS.defaults.color = "rgba(255, 255, 255, 0.4)";
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.05)";

function formatDate(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function Dashboard({ onLogout }) {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    recent_transactions: [],
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [insightsData, setInsightsData] = useState({
    highest_spending_category: "",
    unusual_transactions: [],
    savings_rate: 0,
    recommendation: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, transactionsRes, insightsRes] = await Promise.all([
        financeApi.fetchSummary(),
        financeApi.fetchTransactions(),
        financeApi.fetchInsights(),
      ]);

      const tx = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
      setTransactions(tx);

      setSummary({
        total_income: summaryRes.data?.total_income || 0,
        total_expense: summaryRes.data?.total_expense || 0,
        net_balance: summaryRes.data?.net_balance || 0,
        recent_transactions: Array.isArray(summaryRes.data?.recent_transactions)
          ? summaryRes.data.recent_transactions
          : [],
      });
      setCategoryBreakdown(summaryRes.data?.category_breakdown || {});

      setInsightsData({
        highest_spending_category: insightsRes.data?.highest_spending_category || "",
        unusual_transactions: Array.isArray(insightsRes.data?.unusual_transactions)
          ? insightsRes.data.unusual_transactions
          : [],
        savings_rate: insightsRes.data?.savings_rate || 0,
        recommendation: insightsRes.data?.recommendation || "",
      });

      try {
        const userRes = await authApi.fetchUser();
        const userData = userRes.data || {};
        setUserDetails({
          name: userData.username || "Unavailable",
          email: userData.email || "Unavailable",
          createdAt: userData.date_joined,
          accountType: userData.accountType || (userData.is_guest ? "Guest Demo (Read-Only)" : "Standard Member"),
        });
      } catch (fetchError) {
        setUserDetails(null);
        const backendMessage = fetchError?.response?.data?.error || fetchError?.response?.data?.detail;
        const message =
          backendMessage ||
          "Could not load profile details right now.";
        notify(message, "error");
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error ||
        "Failed to load dashboard data. Please refresh.";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const categoryTotals = useMemo(() => {
    const breakdown = categoryBreakdown || {};
    if (Object.keys(breakdown).length > 0) {
      return Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    }
    const map = new Map();
    transactions.forEach((tx) => {
      const category =
        (typeof tx.category === "object" && tx.category !== null
          ? tx.category.name
          : tx.category) || "Uncategorized";
      map.set(category, (map.get(category) || 0) + Math.abs(Number(tx.amount || 0)));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [categoryBreakdown, transactions]);

  const hasTransactions = transactions.length > 0;

  const initials = (userDetails?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const savingsRate =
    summary.total_income > 0 ? ((summary.net_balance / summary.total_income) * 100).toFixed(1) : "0.0";

  const categoryMax = Math.max(
    1,
    ...categoryTotals.map(([, amount]) => Math.abs(Number(amount) || 0))
  );

  return (
    <Layout
      title="Financial Overview"
      onLogout={onLogout}
      rightSlot={
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 bg-white hover:bg-white/95 text-black text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-[0_2px_12px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Upload CSV</span>
        </button>
      }
    >
      {/* Upload Statement Frosted Dialog Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-[620px] bg-[#0c0e14] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white tracking-tight">Statement Ingestion</p>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <UploadSection
              onUploadSuccess={() => {
                loadDashboardData();
                setUploadModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {error ? (
          <div className="p-4 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/25 text-xs text-[#f43f5e] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. PRIMARY METRIC STAT CARDS WITH 3D TILT & COUNTING ANIMATION */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="budget">
          <StatCard
            label="Total Inflow"
            value={formatINR(summary.total_income)}
            numericValue={summary.total_income}
            helper="Monthly aggregate credits"
            tone="positive"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            }
          />

          <StatCard
            label="Total Outflow"
            value={formatINR(summary.total_expense)}
            numericValue={summary.total_expense}
            helper="Monthly aggregate debits"
            tone="negative"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            }
          />

          <StatCard
            label="Net Surplus / Reserve"
            value={formatINR(summary.net_balance)}
            numericValue={summary.net_balance}
            helper={`Calculated savings rate: ${savingsRate}%`}
            tone="highlight"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          />
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. CATEGORY BREAKDOWN & AI INTELLIGENCE GRID                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Category Progress Bars */}
          <div className="lg:col-span-7 apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-white tracking-tight">Spending by Category</h3>
                <p className="text-xs text-white/40 font-light mt-0.5">Top expenditure vectors</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Ranked
              </span>
            </div>

            {categoryTotals.length ? (
              <div className="space-y-4 pt-2">
                {categoryTotals.map(([category, amount], idx) => {
                  const colors = ["#00e599", "#38bdf8", "#fbbf24", "#a78bfa", "#fb7185"];
                  const barColor = colors[idx % colors.length];
                  const percentage = Math.min(100, (Math.abs(amount) / categoryMax) * 100);

                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80 font-medium">{category}</span>
                        <span className="font-mono tabular-numbers text-white/60">
                          {formatINR(Math.abs(amount))}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-white/70">No category transactions</p>
                <p className="text-[11px] text-white/40 mt-0.5">Upload a statement to populate categories</p>
              </div>
            )}
          </div>

          {/* AI Insights & Anomaly Panel */}
          <div className="lg:col-span-5 flex flex-col gap-5" id="insights">
            {/* AI Insights Card */}
            <div className="apple-card p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.04] via-transparent to-[#00e599]/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
                  <h3 className="text-sm font-medium text-white tracking-tight">AI Financial Counsel</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20">
                  Active
                </span>
              </div>

              {/* Telemetry Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e599]" />
                  <span className="text-xs text-white/70 font-mono">Ledger Health</span>
                </div>
                <span className="text-[11px] font-mono text-[#00e599] font-medium">Calibrated & Active</span>
              </div>

              {insightsData.recommendation ? (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-4">
                  <p className="text-xs text-white/80 leading-relaxed font-light">
                    "{insightsData.recommendation}"
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Savings Ratio
                  </span>
                  <span
                    className={`text-base font-semibold font-mono tabular-numbers ${
                      insightsData.savings_rate >= 20
                        ? "text-[#00e599]"
                        : insightsData.savings_rate >= 10
                        ? "text-[#fbbf24]"
                        : "text-[#fb7185]"
                    }`}
                  >
                    {Number(insightsData.savings_rate || 0).toFixed(1)}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                    Peak Outflow
                  </span>
                  <span className="text-xs font-medium text-white/90 truncate block">
                    {insightsData.highest_spending_category || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Anomaly Detection Reticle Card */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white tracking-tight">Anomaly Watchdog</h3>
                <span className="text-[10px] font-mono text-white/40">IsolationForest</span>
              </div>

              {insightsData.unusual_transactions.length ? (
                <div className="space-y-2.5">
                  {insightsData.unusual_transactions.slice(0, 3).map((tx, index) => (
                    <div
                      key={tx.id || index}
                      className="p-3 rounded-xl bg-[#fb7185]/[0.05] border border-[#fb7185]/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-white/90 font-medium truncate">
                          {tx.description || "Unusual expenditure"}
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
                <div className="py-5 text-center text-xs text-white/40 font-light">
                  No statistical anomalies or unusual deviations flagged.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. CHART VISUALIZATIONS SECTION                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {transactions.length > 0 && <ChartSection transactions={transactions} />}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. RECENT LEDGER TRANSACTIONS                                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        {hasTransactions ? (
          <div id="transactions">
            <TransactionTable transactions={transactions} loading={loading} />
          </div>
        ) : null}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 5. USER PROFILE & SESSION FOOTER CARD                         */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div id="profile" className="apple-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-white font-mono font-semibold text-sm shadow-inner">
                {initials || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{userDetails?.name || "User Profile"}</p>
                <p className="text-xs text-white/40 font-mono">{userDetails?.email || "No email bound"}</p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-mono px-3 py-1 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.08]">
              {userDetails?.accountType || "Standard Session"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
            <div>
              <span className="text-white/40 block mb-1 font-mono uppercase text-[10px]">Membership Inception</span>
              <span className="text-white/80 font-medium">{formatDate(userDetails?.createdAt)}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1 font-mono uppercase text-[10px]">Session Security</span>
              <span className="text-[#00e599] font-mono font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e599]" />
                Authenticated & Isolated
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
