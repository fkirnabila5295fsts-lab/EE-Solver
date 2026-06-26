export interface EEVariable {
  symbol: string;
  name: string;
  units: string[];
}

export const EE_VARIABLES: EEVariable[] = [
  { symbol: "V",   name: "Voltage",               units: ["V", "mV", "kV", "μV", "MV"] },
  { symbol: "I",   name: "Current",               units: ["A", "mA", "μA", "nA", "kA"] },
  { symbol: "R",   name: "Resistance",            units: ["Ω", "kΩ", "MΩ", "mΩ"] },
  { symbol: "P",   name: "Power",                 units: ["W", "mW", "kW", "μW", "MW"] },
  { symbol: "C",   name: "Capacitance",           units: ["F", "mF", "μF", "nF", "pF"] },
  { symbol: "L",   name: "Inductance",            units: ["H", "mH", "μH", "nH"] },
  { symbol: "f",   name: "Frequency",             units: ["Hz", "kHz", "MHz", "GHz"] },
  { symbol: "τ",   name: "Time Constant",         units: ["s", "ms", "μs", "ns", "ps"] },
  { symbol: "Q",   name: "Charge",                units: ["C", "mC", "μC", "nC"] },
  { symbol: "E",   name: "Energy",                units: ["J", "mJ", "kJ"] },
  { symbol: "Z",   name: "Impedance",             units: ["Ω", "kΩ", "MΩ"] },
  { symbol: "X",   name: "Reactance",             units: ["Ω", "kΩ"] },
  { symbol: "Xc",  name: "Capacitive Reactance",  units: ["Ω", "kΩ"] },
  { symbol: "XL",  name: "Inductive Reactance",   units: ["Ω", "kΩ"] },
  { symbol: "F",   name: "Force",                 units: ["N", "kN", "mN"] },
  { symbol: "dB",  name: "Decibels",              units: ["dB"] },
  { symbol: "Vout",name: "Output Voltage",        units: ["V", "mV", "kV"] },
  { symbol: "Vin", name: "Input Voltage",         units: ["V", "mV", "kV"] },
  { symbol: "Req", name: "Equivalent Resistance", units: ["Ω", "kΩ", "MΩ"] },
  { symbol: "EMF", name: "Electromotive Force",   units: ["V", "mV", "kV"] },
  { symbol: "Δt",  name: "Time Interval",         units: ["s", "ms", "μs", "ns"] },
  { symbol: "ΔΦ",  name: "Flux Change",           units: ["Wb", "mWb", "μWb"] },
  { symbol: "N",   name: "Number of Turns",       units: ["turns"] },
];

export const ALL_UNITS = [
  "V", "mV", "kV", "μV", "MV",
  "A", "mA", "μA", "nA", "kA",
  "Ω", "kΩ", "MΩ", "mΩ",
  "W", "mW", "kW", "μW", "MW",
  "F", "mF", "μF", "nF", "pF",
  "H", "mH", "μH", "nH",
  "Hz", "kHz", "MHz", "GHz",
  "s", "ms", "μs", "ns", "ps",
  "C", "mC", "μC", "nC",
  "J", "mJ", "kJ",
  "N", "kN", "mN",
  "dB",
  "V/m", "kV/m", "N/C",
  "Wb", "mWb", "μWb",
  "turns",
];

/**
 * Returns units for a specific symbol.
 * - If symbol is empty → all units (so user can browse everything)
 * - If symbol is matched → only that variable's units
 * - If symbol is typed but unrecognised → all units as fallback
 */
export function getUnitsForSymbol(symbol: string): string[] {
  if (!symbol.trim()) return ALL_UNITS;
  const found = EE_VARIABLES.find(v =>
    v.symbol.toLowerCase() === symbol.toLowerCase() ||
    v.name.toLowerCase() === symbol.toLowerCase()
  );
  return found ? found.units : ALL_UNITS;
}

