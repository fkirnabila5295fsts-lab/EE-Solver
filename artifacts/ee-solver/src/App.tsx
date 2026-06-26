import { Switch, Route, Router } from "wouter";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { EquationLibraryPage } from "./pages/EquationLibraryPage";
import { SmartSolverPage } from "./pages/SmartSolverPage";
import { EquationPage } from "./pages/EquationPage";
import { RecentlySolvedPage } from "./pages/RecentlySolvedPage";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <ThemeProvider>
      <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Navbar />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/equation-library/:id" component={EquationPage} />
          <Route path="/equation-library" component={EquationLibraryPage} />
          <Route path="/smart-solver" component={SmartSolverPage} />
          <Route path="/recently-solved" component={RecentlySolvedPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
