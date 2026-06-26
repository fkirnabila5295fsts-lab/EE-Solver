import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Clock, ArrowRight, Trash2, Zap } from "lucide-react";
import { getAllRecentlySolved, clearRecentlySolved, RecentlySolved, useRecentlyUpdatedEvent } from "../data/variables";
import { formatNumber } from "../data/equations";
import { getCategoryColor } from "../data/variables";
import { equations } from "../data/equations";

function timeAgo(ts: number) {
  const age = Date.now() - ts;
  if (age < 60000) return "just now";
  if (age < 3600000) return `${Math.floor(age / 60000)}m ago`;
  if (age < 86400000) return `${Math.floor(age / 3600000)}h ago`;
  return `${Math.floor(age / 86400000)}d ago`;
}

export function RecentlySolvedPage() {
  const [recents, setRecents] = useState<RecentlySolved[]>([]);
  const [, setLocation] = useLocation();

  const refresh = () => setRecents(getAllRecentlySolved());

  useEffect(() => {
    refresh();
    const cleanup = useRecentlyUpdatedEvent(refresh);
    window.addEventListener("storage", refresh);
    return () => { cleanup(); window.removeEventListener("storage", refresh); };
  }, []);

  const handleClear = () => { clearRecentlySolved(); setRecents([]); };

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Recently Solved</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your last {recents.length} calculation{recents.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {recents.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40 transition-all"
            >
              <Trash2 size={13} /> Clear all
            </motion.button>
          )}
        </div>

        {/* Empty state */}
        {recents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
              <Clock size={32} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-lg font-serif font-semibold text-foreground mb-1">No history yet</p>
              <p className="text-sm text-muted-foreground">Solve an equation and it'll appear here.</p>
            </div>
            <button
              onClick={() => setLocation("/equation-library")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              <Zap size={14} /> Open Equation Library
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {recents.map((r, i) => {
                const eq = equations.find(e => e.id === r.equationId);
                const col = getCategoryColor(eq?.category || "default");
                return (
                  <motion.button
                    key={`${r.equationId}-${r.solvedFor}-${r.timestamp}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setLocation(`/equation-library/${r.equationId}`)}
                    className="group w-full text-left flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 hover:border-primary/30 hover:bg-card hover:shadow-[0_0_25px_rgba(37,99,235,0.1)] transition-all duration-300 backdrop-blur-sm"
                  >
                    {/* Index badge */}
                    <div
                      className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold border"
                      style={{
                        background: `${col.accent}18`,
                        borderColor: `${col.accent}35`,
                        color: col.accent
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-serif font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                          {r.equationName}
                        </span>
                        {eq && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${col.badge}`}>
                            {eq.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-muted-foreground">{r.formula}</span>
                        <span className="text-border">·</span>
                        <span className="text-muted-foreground/60">{timeAgo(r.timestamp)}</span>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="shrink-0 text-right">
                      <div
                        className="text-base font-bold font-mono"
                        style={{
                          background: "linear-gradient(135deg, #60a5fa, #2563eb)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text"
                        }}
                      >
                        {r.solvedFor} = {formatNumber(r.result)}<span className="text-xs ml-0.5">{r.unit}</span>
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
