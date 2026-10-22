import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isGuestMode } from "../utils/auth";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="14" y2="18" />
      </svg>
    ),
  },
  {
    label: "Budget",
    path: "/budget",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: "AI Insights",
    path: "/insights",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
];

const PROFILE_ITEM = {
  label: "Profile",
  hash: "profile",
  icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

export default function Layout({ title, rightSlot, children, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const guest = isGuestMode();

  const isActive = (hash, path) => {
    if (path) return location.pathname.startsWith(path);
    const currentHash = location.hash || "";
    if (!hash) return location.pathname === "/dashboard" && !currentHash;
    return location.pathname === "/dashboard" && currentHash === `#${hash}`;
  };

  const baseItem =
    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/60 text-xs font-medium hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer mb-1";
  const activeItem =
    "bg-white/[0.08] text-white font-medium border border-white/[0.1] shadow-sm";

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] flex antialiased selection:bg-[#00e599]/30 selection:text-white">
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* APPLE FROSTED GLASS SIDEBAR                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] transform transition-transform duration-300 ease-out lg:static lg:transform-none lg:flex-shrink-0 bg-[#080a10]/90 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col py-6 px-4 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 shadow-md flex items-center justify-center text-white text-xs font-semibold">
              F
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1">
                FinAI <span className="text-[#00e599] text-[10px] font-mono px-1 rounded bg-[#00e599]/10">OS</span>
              </span>
              <span className="text-[10px] font-mono text-white/40 block">v2.4 Production</span>
            </div>
          </Link>
        </div>

        {/* Guest Mode Indicator Badge */}
        {guest && (
          <div className="mb-5 px-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono font-medium tracking-tight">Demo Mode</span>
              </div>
              <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Read-Only
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          <p className="px-3.5 pb-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`${baseItem} ${isActive(null, item.path) ? activeItem : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Profile / Bottom Anchor */}
        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <Link
            to="/dashboard#profile"
            className={`${baseItem} ${isActive(PROFILE_ITEM.hash) ? activeItem : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            {PROFILE_ITEM.icon}
            <span>{PROFILE_ITEM.label}</span>
          </Link>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MAIN VIEWPORT WITH STICKY FROSTED HEADER                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 py-3.5 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white"
              aria-label="Toggle mobile sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-medium text-white tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Guest Mode Status Pill */}
            {guest && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/20 text-amber-400 text-xs font-mono"
                title="Exploring with deterministic fictional dataset"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Guest Explorer</span>
              </div>
            )}

            {/* Live Date Pill */}
            <span className="hidden md:inline-flex text-[11px] font-mono text-white/40 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-lg tabular-numbers">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            {/* Custom Screen Right Slot (e.g. Upload button) */}
            {rightSlot}

            {/* Guest Mode Quick Sign-Up */}
            {guest && (
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00e599] hover:bg-[#00cc88] text-black transition-all shadow-[0_0_15px_rgba(0,229,153,0.2)]"
              >
                Create Account
              </Link>
            )}

            {/* Logout / Exit Demo Button */}
            <button
              onClick={onLogout}
              title={guest ? "Exit demo mode and go to login" : "Sign out of your account"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                guest
                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/25"
                  : "text-white/60 hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 border border-white/[0.08] hover:border-[#f43f5e]/25"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{guest ? "Exit Demo" : "Sign Out"}</span>
            </button>

            {/* Avatar Pill */}
            <div
              title={guest ? "Guest Demo Explorer" : "User Profile"}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-semibold ${
                guest
                  ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                  : "bg-white/[0.08] border border-white/[0.15] text-white"
              }`}
            >
              {guest ? "G" : "U"}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
