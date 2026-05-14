import { motion, AnimatePresence } from "framer-motion";
import { ArchBlock, categoryStyle } from "../data/architecture";

type Props = {
  block: ArchBlock | null;
  onClose: () => void;
};

export default function BlockDetail({ block, onClose }: Props) {
  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        {block ? (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-strong rounded-2xl p-6 h-full flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded mb-2"
                  style={{
                    color: categoryStyle[block.category].stroke,
                    background: categoryStyle[block.category].stroke + "22",
                    border: "1px solid " + categoryStyle[block.category].stroke + "55",
                  }}
                >
                  {categoryStyle[block.category].label}
                </div>
                <h3 className="font-display font-bold text-2xl text-ink-50 leading-tight">
                  {block.label}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-ink-400 hover:text-ink-50 transition w-7 h-7 rounded-full flex items-center justify-center hover:bg-ink-700/60 text-lg"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-ink-200 text-sm leading-relaxed mb-4">{block.short}</p>
            <p className="text-ink-300 text-sm leading-relaxed">{block.detail}</p>

            {block.math && (
              <div className="mt-5 p-3 rounded-lg bg-ink-950/60 border border-ink-700/60">
                <div className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
                  Formula
                </div>
                <code className="font-mono text-sm text-accent-cyan">{block.math}</code>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-8 h-full flex items-center justify-center text-center"
          >
            <div>
              <div className="mb-4 flex justify-center">
                <PointerGraphic />
              </div>
              <p className="text-ink-300 text-sm max-w-xs">
                Click any block in the diagram to see how it works, what it computes, and what
                role it plays in the model.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PointerGraphic() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="p-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ee4d4" />
          <stop offset="100%" stopColor="#a472ff" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="22" fill="none" stroke="url(#p-grad)" strokeWidth="1.5" opacity="0.4" />
      <circle cx="28" cy="28" r="14" fill="none" stroke="url(#p-grad)" strokeWidth="1.5" opacity="0.7" />
      <circle cx="28" cy="28" r="6" fill="url(#p-grad)" />
      <line x1="28" y1="6" x2="28" y2="14" stroke="url(#p-grad)" strokeWidth="1.5" />
      <line x1="28" y1="42" x2="28" y2="50" stroke="url(#p-grad)" strokeWidth="1.5" />
      <line x1="6" y1="28" x2="14" y2="28" stroke="url(#p-grad)" strokeWidth="1.5" />
      <line x1="42" y1="28" x2="50" y2="28" stroke="url(#p-grad)" strokeWidth="1.5" />
    </svg>
  );
}
