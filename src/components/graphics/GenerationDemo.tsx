import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  source: string[];
  /** the sequence the decoder will autoregressively produce */
  target: string[];
  /** the label drawn over each frame ("step 1", "step 2", ...) */
  variant: "t5" | "bert";
  stepMs?: number;
};

/**
 * Side-by-side visual contrast:
 *  - variant "t5": tokens appear one at a time, fed back into the decoder
 *  - variant "bert": shows ONE pass producing N output vectors (no generation loop)
 */
export default function GenerationDemo({ source, target, variant, stepMs = 1100 }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (target.length + 2));
    }, stepMs);
    return () => clearInterval(id);
  }, [target.length, stepMs]);

  if (variant === "t5") {
    return (
      <div className="space-y-3">
        {/* source */}
        <Row label="source" tokens={source} accent="cyan" all />
        <Arrow label="encoder memory" />
        {/* generated so far */}
        <Row
          label={`decoder · step ${Math.min(step, target.length)}`}
          tokens={target}
          accent="coral"
          visibleCount={Math.min(step, target.length)}
        />
        {step > target.length && (
          <p className="text-center text-[10px] font-mono text-accent-coral mt-1">
            [EOS] — generation complete
          </p>
        )}
      </div>
    );
  }

  // BERT variant: one pass, N outputs, no generation
  return (
    <div className="space-y-3">
      <Row label="input" tokens={source} accent="cyan" all />
      <Arrow label="single encoder pass" />
      <Row
        label="output vectors"
        tokens={source.map(() => "vec")}
        accent="violet"
        all
        showAsVectors
      />
      <p className="text-center text-[10px] font-mono text-accent-coral mt-3">
        same length in = same length out · no generation loop · no way to produce new tokens
      </p>
    </div>
  );
}

function Row({
  label,
  tokens,
  accent,
  all,
  visibleCount,
  showAsVectors,
}: {
  label: string;
  tokens: string[];
  accent: "cyan" | "violet" | "coral";
  all?: boolean;
  visibleCount?: number;
  showAsVectors?: boolean;
}) {
  const color = accent === "cyan" ? "#5ee4d4" : accent === "violet" ? "#a472ff" : "#ff6f91";
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] font-mono mb-1.5" style={{ color }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((t, i) => {
          const visible = all || (visibleCount != null && i < visibleCount);
          return (
            <AnimatePresence key={i} mode="popLayout">
              {visible && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="font-mono text-xs px-2.5 py-1.5 rounded-md"
                  style={{
                    background: color + "22",
                    color: "#fff",
                    border: "1px solid " + color,
                  }}
                >
                  {showAsVectors ? (
                    <span className="opacity-80">[768d]</span>
                  ) : (
                    t
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-500 to-transparent" />
      <span className="text-[9px] font-mono uppercase tracking-wider text-ink-400">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-500 to-transparent" />
    </div>
  );
}
