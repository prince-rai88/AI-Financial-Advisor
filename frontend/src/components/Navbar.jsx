import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between py-3.5 px-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#00e599]">FinAI OS</p>
          <h1 className="text-sm font-medium text-white tracking-tight">Personal Financial Workspace</h1>
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
