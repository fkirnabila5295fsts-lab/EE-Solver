import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">404 — Page Not Found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
        >
          <Home size={16} /> Go Home
        </button>
      </div>
    </div>
  );
}
