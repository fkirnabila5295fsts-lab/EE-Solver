import { useState } from "react";
import { VariableDef, unitConversions } from "../data/equations";

export function useVariableState(variables: VariableDef[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<Record<string, string>>(() => {
    const defaultUnits: Record<string, string> = {};
    variables.forEach(v => { defaultUnits[v.symbol] = v.unit; });
    return defaultUnits;
  });

  const getBaseValue = (symbol: string) => {
    const rawStr = values[symbol];
    if (!rawStr) return NaN;
    const num = parseFloat(rawStr);
    if (isNaN(num)) return NaN;
    const unit = units[symbol] || variables.find(v => v.symbol === symbol)?.unit || "";
    const multiplier = unitConversions[unit] || 1;
    return num * multiplier;
  };

  const getAllBaseValues = () => {
    const res: Record<string, number> = {};
    variables.forEach(v => { res[v.symbol] = getBaseValue(v.symbol); });
    return res;
  };

  return { values, setValues, units, setUnits, getBaseValue, getAllBaseValues };
}
