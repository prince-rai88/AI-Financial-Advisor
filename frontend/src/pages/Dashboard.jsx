import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Mail, ShieldCheck, User } from "lucide-react";
import API from "../api";
import ChartSection from "../components/ChartSection";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import UploadSection from "../components/UploadSection";
import { getAuthHeaders } from "../utils/auth";
import { formatINR } from "../utils/currency";

function formatDate(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
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

      const [summaryRes, transactionsRes] = await Promise.all([
        API.get("summary/"),
        API.get("transactions/"),
      ]);

      const tx = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
      setTransactions(tx);

      setSummary({
        total_income: summaryRes.data?.total_income || 0,
        total_expense: summaryRes.data?.total_expense || 0,
        net_balance: summaryRes.data?.net_balance || 0,
      });

      try {
        const userRes = await API.get("user/", {
          headers: getAuthHeaders(),
        });
        const userData = userRes.data || {};
        const accountData = userData.account || {};
        setUserDetails({
          name:
            userData.name ||
            userData.full_name ||
            userData.username ||
            accountData.name ||
            "Unavailable",
          email: userData.email || accountData.email || "Unavailable",
          createdAt:
            userData.date_joined ||
            userData.created_at ||
            userData.createdAt ||
            accountData.created_at ||
            accountData.createdAt ||
            null,
          accountType:
            userData.account_type ||
            userData.accountType ||
            accountData.type ||
            accountData.account_type ||
            "Standard",
        });
      } catch (fetchError) {
        setUserDetails(null);
        const backendMessage =
          fetchError?.response?.data?.message ||
          fetchError?.response?.data?.detail;
        setUserError(
          backendMessage ||
            "We could not load your profile details right now. Please refresh and try again."
        );
      } finally {
        setUserLoading(false);
      }
    } catch {
      setError("Failed to load dashboard data. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalExpenses = useMemo(
    () => Math.abs(transactions.filter((tx) => Number(tx.amount) < 0).reduce((sum, tx) => sum + Number(tx.amount), 0)),
    [transactions]
  );

  const totalStatements = useMemo(() => {
    const ids = new Set(transactions.map((tx) => tx.statement).filter(Boolean));
    return ids.size;
  }, [transactions]);

  const stats = useMemo(
    () => [
      { label: "Total Expenses", value: formatINR(totalExpenses), helper: "Cumulative spend" },
      { label: "Uploaded Statements", value: totalStatements, helper: "Distinct statement files" },
      { label: "Current Balance", value: formatINR(summary.net_balance), helper: "Net account position" },
      { label: "Transactions", value: transactions.length, helper: "Imported records" },
    ],
    [summary.net_balance, totalExpenses, totalStatements, transactions.length]
  );

  const hasTransactions = transactions.length > 0;

  return (
    <section className="pb-4 pt-2 sm:pt-4">
      <header className="mb-6 rounded-2xl border border-white/70 bg-gradient-to-r from-teal-700 to-sky-700 p-6 text-white shadow-xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Overview</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">Financial Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-teal-50">
          Upload statements, review expenses, and understand your trends at a glance.
        </p>
      </header>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <article className="surface-card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900">User Details</h3>
          <p className="text-sm text-slate-600">Profile and account information</p>

          {userError ? <p className="mt-3 text-xs text-amber-700">{userError}</p> : null}

          {userLoading ? <LoadingSpinner label="Loading user details" /> : null}

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <User className="h-4 w-4 text-teal-700" />
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="text-sm font-semibold text-slate-800">
                  {userDetails?.name || "Unavailable"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <Mail className="h-4 w-4 text-sky-700" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-semibold text-slate-800">{userDetails?.email || "Unavailable"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <CalendarClock className="h-4 w-4 text-indigo-700" />
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(userDetails?.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <div>
                <p className="text-xs text-slate-500">Account Type</p>
                <p className="text-sm font-semibold text-slate-800">{userDetails?.accountType || "Standard"}</p>
              </div>
            </div>
          </div>
        </article>

        <article className="surface-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
            {loading ? <LoadingSpinner label="Syncing data" /> : null}
          </div>

          <div className="dashboard-grid">
            {stats.map((item, index) => (
              <StatCard key={item.label} helper={item.helper} index={index} label={item.label} value={item.value} />
            ))}
          </div>
        </article>
      </div>

      <div className="mt-5">
        <UploadSection onUploadSuccess={loadDashboardData} />
      </div>

      {!loading && !hasTransactions ? (
        <section className="mt-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-8 shadow-lg shadow-slate-900/5">
          <h3 className="text-2xl font-semibold text-slate-900">No financial statements yet</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Upload your first financial statement to start tracking expenses and view summaries.
          </p>
          <button
            className="btn-primary mt-5"
            type="button"
            onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Upload Now
          </button>
        </section>
      ) : null}

      {hasTransactions ? (
        <>
          <div className="mt-5">
            <ChartSection transactions={transactions} />
          </div>
          <div className="mt-5">
            <TransactionTable loading={loading} transactions={transactions} />
          </div>
        </>
      ) : null}
    </section>
  );
}
