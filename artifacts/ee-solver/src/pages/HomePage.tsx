import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useLocation } from "wouter";
import { BookOpen, Zap, Check, Clock, ArrowRight, ChevronDown } from "lucide-react";
import { getAllRecentlySolved, RecentlySolved, useRecentlyUpdatedEvent } from "../data/variables";
import { formatNumber } from "../data/equations";

// ─── Floating soft orbs — pure CSS animation (compositor thread) ──────────────
const ORB_DATA = [
  { size: 560, x: "0%",   y: "5%",  color: "rgba(37,99,235,0.18)",  kf: "orb-a", dur: "22s", delay: "0s"   },
  { size: 380, x: "68%",  y: "2%",  color: "rgba(124,58,237,0.14)", kf: "orb-b", dur: "26s", delay: "3s"   },
  { size: 600, x: "44%",  y: "42%", color: "rgba(37,99,235,0.09)",  kf: "orb-c", dur: "30s", delay: "6s"   },
  { size: 300, x: "10%",  y: "58%", color: "rgba(6,182,212,0.15)",  kf: "orb-a", dur: "24s", delay: "2s"   },
  { size: 440, x: "76%",  y: "65%", color: "rgba(168,85,247,0.10)", kf: "orb-b", dur: "32s", delay: "9s"   },
  { size: 260, x: "30%",  y: "20%", color: "rgba(16,185,129,0.10)", kf: "orb-c", dur: "20s", delay: "4s"   },
];

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {ORB_DATA.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            backgroundColor: orb.color,
            filter: "blur(80px)",
            willChange: "transform",
            animation: `${orb.kf} ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated grid (static, no JS needed) ─────────────────────────────────────
function AnimatedGrid() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
      }}
    />
  );
}

// ─── Radar rings — pure CSS expand + fade ─────────────────────────────────────
const RADAR_RINGS = [
  { size: 200,  delay: "0s",    color: "rgba(37,99,235,0.40)",  dur: "5s"  },
  { size: 380,  delay: "0.9s",  color: "rgba(37,99,235,0.28)",  dur: "5s"  },
  { size: 580,  delay: "1.8s",  color: "rgba(124,58,237,0.18)", dur: "5s"  },
  { size: 800,  delay: "2.7s",  color: "rgba(37,99,235,0.12)",  dur: "5s"  },
  { size: 1040, delay: "3.6s",  color: "rgba(6,182,212,0.08)",  dur: "5s"  },
];

function RadarRings() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {RADAR_RINGS.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: r.size, height: r.size,
            borderColor: r.color,
            willChange: "transform, opacity",
            animation: `radar-expand ${r.dur} cubic-bezier(0.16,1,0.3,1) infinite`,
            animationDelay: r.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Decorative spinning rings — pure CSS ─────────────────────────────────────
const DECO_RINGS = [
  { size: 320,  kf: "spin-cw",  dur: "70s",  color: "rgba(37,99,235,0.09)",  style: "solid"  },
  { size: 500,  kf: "spin-ccw", dur: "90s",  color: "rgba(124,58,237,0.07)", style: "dashed" },
  { size: 700,  kf: "spin-cw",  dur: "120s", color: "rgba(37,99,235,0.06)",  style: "solid"  },
  { size: 920,  kf: "spin-ccw", dur: "160s", color: "rgba(6,182,212,0.04)",  style: "solid"  },
];

function DecorativeRings() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {DECO_RINGS.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: r.size, height: r.size,
            borderColor: r.color,
            borderStyle: r.style,
            willChange: "transform",
            animation: `${r.kf} ${r.dur} linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Orbiting dots — CSS spin on container, dot pinned at top ─────────────────
const ORBIT_DATA = [
  { r: 160, dotSize: 5, color: "#3b82f6", dur: "9s",  startDeg: 0   },
  { r: 160, dotSize: 3, color: "#818cf8", dur: "9s",  startDeg: 180 },
  { r: 260, dotSize: 4, color: "#06b6d4", dur: "15s", startDeg: 60  },
  { r: 260, dotSize: 3, color: "#7c3aed", dur: "15s", startDeg: 240 },
  { r: 360, dotSize: 5, color: "#2563eb", dur: "22s", startDeg: 120 },
  { r: 360, dotSize: 2, color: "#a5f3fc", dur: "22s", startDeg: 300 },
];

function OrbitingDots() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {ORBIT_DATA.map((o, i) => (
        /* Outer: sets phase offset as a static rotate — no animation conflict.
           Inner: runs the full 0→360 spin cleanly with no snap at loop boundary. */
        <div
          key={i}
          className="absolute"
          style={{ width: o.r * 2, height: o.r * 2, transform: `rotate(${o.startDeg}deg)` }}
        >
          <div
            className="absolute inset-0"
            style={{
              willChange: "transform",
              animation: `spin-cw ${o.dur} linear infinite`,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: o.dotSize,
                height: o.dotSize,
                top: 0,
                left: "50%",
                marginLeft: -(o.dotSize / 2),
                backgroundColor: o.color,
                boxShadow: `0 0 ${o.dotSize * 3}px ${o.color}`,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Floating particles — pure CSS, opacity + translateY only ─────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: `${(i * 47 + 13) % 100}%`,
  y: `${(i * 61 + 9)  % 100}%`,
  size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  color: i % 5 === 0 ? "rgba(99,179,237,0.75)"
       : i % 4 === 0 ? "rgba(168,85,247,0.65)"
       : i % 3 === 0 ? "rgba(6,182,212,0.55)"
       :               "rgba(59,130,246,0.55)",
  dur: `${3 + (i % 5)}s`,
  delay: `${(i * 0.31) % 5}s`,
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            willChange: "transform, opacity",
            animation: `particle-rise ${p.dur} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Circuit illustration for Equation Library card ──────────────────────────
function CircuitIllustration() {
  return (
    <div className="relative w-full h-40 rounded-xl bg-gradient-to-br from-blue-500/8 to-cyan-500/12 border border-blue-500/20 overflow-hidden">
      <svg viewBox="0 0 300 160" className="w-full h-full">
        <motion.path d="M20 80 L75 80 L75 36 L135 36 L135 80 L215 80 L215 128 L275 128"
          stroke="rgba(59,130,246,0.65)" strokeWidth="2" fill="none" strokeDasharray="5 5" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.path d="M20 80 L75 80 L75 128 L155 128 L155 80 L275 80"
          stroke="rgba(6,182,212,0.45)" strokeWidth="1.5" fill="none" strokeDasharray="3 7" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }} />
        {[[75,80],[135,36],[135,80],[215,80],[215,128],[155,128],[155,80]].map(([cx,cy], i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={4} fill="rgba(59,130,246,0.85)"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.2, 0.85] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.28 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }} />
        ))}
        <text x="148" y="68" textAnchor="middle" fill="rgba(147,197,253,0.85)" fontSize="12" fontFamily="monospace" fontWeight="bold">V = IR</text>
        <text x="75"  y="152" textAnchor="middle" fill="rgba(6,182,212,0.6)"   fontSize="9" fontFamily="monospace">P = VI</text>
        <text x="215" y="48"  textAnchor="middle" fill="rgba(168,85,247,0.6)"  fontSize="9" fontFamily="monospace">Z = R+jX</text>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Smart solver illustration ────────────────────────────────────────────────
function SmartSolverIllustration() {
  return (
    <div className="relative w-full h-40 rounded-xl bg-gradient-to-br from-purple-500/8 to-cyan-500/12 border border-purple-500/20 overflow-hidden p-4 flex items-center">
      <div className="flex flex-col gap-2.5 w-full">
        {[
          { label: "R = 10", unit: "kΩ", delay: 0,    color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
          { label: "I = 2",  unit: "mA", delay: 0.35, color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" },
          { label: "V = ?",  unit: "V",  delay: 0.7,  color: "border-blue-500/50 bg-blue-500/15 text-blue-300", highlight: true },
        ].map((row, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: row.delay, duration: 0.5, repeat: Infinity, repeatDelay: 2.8 }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono border ${row.color}`}
          >
            <span className="flex-1 font-semibold">{row.label}</span>
            <span className="text-xs opacity-75">{row.unit}</span>
            {row.highlight && (
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-blue-400 font-bold text-base">|</motion.span>
            )}
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Recently Solved mini illustration ───────────────────────────────────────
function RecentIllustration() {
  const items = [
    { eq: "Ohm's Law",      result: "V = 5.0 V",    color: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
    { eq: "Power (P=VI)",   result: "P = 10 W",     color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
    { eq: "RC Time",        result: "τ = 2.2 ms",   color: "border-purple-500/40 bg-purple-500/10 text-purple-300" },
  ];
  return (
    <div className="relative w-full h-40 rounded-xl bg-gradient-to-br from-primary/8 to-emerald-500/8 border border-primary/20 overflow-hidden p-4 flex items-center">
      <div className="flex flex-col gap-2 w-full">
        {items.map((it, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.25, duration: 0.4, repeat: Infinity, repeatDelay: 3.5 }}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs border ${it.color}`}
          >
            <span className="font-medium truncate">{it.eq}</span>
            <span className="font-mono font-bold shrink-0">{it.result}</span>
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Recent history strip (hero area) ────────────────────────────────────────
function RecentStrip({ recents }: { recents: RecentlySolved[] }) {
  const [, setLocation] = useLocation();
  if (recents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.4 }}
      className="flex items-center gap-2 flex-wrap justify-center"
    >
      <span className="text-xs text-muted-foreground/60 font-medium">Recent:</span>
      {recents.slice(0, 3).map((r, i) => (
        <motion.button
          key={`${r.equationId}-${r.solvedFor}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 + i * 0.08 }}
          onClick={() => setLocation(`/equation-library/${r.equationId}`)}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 hover:bg-primary/15 hover:border-primary/40 transition-all text-xs backdrop-blur-sm"
          style={{ boxShadow: "0 0 12px rgba(37,99,235,0.08)" }}
        >
          <Clock size={10} className="text-primary/60" />
          <span className="text-foreground/80 font-medium">{r.equationName}</span>
          <span className="text-primary font-mono font-semibold">{r.solvedFor}={formatNumber(r.result)}{r.unit}</span>
          <ArrowRight size={10} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </motion.button>
      ))}
      {recents.length > 3 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.65 }}
          onClick={() => setLocation("/recently-solved")}
          className="text-xs text-muted-foreground/60 hover:text-primary transition-colors px-2 py-1.5 rounded-full hover:bg-primary/8"
        >
          +{recents.length - 3} more
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export function HomePage() {
  const title = "EESolver";
  const [recents, setRecents] = useState<RecentlySolved[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const refresh = () => setRecents(getAllRecentlySolved());

  useEffect(() => {
    refresh();
    const cleanup = useRecentlyUpdatedEvent(refresh);
    window.addEventListener("storage", refresh);
    return () => { cleanup(); window.removeEventListener("storage", refresh); };
  }, []);

  const modeCards = [
    {
      href: "/equation-library",
      title: "Equation Library",
      icon: <BookOpen size={20} className="text-blue-400" />,
      iconBg: "bg-blue-500/15 border-blue-500/20",
      desc: "Browse 23 essential EE equations — from Ohm's Law to Faraday's Law. Each equation has its own calculator with full unit conversion.",
      features: ["23 equations across 6 categories", "Solve for any variable", "Auto unit conversion (kΩ, mA, μF…)"],
      checkColor: "text-blue-400",
      hoverBorder: "hover:border-blue-500/40",
      hoverShadow: "hover:shadow-[0_0_40px_rgba(37,99,235,0.14)]",
      cta: "Open Library →",
      ctaStyle: { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
      ctaGlow: "group-hover:shadow-[0_0_20px_rgba(37,99,235,0.45)]",
      illustration: <CircuitIllustration />,
    },
    {
      href: "/smart-solver",
      title: "Smart Solver",
      icon: <Zap size={20} className="text-purple-400" />,
      iconBg: "bg-purple-500/15 border-purple-500/20",
      desc: "Tell us what you know, we'll find what fits. Enter your known variables and units — the Smart Solver figures out which equations apply.",
      features: ["Variable recognition from units", "Matches equations automatically", "Autocomplete for variable names"],
      checkColor: "text-purple-400",
      hoverBorder: "hover:border-purple-500/40",
      hoverShadow: "hover:shadow-[0_0_40px_rgba(124,58,237,0.14)]",
      cta: "Try Smart Solver →",
      ctaStyle: { background: "linear-gradient(135deg, #7c3aed, #2563eb)" },
      ctaGlow: "group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]",
      illustration: <SmartSolverIllustration />,
    },
    {
      href: "/recently-solved",
      title: "Recently Solved",
      icon: <Clock size={20} className="text-primary" />,
      iconBg: "bg-primary/15 border-primary/20",
      desc: `Your last ${recents.length > 0 ? `${recents.length} calculation${recents.length !== 1 ? "s" : ""}` : "calculations"}, always one click away. Jump back into any equation instantly.`,
      features: ["Full history up to 10 entries", "One-click re-open", "Auto-updated on every solve"],
      checkColor: "text-primary",
      hoverBorder: "hover:border-primary/40",
      hoverShadow: "hover:shadow-[0_0_40px_rgba(37,99,235,0.14)]",
      cta: recents.length > 0 ? `View ${recents.length} Recent${recents.length !== 1 ? "s" : ""} →` : "View History →",
      ctaStyle: { background: "linear-gradient(135deg, #2563eb, #06b6d4)" },
      ctaGlow: "group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]",
      illustration: <RecentIllustration />,
    },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background">
      <FloatingOrbs />
      <AnimatedGrid />
      <DecorativeRings />
      <RadarRings />
      <OrbitingDots />
      <FloatingParticles />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 z-10 text-center pt-16"
      >
        {/* Background circuit board photo — subtle, futuristic */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=60')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.045,
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary/80 font-medium backdrop-blur-sm"
          style={{ boxShadow: "0 0 16px rgba(37,99,235,0.12)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
          Electrical engineering toolkit
        </motion.div>

        {/* Title — "EE" massive, "SOLVER" same line but stepped down */}
        <h1 className="flex items-baseline justify-center font-serif font-bold tracking-tight mb-4 leading-none flex-wrap gap-x-3">
          {/* EE — big, classy Cormorant Garamond */}
          {"EE".split("").map((letter, i) => (
            <motion.span
              key={`ee-${i}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(5rem, 18vw, 10rem)",
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontStyle: "italic",
                background: "linear-gradient(135deg, #93c5fd 0%, #3b82f6 35%, #2563eb 60%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 32px rgba(37,99,235,0.65))",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              {letter}
            </motion.span>
          ))}
          {/* SOLVER — same line, noticeably smaller */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(1.5rem, 5vw, 3rem)",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "hsl(var(--foreground) / 0.85)",
              letterSpacing: "0.28em",
            }}
          >
            SOLVER
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="font-sans text-sm md:text-base text-muted-foreground mb-6 max-w-sm"
        >
          Solve electrical engineering problems instantly.<br />
          <span className="text-foreground/70">Browse equations or let the smart solver do the work.</span>
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          {[
            { label: "23 Equations", color: "text-blue-400 border-blue-500/30 bg-blue-500/8" },
            { label: "All SI units",  color: "text-purple-400 border-purple-500/30 bg-purple-500/8" },
            { label: "Instant calc",  color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/8" },
            { label: "No login",      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8" },
          ].map((pill, i) => (
            <motion.div
              key={pill.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95 + i * 0.07 }}
              className={`border rounded-full px-3.5 py-1 text-xs font-medium ${pill.color}`}
            >
              {pill.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="absolute bottom-10 text-muted-foreground/35"
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.section>

      {/* ── MODE CARDS ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 border-t border-border/10 bg-background/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold inline-block relative">
              Choose your mode
              <div
                className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, #2563eb, #7c3aed, #06b6d4, transparent)" }}
              />
            </h2>
            <p className="text-muted-foreground mt-4 text-base">Three ways to tackle any EE problem</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {modeCards.map((card, idx) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={card.href}>
                  <div className={`group h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 ${card.hoverBorder} ${card.hoverShadow} transition-all duration-500 cursor-pointer flex flex-col`}>
                    {card.illustration}
                    <div className="mt-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`p-2 rounded-lg border ${card.iconBg}`}>{card.icon}</div>
                        <h3 className={`font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors`}>
                          {card.title}
                        </h3>
                      </div>
                      <p className="font-sans text-muted-foreground text-sm mb-3 flex-1">{card.desc}</p>
                      <ul className="space-y-1.5 mb-4">
                        {card.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check size={11} className={`${card.checkColor} shrink-0`} />{f}
                          </li>
                        ))}
                      </ul>
                      <div
                        className={`w-full text-center py-2.5 rounded-full font-medium text-sm text-white transition-all ${card.ctaGlow}`}
                        style={card.ctaStyle}
                      >
                        {card.cta}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-14 border-t border-border/20 bg-background/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { stat: "23", label: "Equations ready", color: "text-blue-400" },
            { stat: "∞",  label: "Unit combos",     color: "text-purple-400" },
            { stat: "0",  label: "Backend needed",  color: "text-cyan-400" },
          ].map((item, i) => (
            <motion.div
              key={item.stat}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`text-4xl md:text-5xl font-bold font-serif ${item.color}`}
                style={{ filter: "drop-shadow(0 0 12px currentColor)", opacity: 0.9 }}
              >
                {item.stat}
              </div>
              <div className="text-muted-foreground text-xs md:text-sm font-medium">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 border-t border-border/10 text-center text-muted-foreground/50 text-xs bg-background">
        <p>EE Solver — Built for engineers who move fast.</p>
      </footer>
    </div>
  );
}
