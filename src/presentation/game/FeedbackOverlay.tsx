"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FeedbackOverlayProps {
  type: "correct" | "wrong" | null;
}

export function FeedbackOverlay({ type }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          key={type}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background:
              type === "correct"
                ? "radial-gradient(circle, rgba(0,230,118,0.15) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,82,82,0.2) 0%, transparent 70%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
