"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/application/useToast";
import { cn } from "@/lib/utils/cn";

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const removeToast = useToast((s) => s.removeToast);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="pointer-events-auto"
          >
            <button
              onClick={() => removeToast(toast.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl min-w-[260px]",
                toast.type === "achievement"
                  ? "border-green/30 bg-navy/95"
                  : "border-white/10 bg-navy/95"
              )}
            >
              <span className="text-2xl shrink-0">{toast.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-xs font-medium uppercase tracking-wider text-green/60">
                  {toast.type === "achievement" ? "Achievement Unlocked" : ""}
                </div>
                <div className="text-sm font-semibold text-white">{toast.title}</div>
                {toast.subtitle && (
                  <div className="text-xs text-green">{toast.subtitle}</div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
