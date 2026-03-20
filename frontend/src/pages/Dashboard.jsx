import { useCallback, useEffect, useMemo, useState } from "react";
import { Chart as ChartJS } from "chart.js";
import { CalendarClock, Mail, ShieldCheck, TrendingDown, TrendingUp, User } from "lucide-react";
import { authApi, financeApi } from "../api";
import ChartSection from "../components/ChartSection";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import UploadSection from "../components/UploadSection";
import { formatINR } from "../utils/currency";
import { notify } from "../utils/toast";

ChartJS.defaults.color = "#9ca3af";
ChartJS.defaults.borderColor = "#1e2130";

function formatDate(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function LoadingBlock({ className = "h-20" }) {
  return <div className={`animate-pulse rounded-xl bg-bg-elevated ${className}`} />;
}

function InsightPill({ severity }) {
  const tone =
    severity === "high"
      ? "bg-red/10 text-red"
      : severity === "warning"
        ? "bg-yellow/10 text-yellow"
        : "bg-green/10 text-green";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{severity || "info"}</span>;
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
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [userError, setUserError] = useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setUserError("");
      setUserLoading(true);

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
          accountType: "Standard",
        });
      } catch (fetchError) {
        setUserDetails(null);
        const backendMessage = fetchError?.response?.data?.error || fetchError?.response?.data?.detail;
        const message =
          backendMessage ||
          "We could not load your profile details right now. Please refresh and try again.";
        setUserError(message);
        notify(message, "error");
      } finally {
        setUserLoading(false);
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error ||
        "Failed to load dashboard data. Please refresh or try again.";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalExpenses = useMemo(
    () =>
      Math.abs(
        transactions
          .filter((tx) => Number(tx.amount) < 0)
          .reduce((sum, tx) => sum + Number(tx.amount), 0)
      ),
    [transactions]
  );

  const totalStatements = useMemo(() => transactions.length, [transactions.length]);

  const monthlyTotals = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const month = String(tx.date || "").slice(0, 7);
      if (!month) return;
      map.set(month, (map.get(month) || 0) + Number(tx.amount || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const breakdown = categoryBreakdown || {};
    if (Object.keys(breakdown).length > 0) {
      return Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    }
    const map = new Map();
    transactions.forEach((tx) => {
      const category = tx.category?.name || "Uncategorized";
      map.set(category, (map.get(category) || 0) + Math.abs(Number(tx.amount || 0)));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [categoryBreakdown, transactions]);

  const recentFive = useMemo(() => {
    if (summary.recent_transactions.length > 0) return summary.recent_transactions;
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [summary.recent_transactions, transactions]);

  const stats = useMemo(
    () => [
      { label: "Total Expenses", value: formatINR(totalExpenses), helper: "Cumulative spend" },
      { label: "Uploaded Statements", value: totalStatements, helper: "Imported rows" },
      { label: "Current Balance", value: formatINR(summary.net_balance), helper: "Net account position" },
      { label: "Transactions", value: transactions.length, helper: "All records" },
    ],
    [summary.net_balance, totalExpenses, totalStatements, transactions.length]
  );

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

  const incomeChange = Number(0);
  const expenseChange = Number(0);
  const budgetData = [];

  return (
    <Layout
      title="Dashboard"
      onLogout={onLogout}
      rightSlot={
        <label
          htmlFor="upload-modal"
          className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          + Upload CSV
        </label>
      }
    >
      <input id="upload-modal" type="checkbox" className="peer hidden" />
      <div className="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 peer-checked:flex">
        <div className="w-full max-w-[680px] bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#f1f5f9]">Upload Statement</p>
            <label htmlFor="upload-modal" className="text-[12px] text-[#64748b] cursor-pointer">
              Close
            </label>
          </div>
          <UploadSection onUploadSuccess={loadDashboardData} />
        </div>
      </div>

      <section className="space-y-6">
        {error ? (
          <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-4 text-[13px] text-[#f43f5e]">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 mb-6" id="budget">
          <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#10b981] rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">Total Income</p>
                <p className="text-[32px] font-bold leading-none tracking-tight text-[#10b981] mb-2">
                  ₹{Number(summary.total_income || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#64748b]">
                  {incomeChange >= 0 ? "+" : ""}
                  {incomeChange.toFixed(1)}% vs last month
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#10b981]/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l6-6 4 4 7-7" />
                  <path d="M14 8h6v6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#f43f5e] rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">Total Expense</p>
                <p className="text-[32px] font-bold leading-none tracking-tight text-[#f43f5e] mb-2">
                  ₹{Number(summary.total_expense || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#64748b]">
                  {expenseChange >= 0 ? "+" : ""}
                  {expenseChange.toFixed(1)}% vs last month
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f43f5e]/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l6 6 4-4 7 7" />
                  <path d="M14 16h6v-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#161b27] border border-white/[0.07] border-t-2 border-t-[#6c63ff] rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[1px] text-[#64748b] font-medium mb-3">Net Balance</p>
                <p className="text-[32px] font-bold leading-none tracking-tight text-[#f1f5f9] mb-2">
                  ₹{Number(summary.net_balance || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#64748b]">Savings rate {savingsRate}%</p>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#6c63ff]/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h18v10H3z" />
                  <path d="M7 7V5h10v2" />
                  <circle cx="16" cy="12" r="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[13px] font-semibold text-[#f1f5f9] mb-4">Spending by category</p>
            {categoryTotals.length ? (
              categoryTotals.map(([category, amount]) => (
                <div key={category} className="flex items-center gap-3 mb-3">
                  <span className="text-[12px] text-[#64748b] w-24 flex-shrink-0">{category}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6c63ff]"
                      style={{ width: `${Math.min(100, (Math.abs(amount) / categoryMax) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-[#64748b] w-16 text-right">
                    ₹{Number(amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#64748b]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19V5" />
                    <path d="M10 19V9" />
                    <path d="M16 19V12" />
                    <path d="M22 19V7" />
                  </svg>
                </div>
                <p className="text-[13px] text-[#f1f5f9] font-medium">No data yet</p>
                <p className="text-[12px] text-[#64748b]">Upload a CSV to see category breakdown</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4" id="insights">
            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-[#f1f5f9] mb-3">AI Insights</p>
              {insightsData.recommendation && (
                <div className="bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded-xl px-3 py-3 mb-3 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#6c63ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  </div>
                  <p className="text-[12px] text-[#94a3b8] leading-relaxed">
                    {insightsData.recommendation}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1">Savings rate</p>
                  <p
                    className={`text-[15px] font-bold ${
                      insightsData.savings_rate >= 20
                        ? "text-[#10b981]"
                        : insightsData.savings_rate >= 10
                          ? "text-[#fbbf24]"
                          : "text-[#f43f5e]"
                    }`}
                  >
                    {Number(insightsData.savings_rate || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1">Top category</p>
                  <p className="text-[13px] font-semibold text-[#f1f5f9] truncate">
                    {insightsData.highest_spending_category || "—"}
                  </p>
                </div>
              </div>

              {!insightsData.recommendation && (
                <p className="text-[12px] text-[#64748b] text-center py-4">
                  Insights will appear after upload
                </p>
              )}
            </div>

            <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-[#f1f5f9] mb-3">Anomalies</p>
              {insightsData.unusual_transactions.length ? (
                insightsData.unusual_transactions.slice(0, 3).map((tx, index) => (
                  <div
                    key={tx.id || index}
                    className="flex items-start justify-between py-2.5 border-b border-white/[0.04] last:border-0 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#94a3b8] truncate">
                        {tx.description || "Unusual transaction"}
                      </p>
                      <p className="text-[10px] text-[#64748b] mt-0.5">{tx.date}</p>
                    </div>
                    <span className="text-[12px] text-[#f43f5e] font-semibold flex-shrink-0">
                      −₹{Math.abs(Number(tx.amount || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#64748b]">No unusual activity detected</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#f1f5f9]">Budget prediction</p>
            <span className="text-[11px] text-[#64748b] bg-white/5 px-2 py-1 rounded-lg">Next 30 days</span>
          </div>
          {Array.isArray(budgetData) && budgetData.length ? (
            <div className="space-y-3">
              {budgetData.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
                  <span className="text-[12px] text-[#94a3b8]">{item.category}</span>
                  <span className="text-[12px] text-[#f1f5f9] font-semibold">
                    ₹{Number(item.suggested_budget || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4 py-3">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-[#6c63ff] rounded-full" />
              </div>
              <span className="text-[12px] text-[#64748b] flex-shrink-0">
                Upload data to generate prediction
              </span>
            </div>
          )}
        </div>

        {transactions.length > 0 && <ChartSection transactions={transactions} />}

        {hasTransactions ? (
          <div id="transactions">
            <TransactionTable transactions={transactions} loading={loading} />
          </div>
        ) : null}
      </section>
    </Layout>
  );
}
