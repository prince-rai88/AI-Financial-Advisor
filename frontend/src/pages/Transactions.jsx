import { useCallback, useEffect, useMemo, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";
import UploadSection from "../components/UploadSection";
import { formatINR } from "../utils/currency";

const PAGE_SIZE = 15;

function SortIcon({ field, currentField, currentDir }) {
  if (field !== currentField) {
    return <span className="opacity-30">↕</span>;
  }
  return <span>{currentDir === "asc" ? "↑" : "↓"}</span>;
}

export default function Transactions({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await financeApi.fetchTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load transactions. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const getCategoryName = (category) =>
    (typeof category === "object" && category !== null ? category.name : category) || "";

  const categories = useMemo(
    () => [...new Set(transactions.map((tx) => getCategoryName(tx.category)).filter(Boolean))],
    [transactions]
  );

  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        const desc = (tx.description || "").toLowerCase();
        const matchSearch = !search || desc.includes(search.toLowerCase());
        const amt = Number(tx.amount);
        const matchType =
          filterType === "all" ||
          (filterType === "income" && amt > 0) ||
          (filterType === "expense" && amt < 0);
        const catName = getCategoryName(tx.category);
        const matchCat =
          filterCategory === "all" || catName === filterCategory;
        return matchSearch && matchType && matchCat;
      })
      .sort((a, b) => {
        let va;
        let vb;
        if (sortField === "date") {
          va = new Date(a.date);
          vb = new Date(b.date);
        } else if (sortField === "amount") {
          va = Math.abs(Number(a.amount));
          vb = Math.abs(Number(b.amount));
        } else {
          va = (a[sortField] || "").toString();
          vb = (b[sortField] || "").toString();
        }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [transactions, search, filterType, filterCategory, sortField, sortDir]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered.length]
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((tx) => Number(tx.amount) > 0)
        .reduce((s, tx) => s + Number(tx.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      Math.abs(
        transactions
          .filter((tx) => Number(tx.amount) < 0)
          .reduce((s, tx) => s + Number(tx.amount), 0)
      ),
    [transactions]
  );

  const handleSort = (field) => {
    setPage(1);
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDir("desc");
  };

  return (
    <Layout
      title="Transactions"
      onLogout={onLogout}
      rightSlot={
        <button
          onClick={() => setShowUpload(true)}
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
      {/* Upload Statement Modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
        >
          <div className="w-full max-w-[620px] bg-[#0c0e14] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white tracking-tight">Statement Ingestion</p>
                <p className="text-xs text-white/40 mt-0.5">Upload CSV or XLSX ledger export</p>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <UploadSection
              onUploadSuccess={() => {
                setShowUpload(false);
                loadTransactions();
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/25 text-xs text-[#f43f5e]">
          {error}
        </div>
      )}

      {/* Top Aggregates Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="apple-card px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            Total Records
          </span>
          <span className="text-sm font-semibold font-mono tabular-numbers text-white">
            {transactions.length}
          </span>
        </div>

        <div className="apple-card px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            Aggregate Inflow
          </span>
          <span className="text-sm font-semibold font-mono tabular-numbers text-[#00e599]">
            {formatINR(totalIncome)}
          </span>
        </div>

        <div className="apple-card px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            Aggregate Outflow
          </span>
          <span className="text-sm font-semibold font-mono tabular-numbers text-[#fb7185]">
            {formatINR(totalExpense)}
          </span>
        </div>
      </div>

      {/* Filter and Search Glass Toolbar */}
      <div className="apple-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by description or merchant..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 text-xs"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Segmented Pill Toggle */}
            <div className="flex p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {["all", "income", "expense"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilterType(t);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    filterType === t
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
                className="w-auto text-xs px-3 py-1.5"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSort("date")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  sortField === "date"
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
                }`}
              >
                Date <SortIcon field="date" currentField={sortField} currentDir={sortDir} />
              </button>
              <button
                onClick={() => handleSort("amount")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  sortField === "amount"
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
                }`}
              >
                Amount <SortIcon field="amount" currentField={sortField} currentDir={sortDir} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="apple-card p-6">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.02] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto flex items-center justify-center text-white/30 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/80">No matching transactions</p>
            <p className="text-xs text-white/40 mt-1">Try modifying your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-white/40">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginated.map((tx) => {
                  const isExpense = Number(tx.amount) < 0;
                  const absAmount = Math.abs(Number(tx.amount));
                  const catName = getCategoryName(tx.category) || "General";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono text-white/50 text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono ${
                            isExpense
                              ? "bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/20"
                              : "bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isExpense ? "bg-[#fb7185]" : "bg-[#00e599]"
                            }`}
                          />
                          {isExpense ? "Expense" : "Income"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-white/90 group-hover:text-white transition-colors">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono text-white/60 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                          {catName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-numbers text-[13px] font-medium whitespace-nowrap">
                        <span className={isExpense ? "text-[#fb7185]" : "text-[#00e599]"}>
                          {isExpense ? "−" : "+"}
                          {formatINR(absAmount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4 text-xs font-mono text-white/40">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
