import { useEffect, useState } from "react";
import { subscribeToToasts } from "../utils/toast";

const toneClass = {
  success: "border-l-[3px] border-l-[#10b981]",
  error: "border-l-[3px] border-l-[#f43f5e]",
  info: "border-l-[3px] border-l-[#6c63ff]",
};

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
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border border-white/[0.07] bg-[#161b27] px-4 py-3 text-[13px] text-[#f1f5f9] ${toneClass[toast.type] || toneClass.info}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
