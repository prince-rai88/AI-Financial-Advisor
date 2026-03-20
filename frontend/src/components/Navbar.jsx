import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-lg">
      <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">AI Financial Advisor</p>
          <h1 className="text-base font-semibold text-text-primary">Personal Finance Dashboard</h1>
        </div>

        <button className="btn-ghost gap-2" onClick={handleLogout} type="button">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
