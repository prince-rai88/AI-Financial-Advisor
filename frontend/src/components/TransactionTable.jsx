import { useMemo, useState } from "react";
import { formatINR } from "../utils/currency";

const PAGE_SIZE = 10;

function formatAmount(value) {
  return formatINR(value, { maximumFractionDigits: 2 });
}

function txType(amount) {
  return Number(amount) < 0 ? "Expense" : "Income";
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
      <section className="rounded-xl border border-border-subtle bg-bg-surface p-4">
        <div className="h-24 animate-pulse rounded-xl bg-bg-elevated" />
      </section>
    );
  }

  if (!transactions.length) return null;

  return (
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Transactions</h3>
        <div className="flex gap-2">
          <button className="btn-ghost" type="button" onClick={() => toggleSort("date")}>
            Sort Date ({sortBy === "date" ? sortDirection : "-"})
          </button>
          <button className="btn-ghost" type="button" onClick={() => toggleSort("amount")}>
            Sort Amount ({sortBy === "amount" ? sortDirection : "-"})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-text-secondary">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Type</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Description</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx) => {
              const isExpense = Number(tx.amount) < 0;
              return (
                <tr key={tx.id} className="rounded-xl bg-bg-elevated/80 transition hover:bg-bg-elevated">
                  <td className="whitespace-nowrap rounded-l-xl px-3 py-3 text-sm text-text-secondary">{tx.date}</td>
                  <td className="px-3 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        isExpense ? "bg-red/10 text-red" : "bg-green/10 text-green"
                      }`}
                    >
                      {txType(tx.amount)}
                    </span>
                  </td>
                  <td className="max-w-[380px] truncate px-3 py-3 text-sm font-medium text-text-primary">{tx.description}</td>
                  <td
                    className={`rounded-r-xl px-3 py-3 text-right text-sm font-semibold ${
                      isExpense ? "text-red" : "text-green"
                    }`}
                  >
                    {formatAmount(tx.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="btn-ghost"
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
