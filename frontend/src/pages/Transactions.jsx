import { useCallback, useEffect, useMemo, useState } from "react";
import { financeApi } from "../api";
import Layout from "../components/Layout";
import UploadSection from "../components/UploadSection";

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
    } catch (e) {
      setError("Failed to load transactions. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const categories = useMemo(
    () => [...new Set(transactions.map((tx) => tx.category?.name).filter(Boolean))],
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
        const matchCat =
          filterCategory === "all" || tx.category?.name === filterCategory;
        return matchSearch && matchType && matchCat;
      })
      .sort((a, b) => {
        let va;
        let vb;
        if (sortField === "date") {
          va = new Date(a.date);
          vb = new Date(b.date);
        } else if (sortField === "amount") {
          va = Number(a.amount);
          vb = Number(b.amount);
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
    () => Math.ceil(filtered.length / PAGE_SIZE),
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
          className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Upload CSV
        </button>
      }
    >
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
        >
          <div className="w-full max-w-[520px] mx-4 bg-[#161b27] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[15px] font-semibold text-[#f1f5f9]">
                  Upload statement
                </p>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  Supported: CSV, XLSX · Max 10 MB
                </p>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-colors text-[18px] leading-none"
              >
                ×
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
        <div className="mb-4 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-xl px-4 py-3 text-[13px] text-[#f43f5e]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2.5 bg-[#161b27] border border-white/[0.07] rounded-xl px-4 py-2.5">
          <span className="text-[11px] text-[#64748b] uppercase tracking-wide">
            Total
          </span>
          <span className="text-[13px] font-bold text-[#f1f5f9]">
            {transactions.length}
          </span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#161b27] border border-white/[0.07] rounded-xl px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#10b981]" />
          <span className="text-[11px] text-[#64748b] uppercase tracking-wide">
            Income
          </span>
          <span className="text-[13px] font-bold text-[#10b981]">
            ₹{totalIncome.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#161b27] border border-white/[0.07] rounded-xl px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#f43f5e]" />
          <span className="text-[11px] text-[#64748b] uppercase tracking-wide">
            Expenses
          </span>
          <span className="text-[13px] font-bold text-[#f43f5e]">
            ₹{totalExpense.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/[0.07]">
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1c2235] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-[13px] text-[#f1f5f9] placeholder-[#64748b] outline-none focus:border-[#6c63ff]/50 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#1c2235] border border-white/[0.07] rounded-xl p-1 gap-1">
            {["all", "income", "expense"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize ${
                  filterType === type
                    ? "bg-[#6c63ff] text-white"
                    : "text-[#64748b] hover:text-[#f1f5f9]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className="bg-[#1c2235] border border-white/[0.07] rounded-xl px-3 py-2 text-[13px] text-[#f1f5f9] outline-none focus:border-[#6c63ff]/50 transition-colors cursor-pointer"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="text-[12px] text-[#64748b] ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                <div className="h-3 bg-white/5 rounded animate-pulse flex-1" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-24" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#64748b]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#f1f5f9]">
              {transactions.length === 0
                ? "No transactions yet"
                : "No results found"}
            </p>
            <p className="text-[12px] text-[#64748b]">
              {transactions.length === 0
                ? "Upload a CSV or XLSX file to get started"
                : "Try adjusting your search or filters"}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                + Upload CSV
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {[
                  { label: "Date", field: "date", width: "w-[120px]" },
                  { label: "Description", field: "description", width: "" },
                  { label: "Category", field: null, width: "w-[130px]" },
                  { label: "Amount", field: "amount", width: "w-[120px]" },
                ].map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.field && handleSort(col.field)}
                    className={`px-5 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wide ${col.width} ${
                      col.field
                        ? "cursor-pointer hover:text-[#f1f5f9] select-none"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      {col.field && (
                        <span className="text-[10px]">
                          <SortIcon
                            field={col.field}
                            currentField={sortField}
                            currentDir={sortDir}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((tx, i) => {
                const amt = Number(tx.amount);
                const isIncome = amt > 0;
                const dateStr = tx.date
                  ? new Date(tx.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <tr
                    key={tx.id || i}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[12px] text-[#64748b] whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-[#f1f5f9] line-clamp-1">
                        {tx.description || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {tx.category?.name ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20">
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#3d4a63]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`text-[13px] font-semibold ${
                          isIncome ? "text-[#10b981]" : "text-[#f43f5e]"
                        }`}
                      >
                        {isIncome ? "+" : "−"}₹
                        {Math.abs(amt).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
            <span className="text-[12px] text-[#64748b]">
              Page {page} of {totalPages} · {filtered.length} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/5 text-[#64748b] hover:bg-white/10 hover:text-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(page - 2 + i, totalPages - 4 + i)
                );
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                      page === pageNum
                        ? "bg-[#6c63ff] text-white"
                        : "bg-white/5 text-[#64748b] hover:bg-white/10 hover:text-[#f1f5f9]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/5 text-[#64748b] hover:bg-white/10 hover:text-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
