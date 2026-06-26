import { motion } from "framer-motion";
import { formatNumber } from "../data/equations";
import { Sparkles } from "lucide-react";

export function ResultBubble({ value, step, unit }: { value: number; step?: string; unit: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="mt-4 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-cyan-500/10 overflow-hidden"
      style={{ boxShadow: "0 0 20px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Sparkles size={14} className="text-primary" />
        </div>
        {step && (
          <span className="text-muted-foreground text-xs font-mono flex-1 min-w-0 truncate">{step}</span>
        )}
        <div className="flex items-baseline gap-1.5 shrink-0 ml-auto">
          <span
            className="text-2xl font-bold font-sans"
            style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 8px rgba(37,99,235,0.35))"
            }}
          >
            {formatNumber(value)}
          </span>
          <span className="text-base text-primary/70 font-medium">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
}
