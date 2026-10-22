import { useEffect, useState } from "react";
import { subscribeToToasts } from "../utils/toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3500);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-2.5">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c0e14]/90 backdrop-blur-2xl px-4 py-3 text-xs text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSuccess
                  ? "bg-[#00e599]/20 text-[#00e599]"
                  : isError
                  ? "bg-[#f43f5e]/20 text-[#f43f5e]"
                  : "bg-[#38bdf8]/20 text-[#38bdf8]"
              }`}
            >
              {isSuccess ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isError ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <p className="flex-1 font-medium tracking-tight text-white/90">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
