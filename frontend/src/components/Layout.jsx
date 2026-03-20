import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    label: "Budget",
    path: "/budget",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    label: "Insights",
    path: "/insights",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18l4-8 4 5 4-9 4 4" />
      </svg>
    ),
  },
];

const PROFILE_ITEM = {
  label: "Profile",
  hash: "profile",
  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

export default function Layout({ title, rightSlot, children, onLogout }) {
  const location = useLocation();

  const isActive = (hash, path) => {
    if (path) return location.pathname.startsWith(path);
    const currentHash = location.hash || "";
    if (!hash) return location.pathname === "/dashboard" && !currentHash;
    return location.pathname === "/dashboard" && currentHash === `#${hash}`;
  };

  const baseItem =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#64748b] text-[13px] font-medium hover:text-[#f1f5f9] hover:bg-white/5 transition-all cursor-pointer mb-1";
  const activeItem = "bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20";

  return (
    <div className="min-h-screen bg-[#0d0f14] flex">
      <aside className="w-[220px] flex-shrink-0 bg-[#0f1117] border-r border-white/5 flex flex-col py-6 px-4">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#6c63ff] flex items-center justify-center text-white text-[11px] font-bold">
            F
          </div>
          <span className="text-[15px] font-bold text-[#f1f5f9]">
            Fin<span className="text-[#6c63ff]">AI</span>
          </span>
        </div>

        <nav className="flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path || "/dashboard"}
              className={`${baseItem} ${isActive(item.hash, item.path) ? activeItem : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <Link
            to="/dashboard#profile"
            className={`${baseItem} ${isActive(PROFILE_ITEM.hash) ? activeItem : ""}`}
          >
            {PROFILE_ITEM.icon}
            {PROFILE_ITEM.label}
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <h1 className="text-[18px] font-semibold text-[#f1f5f9]">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#64748b] bg-white/5 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {rightSlot}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#64748b] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 border border-white/[0.07] hover:border-[#f43f5e]/20 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
            <div className="w-8 h-8 rounded-full bg-[#6c63ff]/20 border border-[#6c63ff]/30 flex items-center justify-center text-[#6c63ff] text-[12px] font-semibold">
              P
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
