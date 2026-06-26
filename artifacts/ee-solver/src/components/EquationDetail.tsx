import { useState, useMemo } from "react";
import { EquationDef, unitConversions } from "../data/equations";
import { useVariableState } from "../hooks/use-variable-state";
import { ResultBubble } from "./ResultBubble";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveRecentlySolved, getCategoryColor } from "../data/variables";

export function EquationDetail({ equation }: { equation: EquationDef }) {
  const isExplanatory = equation.isExplanatoryOnly || equation.variables.length === 0;
  const col = getCategoryColor(equation.category);

  const [solveFor, setSolveFor] = useState(equation.variables[0]?.symbol || "");
  const { values, setValues, units, setUnits, getBaseValue } = useVariableState(equation.variables);
  const [result, setResult] = useState<{ value: number; unit: string; step?: string } | null>(null);

  const inputs = useMemo(() => equation.variables.filter(v => v.symbol !== solveFor), [equation, solveFor]);

  const handleCalculate = () => {
    const solver = equation.solvers[solveFor];
    if (!solver) return;

    const vars: Record<string, number> = {};
    for (const input of inputs) vars[input.symbol] = getBaseValue(input.symbol);

    const valBase = solver(vars);
    const targetDef = equation.variables.find(v => v.symbol === solveFor);
    const targetUnit = units[solveFor] || targetDef?.unit || "";
    const multiplier = unitConversions[targetUnit] || 1;
    const finalValue = valBase / multiplier;

    let stepStr: string | undefined;
    if (equation.stepBuilder?.[solveFor]) {
      const displayVals: Record<string, number> = {};
      const displayUnits: Record<string, string> = {};
      for (const input of inputs) {
        displayVals[input.symbol] = parseFloat(values[input.symbol] || "0");
        displayUnits[input.symbol] = units[input.symbol] || input.unit;
      }
      try { stepStr = equation.stepBuilder[solveFor](displayVals, displayUnits); } catch {}
    }

    const res = { value: finalValue, unit: targetUnit, step: stepStr };
    setResult(res);

    saveRecentlySolved({
      equationId: equation.id,
      equationName: equation.name,
      formula: equation.formula,
      solvedFor: solveFor,
      result: finalValue,
      unit: targetUnit,
      step: stepStr,
      timestamp: Date.now(),
    });
  };

  if (isExplanatory) {
    return (
      <div className="flex flex-col space-y-6 h-full p-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">{equation.name}</h2>
          <div
            className="text-xl font-mono px-4 py-3 rounded-xl inline-block border"
            style={{
              background: `linear-gradient(135deg, ${col.accent}18, ${col.accent}08)`,
              borderColor: `${col.accent}30`,
              color: col.accent,
              boxShadow: `0 0 15px ${col.accent}18`
            }}
          >
            {equation.formula}
          </div>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">{equation.description}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4 border-b border-border/40">
        <div
          className="text-xl font-mono px-4 py-3 rounded-xl inline-block border mb-3"
          style={{
            background: `linear-gradient(135deg, ${col.accent}18, ${col.accent}08)`,
            borderColor: `${col.accent}30`,
            color: col.accent,
            boxShadow: `0 0 15px ${col.accent}18`
          }}
        >
          {equation.formula}
        </div>
        {equation.description && (
          <p className="text-muted-foreground text-sm">{equation.description}</p>
        )}
      </div>

      <div className="px-6 pt-4 pb-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variables</Label>
        <div className="mt-2 rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Symbol</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Name</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">Unit</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium hidden md:table-cell">Description</th>
              </tr>
            </thead>
            <tbody>
              {equation.variables.map((v, i) => (
                <tr key={v.symbol} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/10"}>
                  <td className="px-3 py-2 font-mono text-primary font-semibold">{v.symbol}</td>
                  <td className="px-3 py-2 text-foreground">{v.name}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs hidden sm:table-cell">{v.unit}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs hidden md:table-cell">{v.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 pt-4 pb-6 space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculator</Label>
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Solve for</div>
          <Select value={solveFor} onValueChange={(v) => { setSolveFor(v); setResult(null); }}>
            <SelectTrigger className="h-11 bg-card border-card-border hover:border-primary/50 transition-colors" data-testid="solve-for-select">
              <SelectValue placeholder="Select variable to solve for" />
            </SelectTrigger>
            <SelectContent>
              {equation.variables.map(v => (
                <SelectItem key={v.symbol} value={v.symbol}>{v.symbol} — {v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          {inputs.map(v => (
            <div key={v.symbol} className="flex gap-2 items-end">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1 ml-0.5">
                  {v.name} <span className="font-mono text-primary/70">({v.symbol})</span>
                </div>
                <Input
                  type="number"
                  className="h-11 bg-card border-card-border focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.2)] font-mono"
                  placeholder="0.0"
                  value={values[v.symbol] || ""}
                  onChange={(e) => { setValues(prev => ({ ...prev, [v.symbol]: e.target.value })); setResult(null); }}
                  data-testid={`input-${v.symbol}`}
                />
              </div>
              <div className="w-24 shrink-0">
                <Select
                  value={units[v.symbol] || v.unit}
                  onValueChange={(u) => setUnits(prev => ({ ...prev, [v.symbol]: u }))}
                >
                  <SelectTrigger className="h-11 bg-card border-card-border text-xs" data-testid={`unit-${v.symbol}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {v.units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full h-12 text-base font-medium rounded-xl transition-all"
          style={{
            background: `linear-gradient(135deg, ${col.accent}, ${col.accent}cc)`,
            boxShadow: `0 4px 14px ${col.accent}40`,
          }}
          onClick={handleCalculate}
          data-testid="calculate-button"
        >
          Calculate
        </Button>

        {result && <ResultBubble value={result.value} unit={result.unit} step={result.step} />}
      </div>
    </div>
  );
}
