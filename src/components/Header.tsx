import { NavLink, Link } from "react-router-dom";
import Logo from "./Logo";

const links = [
  { to: "/architecture", label: "Architecture" },
  { to: "/attention", label: "Attention" },
  { to: "/tokenizer", label: "Tokenizer" },
  { to: "/embeddings", label: "Embeddings" },
  { to: "/compare", label: "BERT vs T5" },
  { to: "/why-not-bert", label: "Why not BERT?" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-ink-700/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-90 transition">
          <Logo size={34} />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                "px-3 py-2 rounded-lg text-sm font-medium transition " +
                (isActive
                  ? "text-accent-cyan bg-ink-800/60"
                  : "text-ink-200 hover:text-ink-50 hover:bg-ink-800/40")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2 text-xs text-ink-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-soft" />
          <span>NLP Lab — NUTECH</span>
        </div>
      </div>
    </header>
  );
}
