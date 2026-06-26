import { useParams, useLocation } from "wouter";
import { equations } from "../data/equations";
import { EquationDetail } from "../components/EquationDetail";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getCategoryColor } from "../data/variables";

export function EquationPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const equation = equations.find(e => e.id === params.id);

  if (!equation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <BookOpen size={48} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Equation not found</h2>
        <p className="text-muted-foreground mb-6">The equation you're looking for doesn't exist.</p>
        <button
          onClick={() => setLocation("/equation-library")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>
    );
  }

  const col = getCategoryColor(equation.category);

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${col.accent}22 0%, transparent 60%),
                       radial-gradient(circle at 20% 80%, rgba(37,99,235,0.12) 0%, transparent 60%)`
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setLocation("/equation-library")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          data-testid="back-to-library"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Library</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex items-start gap-4 flex-wrap"
        >
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border inline-block mb-3 ${col.badge}`}>
              {equation.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{equation.name}</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-card-border shadow-xl overflow-hidden"
          style={{ boxShadow: `0 0 40px ${col.accent}18` }}
        >
          <EquationDetail equation={equation} />
        </motion.div>
      </div>
    </div>
  );
}
