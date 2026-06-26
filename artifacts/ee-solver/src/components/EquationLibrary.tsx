import { useState, useMemo } from "react";
import { equations } from "../data/equations";
import { getCategoryColor } from "../data/variables";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function EquationLibrary() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filteredEquations = useMemo(() => {
    if (!search) return equations;
    const lower = search.toLowerCase();
    return equations.filter(eq =>
      eq.name.toLowerCase().includes(lower) ||
      eq.formula.toLowerCase().includes(lower) ||
      eq.category.toLowerCase().includes(lower) ||
      eq.variables.some(v => v.symbol.toLowerCase() === lower || v.name.toLowerCase().includes(lower))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof equations> = {};
    for (const eq of filteredEquations) {
      if (!map[eq.category]) map[eq.category] = [];
      map[eq.category].push(eq);
    }
    return map;
  }, [filteredEquations]);

  return (
    <section className="min-h-screen pt-8 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Equation Library</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click any equation to open its full calculator</p>
        </div>
      </div>

      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Search equations, variables, formulas..."
          className="pl-11 h-13 bg-card border-border focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all text-base rounded-xl"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filteredEquations.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No equations found for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, eqs], gi) => {
            const col = getCategoryColor(category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${col.badge}`}>{category}</span>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-xs text-muted-foreground">{eqs.length} equation{eqs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {eqs.map((eq, i) => (
                    <motion.button
                      key={eq.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gi * 0.05 + i * 0.03 }}
                      onClick={() => setLocation(`/equation-library/${eq.id}`)}
                      className="group text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] transition-all duration-200 flex flex-col gap-2"
                      data-testid={`equation-card-${eq.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-serif font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                          {eq.name}
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                      </div>
                      <span className="font-mono text-sm text-primary/80 bg-primary/5 px-2 py-1 rounded-md inline-block">
                        {eq.formula}
                      </span>
                      {eq.isExplanatoryOnly && (
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                          <Zap size={10} /> Concept
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
