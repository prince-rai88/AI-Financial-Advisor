import { useMemo, useState } from "react";
import { formatINR } from "../utils/currency";

const PAGE_SIZE = 10;

function formatAmount(value) {
  return formatINR(value, { maximumFractionDigits: 2 });
}

export default function TransactionTable({ transactions, loading }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);

  const sortedTransactions = useMemo(() => {
    const list = [...transactions];

    list.sort((a, b) => {
      if (sortBy === "amount") {
        const aAmount = Math.abs(Number(a.amount) || 0);
        const bAmount = Math.abs(Number(b.amount) || 0);
        return sortDirection === "asc" ? aAmount - bAmount : bAmount - aAmount;
      }

      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    });

    return list;
  }, [transactions, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedTransactions.slice(start, start + PAGE_SIZE);
  }, [sortedTransactions, currentPage]);

  const toggleSort = (field) => {
    setPage(1);
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <section className="apple-card p-6">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-40 bg-white/[0.02] rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (!transactions.length) return null;

  return (
    <section className="apple-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Recent Ledger Activity</h3>
          <p className="text-xs text-white/40 font-light mt-0.5">
            Showing {paginated.length} of {sortedTransactions.length} records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSort("date")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              sortBy === "date"
                ? "bg-white/10 text-white border border-white/15"
                : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
            }`}
          >
            Date {sortBy === "date" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
          </button>
          <button
            type="button"
            onClick={() => toggleSort("amount")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              sortBy === "amount"
                ? "bg-white/10 text-white border border-white/15"
                : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
            }`}
          >
            Amount {sortBy === "amount" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-white/40">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginated.map((tx) => {
              const isExpense = Number(tx.amount) < 0;
              const absAmount = Math.abs(Number(tx.amount));
              const categoryName =
                typeof tx.category === "object" && tx.category !== null
                  ? tx.category.name
                  : tx.category || "General";

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
                  <td className="py-3 px-3">
                    <div className="font-medium text-white/90 group-hover:text-white transition-colors">
                      {tx.description}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5 font-light">
                      {categoryName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-numbers text-[13px] font-medium whitespace-nowrap">
                    <span className={isExpense ? "text-[#fb7185]" : "text-[#00e599]"}>
                      {isExpense ? "−" : "+"}
                      {formatAmount(absAmount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4 text-xs font-mono text-white/40">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
