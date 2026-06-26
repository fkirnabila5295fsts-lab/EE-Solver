export const unitConversions: Record<string, number> = {
  'Ω': 1, 'kΩ': 1e3, 'MΩ': 1e6, 'mΩ': 1e-3,
  'A': 1, 'mA': 1e-3, 'μA': 1e-6, 'nA': 1e-9, 'kA': 1e3,
  'V': 1, 'mV': 1e-3, 'kV': 1e3, 'μV': 1e-6, 'MV': 1e6,
  'F': 1, 'μF': 1e-6, 'nF': 1e-9, 'pF': 1e-12, 'mF': 1e-3,
  'H': 1, 'mH': 1e-3, 'μH': 1e-6, 'nH': 1e-9,
  'Hz': 1, 'kHz': 1e3, 'MHz': 1e6, 'GHz': 1e9,
  'W': 1, 'mW': 1e-3, 'kW': 1e3, 'MW': 1e6, 'μW': 1e-6,
  's': 1, 'ms': 1e-3, 'μs': 1e-6, 'ns': 1e-9, 'ps': 1e-12,
  'C': 1, 'mC': 1e-3, 'μC': 1e-6, 'nC': 1e-9,
  'J': 1, 'mJ': 1e-3, 'kJ': 1e3,
  'N': 1, 'kN': 1e3, 'mN': 1e-3,
  'dB': 1,
  'V/m': 1, 'kV/m': 1e3, 'N/C': 1,
  'Wb': 1, 'mWb': 1e-3, 'μWb': 1e-6,
  'turns': 1,
  'm': 1, 'cm': 1e-2, 'mm': 1e-3, 'μm': 1e-6, 'nm': 1e-9
};

export interface VariableDef {
  symbol: string;
  name: string;
  unit: string;
  description: string;
  units: string[];
}

export interface EquationDef {
  id: string;
  name: string;
  formula: string;
  category: string;
  description?: string;
  variables: VariableDef[];
  solvers: Record<string, (vars: Record<string, number>) => number>;
  stepBuilder?: Record<string, (vars: Record<string, number>, units: Record<string, string>) => string>;
  isExplanatoryOnly?: boolean;
}

export const formatNumber = (num: number) => {
  if (num === 0) return "0";
  if (Math.abs(num) >= 1e6 || Math.abs(num) < 1e-4) {
    return num.toExponential(4).replace(/e\+?/, ' × 10^');
  }
  return parseFloat(num.toPrecision(6)).toString();
};

const R_UNITS = ["Ω", "kΩ", "MΩ", "mΩ"];
const I_UNITS = ["A", "mA", "μA", "nA"];
const V_UNITS = ["V", "mV", "kV", "μV"];
const P_UNITS = ["W", "mW", "kW", "μW"];
const C_UNITS = ["F", "mF", "μF", "nF", "pF"];
const L_UNITS = ["H", "mH", "μH", "nH"];
const F_UNITS = ["Hz", "kHz", "MHz", "GHz"];
const T_UNITS = ["s", "ms", "μs", "ns"];
const Q_UNITS = ["C", "mC", "μC", "nC"];
const E_UNITS = ["J", "mJ", "kJ"];
const N_UNITS = ["N", "kN", "mN"];
const DB_UNITS = ["dB"];
const k_c = 8.99e9;