export const CATEGORY_COLORS: Record<string, { badge: string; glow: string; accent: string }> = {
  "Ohm's Law":      { badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",      glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",   accent: "#3b82f6" },
  "Power":          { badge: "bg-orange-500/15 text-orange-400 border-orange-500/30", glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]",   accent: "#f97316" },
  "Capacitance":    { badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",   accent: "#a855f7" },
  "Inductance":     { badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",       glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]",    accent: "#06b6d4" },
  "Frequency":      { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]", accent: "#10b981" },
  "Circuit Laws":   { badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",       glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]",    accent: "#f43f5e" },
  "Dividers":       { badge: "bg-teal-500/15 text-teal-400 border-teal-500/30",       glow: "shadow-[0_0_15px_rgba(20,184,166,0.2)]",   accent: "#14b8a6" },
  "Resistors":      { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",   accent: "#f59e0b" },
  "Signal":         { badge: "bg-pink-500/15 text-pink-400 border-pink-500/30",       glow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]",   accent: "#ec4899" },
  "Fields":         { badge: "bg-violet-500/15 text-violet-400 border-violet-500/30", glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]",   accent: "#8b5cf6" },
  "Basics":         { badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",       glow: "shadow-[0_0_15px_rgba(37,99,235,0.2)]",    accent: "#2563eb" },
  "Capacitors":     { badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",   accent: "#a855f7" },
  "AC Circuits":    { badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",       glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]",    accent: "#06b6d4" },
  "Transients":     { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]", accent: "#10b981" },
  "Electromagnetism": { badge: "bg-violet-500/15 text-violet-400 border-violet-500/30", glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]", accent: "#8b5cf6" },
  "Inductors":      { badge: "bg-teal-500/15 text-teal-400 border-teal-500/30",       glow: "shadow-[0_0_15px_rgba(20,184,166,0.2)]",   accent: "#14b8a6" },
  "Signals":        { badge: "bg-pink-500/15 text-pink-400 border-pink-500/30",       glow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]",   accent: "#ec4899" },
  "default":        { badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",       glow: "shadow-[0_0_15px_rgba(37,99,235,0.2)]",    accent: "#2563eb" },
};

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["default"];
}

// ─── Recently Solved (multi-entry history) ───────────────────────────────────

export interface RecentlySolved {
  equationId: string;
  equationName: string;
  formula: string;
  solvedFor: string;
  result: number;
  unit: string;
  step?: string;
  timestamp: number;
}

const RECENTS_KEY = "ee-recently-solved";
const RECENTS_EVENT = "ee-recents-updated";
const MAX_RECENTS = 10;

export function saveRecentlySolved(data: RecentlySolved) {
  try {
    const existing = getAllRecentlySolved();
    // De-duplicate: if same equationId + solvedFor exists, remove it first
    const filtered = existing.filter(r =>
      !(r.equationId === data.equationId && r.solvedFor === data.solvedFor)
    );
    const updated = [data, ...filtered].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(RECENTS_EVENT));
  } catch {}
}

function isValidRecent(x: unknown): x is RecentlySolved {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.equationId === "string" &&
    typeof r.equationName === "string" &&
    typeof r.formula === "string" &&
    typeof r.solvedFor === "string" &&
    typeof r.result === "number" &&
    typeof r.unit === "string" &&
    typeof r.timestamp === "number"
  );
}

export function getAllRecentlySolved(): RecentlySolved[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Backward-compat: handle old single-object format
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const valid = items.filter(isValidRecent);
    // If cleaned list differs, persist the sanitised version
    if (valid.length !== items.length) {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

export function getRecentlySolved(): RecentlySolved | null {
  const all = getAllRecentlySolved();
  return all.length > 0 ? all[0] : null;
}

export function clearRecentlySolved() {
  try {
    localStorage.removeItem(RECENTS_KEY);
    window.dispatchEvent(new Event(RECENTS_EVENT));
  } catch {}
}

export function useRecentlyUpdatedEvent(callback: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener(RECENTS_EVENT, callback);
    return () => window.removeEventListener(RECENTS_EVENT, callback);
  }
  return () => {};
}
