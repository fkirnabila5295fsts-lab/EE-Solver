import { useState, useMemo, useRef, useEffect } from "react";
import { equations, EquationDef } from "../data/equations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Plus, X, Search, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EquationDetail } from "./EquationDetail";
import { EE_VARIABLES, ALL_UNITS, getUnitsForSymbol, getCategoryColor } from "../data/variables";
import { useLocation } from "wouter";

const unitToVarName: Record<string, string> = {
  'Ω': 'R (Resistance)', 'A': 'I (Current)', 'V': 'V (Voltage)',
  'F': 'C (Capacitance)', 'H': 'L (Inductance)', 'Hz': 'f (Frequency)',
  'W': 'P (Power)', 'C': 'Q (Charge)', 'N': 'F (Force)', 'J': 'E (Energy)'
};
const unitToSymbol: Record<string, string> = {
  'Ω': 'R', 'A': 'I', 'V': 'V', 'F': 'C', 'H': 'L', 'Hz': 'f',
  'W': 'P', 'C': 'Q', 'N': 'F', 'J': 'E'
};

interface KnownVar {
  id: string;
  name: string;
  value: string;
  unit: string;
}

function VariableAutocomplete({
  value, onChange, placeholder, className,
}: {
  value: string; onChange: (val: string) => void; placeholder: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value) return EE_VARIABLES.slice(0, 8);
    const lower = value.toLowerCase();
    return EE_VARIABLES.filter(v =>
      v.symbol.toLowerCase().startsWith(lower) ||
      v.name.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="h-11 font-mono bg-card border-card-border focus:ring-2 focus:ring-primary"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-popover-border rounded-xl shadow-xl overflow-hidden"
          >
            {filtered.map(v => (
              <button
                key={v.symbol}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(v.symbol); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition-colors text-left"
              >
                <span className="font-mono text-primary font-semibold text-sm w-10 shrink-0">{v.symbol}</span>
                <span className="text-foreground text-sm">{v.name}</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono">{v.units[0]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitPicker({
  value, onChange, varSymbol,
}: {
  value: string; onChange: (unit: string) => void; varSymbol: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // When symbol is provided → show only that variable's units
  // When symbol is empty   → show ALL units so user can browse
  const units = useMemo(() => getUnitsForSymbol(varSymbol), [varSymbol]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-11 min-w-[80px] px-3 flex items-center gap-1.5 rounded-lg border border-card-border bg-card hover:border-primary/40 transition-colors text-sm font-mono text-foreground"
        data-testid="unit-picker-trigger"
      >
        <span className="flex-1 text-left">{value || "Unit"}</span>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 z-50 bg-popover border border-popover-border rounded-xl shadow-xl overflow-hidden"
            style={{ minWidth: 90 }}
          >
            <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
              {units.map(u => (
                <button
                  key={u}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onChange(u); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-primary/10 transition-colors flex items-center justify-between gap-2 ${value === u ? "text-primary bg-primary/10" : "text-foreground"}`}
                >
                  {u}
                  {value === u && <Check size={12} className="text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TargetAutocomplete({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value) return EE_VARIABLES.slice(0, 10);
    const lower = value.toLowerCase();
    return EE_VARIABLES.filter(v =>
      v.symbol.toLowerCase().startsWith(lower) ||
      v.name.toLowerCase().includes(lower)
    ).slice(0, 10);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Input
        type="text"
        placeholder="e.g. Voltage, Current, V, R..."
        className="h-14 text-lg bg-card border-card-border focus:ring-2 focus:ring-primary font-mono"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        data-testid="target-input"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-popover-border rounded-xl shadow-xl overflow-hidden"
          >
            {filtered.map(v => (
              <button
                key={v.symbol}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(v.symbol); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left border-b border-border/30 last:border-0"
              >
                <span className="font-mono text-primary font-bold text-base w-12 shrink-0">{v.symbol}</span>
                <span className="text-foreground">{v.name}</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono">{v.units.slice(0, 3).join(", ")}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SmartSolver() {
  const [targetSearch, setTargetSearch] = useState("");
  const [knowns, setKnowns] = useState<KnownVar[]>([
    { id: "1", name: "", value: "", unit: "" }
  ]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEq, setSelectedEq] = useState<EquationDef | null>(null);
  const [, setLocation] = useLocation();

  const addKnown = () => {
    setKnowns([...knowns, { id: Math.random().toString(), name: "", value: "", unit: "" }]);
  };

  const removeKnown = (id: string) => setKnowns(knowns.filter(k => k.id !== id));

  const updateKnown = (id: string, field: keyof KnownVar, val: string) => {
    setKnowns(knowns.map(k => {
      if (k.id !== id) return k;
      const updated = { ...k, [field]: val };
      if (field === "name") {
        const matched = EE_VARIABLES.find(v =>
          v.symbol.toLowerCase() === val.toLowerCase() ||
          v.name.toLowerCase() === val.toLowerCase()
        );
        // Auto-set unit to the variable's primary unit when symbol is selected
        if (matched && !updated.unit) updated.unit = matched.units[0];
      }
      return updated;
    }));
    setHasSearched(false);
  };

  const matches = useMemo(() => {
    if (!hasSearched) return [];
    return equations.filter(eq => {
      if (eq.isExplanatoryOnly) return false;
      const targetLower = targetSearch.toLowerCase();
      const hasTarget = targetLower === "" || eq.variables.some(v =>
        v.symbol.toLowerCase() === targetLower ||
        v.name.toLowerCase().includes(targetLower)
      );
      if (!hasTarget) return false;
      let matchedCount = 0;
      eq.variables.forEach(v => {
        const weProvided = knowns.some(k => {
          if (k.name.toLowerCase() === v.symbol.toLowerCase()) return true;
          if (v.units.includes(k.unit)) return true;
          return false;
        });
        if (weProvided) matchedCount++;
      });
      return matchedCount >= 1;
    }).sort((a, b) => b.variables.length - a.variables.length);
  }, [hasSearched, knowns, targetSearch]);

  const getUnitSuggestion = (k: KnownVar) => {
    if (k.name || !k.unit) return null;
    return unitToVarName[k.unit] || null;
  };
  const getUnitSymbol = (k: KnownVar) => unitToSymbol[k.unit] || null;

  return (
    <section className="min-h-screen pt-8 pb-24 px-4 md:px-8 max-w-5xl mx-auto flex flex-col">
      <div className="mb-10 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Zap size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Smart Solver</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Enter what you know, find what fits</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card-border p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Target */}
          <div>
            <div className="text-lg md:text-xl font-serif font-semibold mb-3 text-foreground">What are you trying to find?</div>
            <TargetAutocomplete value={targetSearch} onChange={(v) => { setTargetSearch(v); setHasSearched(false); }} />
          </div>

          {/* Knowns */}
          <div className="space-y-4">
            <div className="text-lg md:text-xl font-serif font-semibold text-foreground">What values do you know?</div>

            <AnimatePresence initial={false}>
              {knowns.map((k) => {
                const suggestion = getUnitSuggestion(k);
                return (
                  <motion.div
                    key={k.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap p-3 rounded-xl bg-background/50 border border-border">
                      <VariableAutocomplete
                        value={k.name}
                        onChange={val => updateKnown(k.id, "name", val)}
                        placeholder="Symbol (e.g. R, V...)"
                        className="flex-1 min-w-[130px]"
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={k.value}
                        onChange={e => updateKnown(k.id, "value", e.target.value)}
                        className="flex-1 min-w-[100px] h-11 font-mono bg-card border-card-border focus:ring-2 focus:ring-primary"
                      />
                      {/* Unit picker: shows symbol-specific units when symbol is set, all units when empty */}
                      <UnitPicker
                        value={k.unit}
                        onChange={val => updateKnown(k.id, "unit", val)}
                        varSymbol={k.name}
                      />
                      {knowns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => removeKnown(k.id)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>

                    {suggestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground ml-3"
                      >
                        <span>Likely {suggestion}?</span>
                        <button
                          onClick={() => updateKnown(k.id, "name", getUnitSymbol(k) || "")}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        >
                          <Check size={10} /> Yes
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 border border-dashed border-border rounded-xl px-4 py-2.5 transition-colors w-full sm:w-auto"
              onClick={addKnown}
              data-testid="add-variable-button"
            >
              <Plus size={15} /> Add Variable
            </button>
          </div>

          <div className="pt-4 border-t border-border/40">
            <Button
              size="lg"
              className="w-full sm:w-auto px-10 h-12 text-base rounded-xl"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                boxShadow: "0 4px 20px rgba(37,99,235,0.3)"
              }}
              onClick={() => setHasSearched(true)}
              data-testid="search-equations-button"
            >
              <Search className="mr-2" size={18} /> Search Equations
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <h3 className="text-xl font-serif font-bold mb-5 text-foreground">
            {matches.length > 0
              ? `${matches.length} matching equation${matches.length !== 1 ? "s" : ""}`
              : "No equations found"}
          </h3>

          {matches.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-card-border text-muted-foreground">
              Try adding more variables or changing the target variable name.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {matches.map((eq, i) => {
                  const col = getCategoryColor(eq.category);
                  return (
                    <motion.button
                      key={eq.id}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setLocation(`/equation-library/${eq.id}`)}
                      className="flex flex-col text-left p-5 rounded-2xl border border-card-border bg-card hover:border-primary/40 transition-all group"
                      data-testid={`result-equation-${eq.id}`}
                    >
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mb-3 inline-block w-max ${col.badge}`}>
                        {eq.category}
                      </span>
                      <span className="font-serif font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{eq.name}</span>
                      <span className="font-mono text-muted-foreground text-sm">{eq.formula}</span>
                      <span className="mt-3 text-xs text-primary/70 group-hover:text-primary transition-colors">Open calculator →</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedEq && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 bg-card rounded-2xl border border-card-border shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border/40">
              <span className="font-serif font-bold text-lg">{selectedEq.name}</span>
              <button onClick={() => setSelectedEq(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X size={18} />
              </button>
            </div>
            <EquationDetail equation={selectedEq} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
