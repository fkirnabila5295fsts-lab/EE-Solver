⚡ EE Solver

Solve electrical engineering problems instantly — no login, no backend headaches, just answers.

🔗 Live demo: smart-solver-flow--nf32.replit.app

Built for a hackathon. Browse a curated equation library, let the Smart Solver figure out which formula fits what you know, and jump back into your recent calculations any time.


✨ Features


📚 Equation Library — Browse essential EE equations (Ohm's Law, power formulas, RC time constants, resonant frequency, and more), each with its own calculator and full unit conversion.
⚡ Smart Solver — Enter the variables you know, and it automatically matches them against the right equation and solves for what's missing.
🕓 Recently Solved — Your last calculations, saved automatically, one click away from reopening.


🛠 Tech Stack

LayerStackFrontendReact + Vite + TypeScript, Tailwind CSS, Framer Motion, Radix UIBackendExpress + Drizzle ORM, Pino loggingToolingpnpm workspaces (monorepo), tsc

📁 Project Structure

EE-Solver/
├── artifacts/
│   ├── ee-solver/      # Main React app (Vite) — the site itself
│   ├── api-server/     # Express API backend
│   └── mockup-sandbox/ # Design/prototype sandbox
├── lib/
│   ├── db/              # Database layer (Drizzle)
│   ├── api-client-react/
│   ├── api-zod/         # Shared validation schemas
│   └── api-spec/        # API contract definitions
└── scripts/

🚀 Getting Started

This is a pnpm monorepo — npm won't work here.

bash# 1. Install pnpm if you don't have it
npm install -g pnpm

# 2. Install dependencies
pnpm install

# 3. Run the frontend
cd artifacts/ee-solver
PORT=5000 BASE_PATH=/ pnpm run dev


The dev server needs PORT and BASE_PATH set — they're not defaulted in vite.config.ts.



Other useful commands

bashpnpm run build       # build everything
pnpm run typecheck    # typecheck the whole workspace

🤝 Contributing

This started as a hackathon project — issues and PRs welcome if you want to extend the equation library or add new solver modes.

📄 License

MIT
