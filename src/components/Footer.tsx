import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-ink-700/40">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Logo size={28} withWordmark={false} animated={false} />
          <div>
            <p className="text-sm text-ink-200">
              <span className="font-display font-semibold gradient-text">NeuroLens</span>
              <span className="text-ink-400"> — see inside NLP models</span>
            </p>
            <p className="text-xs text-ink-400 font-mono">
              Lab 10 · Translation &amp; Summarization · NUTECH AI-23
            </p>
          </div>
        </div>
        <div className="text-xs text-ink-400 font-mono">
          Built with React · TypeScript · SVG · pure-CSS graphics — no emojis, no stock images.
        </div>
      </div>
    </footer>
  );
}
