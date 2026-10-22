import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

// Lazy-load the heavy 3D WebGL centerpiece
const AppleSculptureCanvas = lazy(() =>
  import("../components/3d/AppleSculptureCanvas")
);

const CHAPTERS = [
  { id: "hero", label: "01 Overview", title: "Clarity in Titanium and Quartz" },
  { id: "architecture", label: "02 Architecture", title: "Deconstructed Precision" },
  { id: "taxonomy", label: "03 Taxonomy", title: "Refraction of Wealth" },
  { id: "anomaly", label: "04 Anomaly Engine", title: "Surgical Outlier Isolation" },
  { id: "equilibrium", label: "05 Specifications", title: "Engineered Equilibrium" },
];

export default function AppleLanding({ onGuestLogin, isAuth = false }) {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [anomalyTriggered, setAnomalyTriggered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const containerRef = useRef(null);

  // Monitor scroll progression through the editorial chapters
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const progress = totalHeight > 0 ? Math.min(Math.max(currentScroll / totalHeight, 0), 1) : 0;
          setScrollProgress(progress);

          // Update active chapter index
          const chapterIdx = Math.min(
            Math.floor(progress * CHAPTERS.length),
            CHAPTERS.length - 1
          );
          setActiveChapter(chapterIdx);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLaunchGuest = useCallback(() => {
    if (onGuestLogin) {
      onGuestLogin();
    }
    notify("Entered FinAI in Guest Demo Mode", "info");
    navigate("/dashboard");
  }, [onGuestLogin, navigate]);

  const scrollToChapter = (idx) => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (idx / (CHAPTERS.length - 1)) * totalHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[500vh] bg-[#07090e] text-[#f8fafc] font-sans selection:bg-[#00e599]/30 selection:text-white antialiased"
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. STICKY MINIMALIST APPLE-STYLE NAVIGATION                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 group focus:outline-none focus:ring-1 focus:ring-[#00e599]"
              aria-label="FinAI Home"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xs font-semibold tracking-wider text-white shadow-sm">
                F
              </div>
              <span className="font-medium text-[15px] tracking-tight text-white/90 group-hover:text-white transition-colors">
                FinAI <span className="text-[#00e599] font-normal">OS</span>
              </span>
            </Link>

            <span className="hidden md:inline-block text-[11px] tracking-widest uppercase text-white/40 border-l border-white/10 pl-4 py-0.5">
              Financial Intelligence
            </span>
          </div>

          {/* Desktop Chapter Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] text-white/60">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => scrollToChapter(idx)}
                className={`transition-colors py-1 cursor-pointer focus:outline-none ${
                  activeChapter === idx
                    ? "text-white font-medium border-b border-[#00e599]"
                    : "hover:text-white/90"
                }`}
              >
                {ch.label.split(" ")[1]}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuth ? (
              <Link
                to="/dashboard"
                className="px-4 py-1.5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#00e599]"
              >
                Launch App
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block text-[13px] text-white/70 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleLaunchGuest}
                  className="px-4 py-1.5 rounded-full bg-[#00e599] hover:bg-[#00cc88] text-black text-[13px] font-semibold transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:shadow-[0_0_25px_rgba(0,229,153,0.4)] flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00e599]"
                >
                  <span>Explore Demo</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#07090e]/95 border-b border-white/10 px-6 py-4 flex flex-col gap-3">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => scrollToChapter(idx)}
                className={`text-left text-sm py-2 ${
                  activeChapter === idx ? "text-[#00e599] font-medium" : "text-white/70"
                }`}
              >
                {ch.label} — {ch.title}
              </button>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={handleLaunchGuest}
                className="w-full py-2.5 rounded-lg bg-[#00e599] text-black text-sm font-semibold text-center"
              >
                Continue as Guest Demo
              </button>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-lg bg-white/10 text-white text-sm text-center"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. FIXED BACKGROUND 3D CENTERPIECE                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00e599] animate-spin" />
            </div>
          }
        >
          <div className="w-full h-full pointer-events-auto">
            <AppleSculptureCanvas
              scrollProgress={scrollProgress}
              anomalyActive={anomalyTriggered}
            />
          </div>
        </Suspense>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. FLOATING CHAPTER SCRUBBER (Apple Keynote Sidebar Style)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        {CHAPTERS.map((ch, idx) => {
          const isActive = activeChapter === idx;
          return (
            <button
              key={ch.id}
              onClick={() => scrollToChapter(idx)}
              className="group flex items-center justify-end gap-3 text-right focus:outline-none"
              aria-label={`Jump to ${ch.title}`}
            >
              <span
                className={`text-[11px] tracking-wider font-mono transition-all duration-300 ${
                  isActive
                    ? "text-[#00e599] translate-x-0 opacity-100"
                    : "text-white/30 translate-x-2 opacity-0 group-hover:opacity-80 group-hover:translate-x-0"
                }`}
              >
                {ch.label}
              </span>
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#00e599] shadow-[0_0_10px_#00e599]"
                    : "w-1.5 h-1.5 bg-white/20 group-hover:bg-white/60"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. CHOREOGRAPHED SCROLL CONTENT (5 EDITORIAL CHAPTERS)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative z-20 pointer-events-none">
        {/* ───────── CHAPTER 1: THE MONOLITH (HERO) ───────── */}
        <section className="min-h-screen flex flex-col justify-between px-6 pt-28 pb-16 max-w-7xl mx-auto">
          <div className="pointer-events-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
              <span className="text-[12px] tracking-wide text-white/80 font-medium">
                Production Release · Architecture v2.4
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-white leading-[1.08] mb-6">
              Financial intelligence.
              <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40">
                In its purest form.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 font-light leading-relaxed mb-8 max-w-xl">
              FinAI turns raw ledger entropy into surgical clarity. Powered by
              calibrated machine learning, instant transaction taxonomy, and
              uncompromising aesthetic discipline.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleLaunchGuest}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-white/95 text-black text-sm font-semibold tracking-wide transition-all shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>Launch Live Demo</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-black/10 font-mono text-black/70">
                  Guest
                </span>
              </button>

              <button
                onClick={() => scrollToChapter(1)}
                className="px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.12] text-white text-sm font-medium transition-all cursor-pointer"
              >
                Explore Deconstruction ↓
              </button>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/[0.08] pt-6 mt-12">
            <div className="flex items-center gap-8 text-xs text-white/50 font-mono">
              <div>
                <span className="block text-white/30 uppercase tracking-widest text-[10px]">Model</span>
                <span className="text-white/80">IsolationForest v0.24</span>
              </div>
              <div>
                <span className="block text-white/30 uppercase tracking-widest text-[10px]">API Latency</span>
                <span className="text-[#00e599]">~12ms DRF Core</span>
              </div>
              <div>
                <span className="block text-white/30 uppercase tracking-widest text-[10px]">Guest Isolation</span>
                <span className="text-white/80">Active In-Memory</span>
              </div>
            </div>

            <p className="text-xs text-white/40 font-light">
              Scroll to deconstruct the internal intelligence engine
            </p>
          </div>
        </section>

        {/* ───────── CHAPTER 2: DECONSTRUCTED ARCHITECTURE ───────── */}
        <section className="min-h-screen flex items-center px-6 py-24 max-w-7xl mx-auto">
          <div className="pointer-events-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 bg-[#0a0d14]/75 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/[0.08] shadow-2xl">
              <span className="text-[11px] font-mono tracking-widest text-[#00e599] uppercase block mb-3">
                Chapter 02 · Mechanical Precision
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-4">
                Titanium chassis.
                <br />
                Optical glass core.
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed mb-6">
                Just as physical instruments are crafted from grade-5 titanium and precision quartz, FinAI separates computational infrastructure from analytical insight.
              </p>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-white/50">Outer Shell</span>
                  <span className="text-white/90">Dual-axis decoupled state machine</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-white/50">Central Core</span>
                  <span className="text-[#00e599]">Django REST + Supabase Postgres</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-white/50">Vector Acceleration</span>
                  <span className="text-white/90">Pandas Dataframe Aggregations</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-7" />
          </div>
        </section>

        {/* ───────── CHAPTER 3: CATEGORIZATION TAXONOMY ───────── */}
        <section className="min-h-screen flex items-center px-6 py-24 max-w-7xl mx-auto">
          <div className="pointer-events-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="hidden lg:block lg:col-span-6" />

            <div className="lg:col-span-6 bg-[#0a0d14]/75 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/[0.08] shadow-2xl">
              <span className="text-[11px] font-mono tracking-widest text-[#00e599] uppercase block mb-3">
                Chapter 03 · Autonomous Taxonomy
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-4">
                Refracting transactions into pristine clarity.
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed mb-6">
                Raw bank statements arrive fragmented and noisy. FinAI's categorization engine refracts every transaction into deterministic, verified budget buckets without manual tagging.
              </p>

              {/* Real FinAI Taxonomy Buckets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { name: "Housing", share: "36%", color: "#00e599", sample: "Mortgage / Rent · Fixed" },
                  { name: "Food & Dining", share: "22%", color: "#10b981", sample: "Groceries & Daily Fuel" },
                  { name: "Transportation", share: "14%", color: "#34d399", sample: "Transit, Commute, Fuel" },
                  { name: "Utilities & Subs", share: "12%", color: "#6ee7b7", sample: "Grid, SaaS, Connectivity" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/90">{item.name}</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: item.color }}>
                        {item.share}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40">{item.sample}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-white/50 border-t border-white/[0.08] pt-4 flex items-center justify-between">
                <span>Total Monthly Ledger Managed:</span>
                <span className="font-mono text-white/90 font-medium">$4,780.00 / month</span>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── CHAPTER 4: ANOMALY DETECTION ENGINE ───────── */}
        <section className="min-h-screen flex items-center px-6 py-24 max-w-7xl mx-auto">
          <div className="pointer-events-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 bg-[#0a0d14]/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/[0.08] shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono tracking-widest text-[#00e599] uppercase block">
                  Chapter 04 · Surgical Reticle
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20">
                  IsolationForest Active
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-4">
                Detecting the invisible deviation.
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed mb-6">
                Unusual fees, duplicate charges, and erratic spending spikes don't escape notice. The anomaly engine isolates statistical outliers with mathematical certainty.
              </p>

              {/* Interactive Reticle Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/70 font-medium">3D Anomaly Reticle Lock</span>
                  <button
                    onClick={() => setAnomalyTriggered(!anomalyTriggered)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                      anomalyTriggered
                        ? "bg-[#00e599] text-black shadow-[0_0_15px_#00e599]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {anomalyTriggered ? "● RETICLE LOCKED" : "○ TEST RETICLE"}
                  </button>
                </div>
                <div className="text-xs font-mono space-y-1.5 text-white/50">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="text-white/80">$320.00 Electronics Outlier</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Z-Score Deviation:</span>
                    <span className="text-[#00e599]">+3.42σ above baseline</span>
                  </div>
                  <div className="flex justify-between">
                    <span>False Alarm Rate:</span>
                    <span className="text-white/80">&lt; 0.05% empirical</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/40">
                Click "TEST RETICLE" to trigger the spatial anomaly targeting array in the 3D viewport.
              </p>
            </div>

            <div className="hidden lg:block lg:col-span-6" />
          </div>
        </section>

        {/* ───────── CHAPTER 5: EQUILIBRIUM & LAUNCH GATEWAY ───────── */}
        <section className="min-h-screen flex flex-col justify-center items-center px-6 py-24 max-w-4xl mx-auto text-center">
          <div className="pointer-events-auto bg-[#07090e]/85 backdrop-blur-3xl p-10 sm:p-14 rounded-3xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-full">
            <span className="text-[11px] font-mono tracking-widest text-[#00e599] uppercase block mb-4">
              Chapter 05 · Complete Product Launch
            </span>

            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white mb-6">
              Step inside FinAI.
              <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#00e599]">
                Zero setup required.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-white/60 font-light max-w-xl mx-auto mb-10 leading-relaxed">
              Explore the fully functional financial dashboard in Guest Demo Mode with populated transactions, real-time category distribution, and automated AI insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleLaunchGuest}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#00e599] hover:bg-[#00cc88] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(0,229,153,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter as Guest Explorer</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white font-medium text-sm transition-all text-center"
              >
                Create Permanent Account
              </Link>
            </div>

            {/* Architecture Specification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/[0.08] pt-8">
              <div>
                <span className="block text-[10px] font-mono uppercase text-white/40">Frontend</span>
                <span className="text-xs font-medium text-white/90">React 19 + Vite</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-white/40">3D Engine</span>
                <span className="text-xs font-medium text-white/90">Three.js WebGL</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-white/40">Backend</span>
                <span className="text-xs font-medium text-white/90">Django REST Core</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-white/40">Data Engine</span>
                <span className="text-xs font-medium text-[#00e599]">Supabase Postgres</span>
              </div>
            </div>
          </div>

          {/* Minimalist Footer */}
          <footer className="pointer-events-auto mt-16 text-center text-xs text-white/40 space-y-2">
            <p>© 2026 FinAI Systems. Engineered with uncompromising aesthetic clarity.</p>
            <div className="flex items-center justify-center gap-4 text-[11px]">
              <Link to="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <span>·</span>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
              <span>·</span>
              <button
                onClick={handleLaunchGuest}
                className="hover:text-[#00e599] transition-colors cursor-pointer"
              >
                Guest Demo
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