export const equations: EquationDef[] = [
  {
    id: "ohms_law",
    name: "Ohm's Law",
    formula: "V = I × R",
    category: "Basics",
    variables: [
      { symbol: "V", name: "Voltage", unit: "V", description: "Electrical potential", units: V_UNITS },
      { symbol: "I", name: "Current", unit: "A", description: "Flow of electric charge", units: I_UNITS },
      { symbol: "R", name: "Resistance", unit: "Ω", description: "Opposition to current flow", units: R_UNITS }
    ],
    solvers: { "V": ({ I, R }) => I * R, "I": ({ V, R }) => V / R, "R": ({ V, I }) => V / I },
    stepBuilder: {
      "V": ({ I, R }, u) => `V = ${I}${u.I} × ${R}${u.R}`,
      "I": ({ V, R }, u) => `I = ${V}${u.V} / ${R}${u.R}`,
      "R": ({ V, I }, u) => `R = ${V}${u.V} / ${I}${u.I}`
    }
  },
  {
    id: "power_vi",
    name: "Power (P=VI)",
    formula: "P = V × I",
    category: "Power",
    variables: [
      { symbol: "P", name: "Power", unit: "W", description: "Electrical power", units: P_UNITS },
      { symbol: "V", name: "Voltage", unit: "V", description: "Electrical potential", units: V_UNITS },
      { symbol: "I", name: "Current", unit: "A", description: "Current", units: I_UNITS }
    ],
    solvers: { "P": ({ V, I }) => V * I, "V": ({ P, I }) => P / I, "I": ({ P, V }) => P / V }
  },
  {
    id: "power_i2r",
    name: "Power (P=I²R)",
    formula: "P = I² × R",
    category: "Power",
    variables: [
      { symbol: "P", name: "Power", unit: "W", description: "Electrical power", units: P_UNITS },
      { symbol: "I", name: "Current", unit: "A", description: "Current", units: I_UNITS },
      { symbol: "R", name: "Resistance", unit: "Ω", description: "Resistance", units: R_UNITS }
    ],
    solvers: { "P": ({ I, R }) => I * I * R, "I": ({ P, R }) => Math.sqrt(P / R), "R": ({ P, I }) => P / (I * I) }
  },
  {
    id: "power_v2r",
    name: "Power (P=V²/R)",
    formula: "P = V² / R",
    category: "Power",
    variables: [
      { symbol: "P", name: "Power", unit: "W", description: "Electrical power", units: P_UNITS },
      { symbol: "V", name: "Voltage", unit: "V", description: "Voltage", units: V_UNITS },
      { symbol: "R", name: "Resistance", unit: "Ω", description: "Resistance", units: R_UNITS }
    ],
    solvers: { "P": ({ V, R }) => (V * V) / R, "V": ({ P, R }) => Math.sqrt(P * R), "R": ({ V, P }) => (V * V) / P }
  },
  {
    id: "cap_charge",
    name: "Capacitor Charge",
    formula: "Q = C × V",
    category: "Capacitors",
    variables: [
      { symbol: "Q", name: "Charge", unit: "C", description: "Stored charge", units: Q_UNITS },
      { symbol: "C", name: "Capacitance", unit: "F", description: "Capacitance", units: C_UNITS },
      { symbol: "V", name: "Voltage", unit: "V", description: "Voltage", units: V_UNITS }
    ],
    solvers: { "Q": ({ C, V }) => C * V, "C": ({ Q, V }) => Q / V, "V": ({ Q, C }) => Q / C }
  },
  {
    id: "cap_energy",
    name: "Capacitor Energy",
    formula: "E = ½ × C × V²",
    category: "Capacitors",
    variables: [
      { symbol: "E", name: "Energy", unit: "J", description: "Stored energy", units: E_UNITS },
      { symbol: "C", name: "Capacitance", unit: "F", description: "Capacitance", units: C_UNITS },
      { symbol: "V", name: "Voltage", unit: "V", description: "Voltage", units: V_UNITS }
    ],
    solvers: { "E": ({ C, V }) => 0.5 * C * V * V, "C": ({ E, V }) => (2 * E) / (V * V), "V": ({ E, C }) => Math.sqrt((2 * E) / C) }
  },
  {
    id: "rc_time",
    name: "RC Time Constant",
    formula: "τ = R × C",
    category: "Transients",
    variables: [
      { symbol: "τ", name: "Time Constant", unit: "s", description: "Time to 63.2%", units: T_UNITS },
      { symbol: "R", name: "Resistance", unit: "Ω", description: "Resistance", units: R_UNITS },
      { symbol: "C", name: "Capacitance", unit: "F", description: "Capacitance", units: C_UNITS }
    ],
    solvers: { "τ": ({ R, C }) => R * C, "R": ({ τ, C }) => τ / C, "C": ({ τ, R }) => τ / R }
  },
  {
    id: "res_freq",
    name: "Resonant Frequency",
    formula: "f = 1 / (2π × √(LC))",
    category: "AC Circuits",
    variables: [
      { symbol: "f", name: "Frequency", unit: "Hz", description: "Resonant frequency", units: F_UNITS },
      { symbol: "L", name: "Inductance", unit: "H", description: "Inductance", units: L_UNITS },
      { symbol: "C", name: "Capacitance", unit: "F", description: "Capacitance", units: C_UNITS }
    ],
    solvers: {
      "f": ({ L, C }) => 1 / (2 * Math.PI * Math.sqrt(L * C)),
      "L": ({ f, C }) => 1 / (4 * Math.PI * Math.PI * f * f * C),
      "C": ({ f, L }) => 1 / (4 * Math.PI * Math.PI * f * f * L)
    }
  },
  {
    id: "impedance",
    name: "Impedance (Magnitude)",
    formula: "Z = √(R² + X²)",
    category: "AC Circuits",
    variables: [
      { symbol: "Z", name: "Impedance", unit: "Ω", description: "Total impedance", units: R_UNITS },
      { symbol: "R", name: "Resistance", unit: "Ω", description: "Resistance", units: R_UNITS },
      { symbol: "X", name: "Reactance", unit: "Ω", description: "Total reactance", units: R_UNITS }
    ],
    solvers: {
      "Z": ({ R, X }) => Math.sqrt(R * R + X * X),
      "R": ({ Z, X }) => Math.sqrt(Z * Z - X * X),
      "X": ({ Z, R }) => Math.sqrt(Z * Z - R * R)
    }
  },
  {
    id: "volt_div",
    name: "Voltage Divider",
    formula: "Vout = Vin × R2 / (R1 + R2)",
    category: "Basics",
    variables: [
      { symbol: "Vout", name: "Output Voltage", unit: "V", description: "Voltage across R2", units: V_UNITS },
      { symbol: "Vin", name: "Input Voltage", unit: "V", description: "Total voltage", units: V_UNITS },
      { symbol: "R1", name: "Resistance 1", unit: "Ω", description: "Top resistor", units: R_UNITS },
      { symbol: "R2", name: "Resistance 2", unit: "Ω", description: "Bottom resistor", units: R_UNITS }
    ],
    solvers: {
      "Vout": ({ Vin, R1, R2 }) => Vin * R2 / (R1 + R2),
      "Vin": ({ Vout, R1, R2 }) => Vout * (R1 + R2) / R2,
      "R1": ({ Vout, Vin, R2 }) => R2 * (Vin - Vout) / Vout,
      "R2": ({ Vout, Vin, R1 }) => Vout * R1 / (Vin - Vout)
    }
  },
  {
    id: "curr_div",
    name: "Current Divider",
    formula: "I1 = Itotal × R2 / (R1 + R2)",
    category: "Basics",
    variables: [
      { symbol: "I1", name: "Branch Current", unit: "A", description: "Current through R1", units: I_UNITS },
      { symbol: "Itotal", name: "Total Current", unit: "A", description: "Input current", units: I_UNITS },
      { symbol: "R1", name: "Resistance 1", unit: "Ω", description: "Branch 1 resistor", units: R_UNITS },
      { symbol: "R2", name: "Resistance 2", unit: "Ω", description: "Branch 2 resistor", units: R_UNITS }
    ],
    solvers: {
      "I1": ({ Itotal, R1, R2 }) => Itotal * R2 / (R1 + R2),
      "Itotal": ({ I1, R1, R2 }) => I1 * (R1 + R2) / R2,
      "R1": ({ I1, Itotal, R2 }) => R2 * (Itotal - I1) / I1,
      "R2": ({ I1, Itotal, R1 }) => I1 * R1 / (Itotal - I1)
    }
  },
  {
    id: "series_res",
    name: "Series Resistors",
    formula: "Req = R1 + R2 + R3",
    category: "Basics",
    variables: [
      { symbol: "Req", name: "Equivalent Res.", unit: "Ω", description: "Total resistance", units: R_UNITS },
      { symbol: "R1", name: "Resistance 1", unit: "Ω", description: "First resistor", units: R_UNITS },
      { symbol: "R2", name: "Resistance 2", unit: "Ω", description: "Second resistor", units: R_UNITS },
      { symbol: "R3", name: "Resistance 3", unit: "Ω", description: "Third resistor", units: R_UNITS }
    ],
    solvers: {
      "Req": ({ R1, R2, R3 }) => R1 + R2 + R3,
      "R1": ({ Req, R2, R3 }) => Req - R2 - R3,
      "R2": ({ Req, R1, R3 }) => Req - R1 - R3,
      "R3": ({ Req, R1, R2 }) => Req - R1 - R2
    }
  },
  {
    id: "parallel_res",
    name: "Parallel Resistors (2)",
    formula: "Req = (R1 × R2) / (R1 + R2)",
    category: "Basics",
    variables: [
      { symbol: "Req", name: "Equivalent Res.", unit: "Ω", description: "Total resistance", units: R_UNITS },
      { symbol: "R1", name: "Resistance 1", unit: "Ω", description: "First branch", units: R_UNITS },
      { symbol: "R2", name: "Resistance 2", unit: "Ω", description: "Second branch", units: R_UNITS }
    ],
    solvers: {
      "Req": ({ R1, R2 }) => (R1 * R2) / (R1 + R2),
      "R1": ({ Req, R2 }) => (Req * R2) / (R2 - Req),
      "R2": ({ Req, R1 }) => (Req * R1) / (R1 - Req)
    }
  },
  {
    id: "db_volt",
    name: "Decibels (Voltage)",
    formula: "dB = 20 × log10(V2 / V1)",
    category: "Signals",
    variables: [
      { symbol: "dB", name: "Decibels", unit: "dB", description: "Voltage ratio in dB", units: DB_UNITS },
      { symbol: "V2", name: "Voltage 2", unit: "V", description: "Output voltage", units: V_UNITS },
      { symbol: "V1", name: "Voltage 1", unit: "V", description: "Input voltage", units: V_UNITS }
    ],
    solvers: {
      "dB": ({ V2, V1 }) => 20 * Math.log10(V2 / V1),
      "V2": ({ dB, V1 }) => V1 * Math.pow(10, dB / 20),
      "V1": ({ dB, V2 }) => V2 / Math.pow(10, dB / 20)
    }
  },
  {
    id: "db_power",
    name: "Decibels (Power)",
    formula: "dB = 10 × log10(P2 / P1)",
    category: "Signals",
    variables: [
      { symbol: "dB", name: "Decibels", unit: "dB", description: "Power ratio in dB", units: DB_UNITS },
      { symbol: "P2", name: "Power 2", unit: "W", description: "Output power", units: P_UNITS },
      { symbol: "P1", name: "Power 1", unit: "W", description: "Input power", units: P_UNITS }
    ],
    solvers: {
      "dB": ({ P2, P1 }) => 10 * Math.log10(P2 / P1),
      "P2": ({ dB, P1 }) => P1 * Math.pow(10, dB / 10),
      "P1": ({ dB, P2 }) => P2 / Math.pow(10, dB / 10)
    }
  },
  {
    id: "faraday",
    name: "Faraday's Law (Magnitude)",
    formula: "EMF = N × ΔΦ / Δt",
    category: "Electromagnetism",
    variables: [
      { symbol: "EMF", name: "Ind. Voltage", unit: "V", description: "Induced electromotive force", units: V_UNITS },
      { symbol: "N", name: "Turns", unit: "turns", description: "Number of turns", units: ["turns"] },
      { symbol: "ΔΦ", name: "Change in Flux", unit: "Wb", description: "Change in magnetic flux", units: ["Wb", "mWb", "μWb"] },
      { symbol: "Δt", name: "Time interval", unit: "s", description: "Time taken", units: T_UNITS }
    ],
    solvers: {
      "EMF": ({ N, "ΔΦ": dPhi, "Δt": dt }) => N * dPhi / dt,
      "N": ({ EMF, "ΔΦ": dPhi, "Δt": dt }) => EMF * dt / dPhi,
      "ΔΦ": ({ EMF, N, "Δt": dt }) => EMF * dt / N,
      "Δt": ({ EMF, N, "ΔΦ": dPhi }) => N * dPhi / EMF
    }
  },
  {
    id: "coulomb",
    name: "Coulomb's Law",
    formula: "F = k × q1 × q2 / r²",
    category: "Electromagnetism",
    variables: [
      { symbol: "F", name: "Force", unit: "N", description: "Electrostatic force", units: N_UNITS },
      { symbol: "q1", name: "Charge 1", unit: "C", description: "First charge", units: Q_UNITS },
      { symbol: "q2", name: "Charge 2", unit: "C", description: "Second charge", units: Q_UNITS },
      { symbol: "r", name: "Distance", unit: "m", description: "Distance between charges", units: ["m", "cm", "mm"] }
    ],
    solvers: {
      "F": ({ q1, q2, r }) => k_c * q1 * q2 / (r * r),
      "q1": ({ F, q2, r }) => F * r * r / (k_c * q2),
      "q2": ({ F, q1, r }) => F * r * r / (k_c * q1),
      "r": ({ F, q1, q2 }) => Math.sqrt(Math.abs(k_c * q1 * q2 / F))
    }
  },
  {
    id: "electric_field",
    name: "Electric Field",
    formula: "E = F / q",
    category: "Electromagnetism",
    variables: [
      { symbol: "E", name: "E-Field", unit: "V/m", description: "Electric field strength", units: ["V/m", "kV/m", "N/C"] },
      { symbol: "F", name: "Force", unit: "N", description: "Force on charge", units: N_UNITS },
      { symbol: "q", name: "Charge", unit: "C", description: "Test charge", units: Q_UNITS }
    ],
    solvers: {
      "E": ({ F, q }) => F / q,
      "F": ({ E, q }) => E * q,
      "q": ({ F, E }) => F / E
    }
  },
  {
    id: "inductor_energy",
    name: "Inductor Energy",
    formula: "E = ½ × L × I²",
    category: "Inductors",
    variables: [
      { symbol: "E", name: "Energy", unit: "J", description: "Stored magnetic energy", units: E_UNITS },
      { symbol: "L", name: "Inductance", unit: "H", description: "Inductance", units: L_UNITS },
      { symbol: "I", name: "Current", unit: "A", description: "Current", units: I_UNITS }
    ],
    solvers: {
      "E": ({ L, I }) => 0.5 * L * I * I,
      "L": ({ E, I }) => 2 * E / (I * I),
      "I": ({ E, L }) => Math.sqrt(2 * E / L)
    }
  },
  {
    id: "cap_reactance",
    name: "Capacitor Reactance",
    formula: "Xc = 1 / (2π × f × C)",
    category: "AC Circuits",
    variables: [
      { symbol: "Xc", name: "Reactance", unit: "Ω", description: "Capacitive reactance", units: R_UNITS },
      { symbol: "f", name: "Frequency", unit: "Hz", description: "AC Frequency", units: F_UNITS },
      { symbol: "C", name: "Capacitance", unit: "F", description: "Capacitance", units: C_UNITS }
    ],
    solvers: {
      "Xc": ({ f, C }) => 1 / (2 * Math.PI * f * C),
      "f": ({ Xc, C }) => 1 / (2 * Math.PI * Xc * C),
      "C": ({ Xc, f }) => 1 / (2 * Math.PI * f * Xc)
    }
  },
  {
    id: "ind_reactance",
    name: "Inductor Reactance",
    formula: "XL = 2π × f × L",
    category: "AC Circuits",
    variables: [
      { symbol: "XL", name: "Reactance", unit: "Ω", description: "Inductive reactance", units: R_UNITS },
      { symbol: "f", name: "Frequency", unit: "Hz", description: "AC Frequency", units: F_UNITS },
      { symbol: "L", name: "Inductance", unit: "H", description: "Inductance", units: L_UNITS }
    ],
    solvers: {
      "XL": ({ f, L }) => 2 * Math.PI * f * L,
      "f": ({ XL, L }) => XL / (2 * Math.PI * L),
      "L": ({ XL, f }) => XL / (2 * Math.PI * f)
    }
  },
  {
    id: "kvl",
    name: "Kirchhoff's Voltage Law",
    formula: "ΣV = 0",
    category: "Basics",
    description: "The directed sum of the potential differences (voltages) around any closed loop is zero.",
    isExplanatoryOnly: true,
    variables: [],
    solvers: {}
  },
  {
    id: "kcl",
    name: "Kirchhoff's Current Law",
    formula: "ΣI = 0",
    category: "Basics",
    description: "The algebraic sum of currents in a network of conductors meeting at a point is zero.",
    isExplanatoryOnly: true,
    variables: [],
    solvers: {}
  }
];
