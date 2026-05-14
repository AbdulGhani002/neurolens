import { useState } from "react";
import { motion } from "framer-motion";
import { WORDS, categoryColor, WordVec, neighbors } from "../../data/embeddings";

type Props = {
  highlightWord?: string | null;
  showAnalogy?: { a: WordVec; b: WordVec; c: WordVec; predicted: { x: number; y: number }; result: WordVec | null } | null;
  onWordClick?: (w: WordVec) => void;
};

const W = 720;
const H = 520;
const PAD = 30;

export default function EmbeddingScatter({ highlightWord, showAnalogy, onWordClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const xy = (v: WordVec) => ({
    x: PAD + v.x * (W - 2 * PAD),
    y: PAD + (1 - v.y) * (H - 2 * PAD),
  });

  const highlighted = highlightWord ?? hovered;
  const neighborWords = highlighted ? new Set(neighbors(highlighted, 5).map((n) => n.word)) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <radialGradient id="emb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5ee4d4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5ee4d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* axis hints */}
      <text x={W - PAD} y={H - PAD + 18} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#48527a">
        dim 1 →
      </text>
      <text x={PAD - 6} y={PAD + 6} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#48527a">
        dim 2 ↑
      </text>

      {/* analogy arrows */}
      {showAnalogy && (() => {
        const { a, b, c, predicted, result } = showAnalogy;
        const pA = xy(a);
        const pB = xy(b);
        const pC = xy(c);
        const pP = {
          x: PAD + predicted.x * (W - 2 * PAD),
          y: PAD + (1 - predicted.y) * (H - 2 * PAD),
        };
        return (
          <g>
            {/* a → b (subtract) */}
            <line x1={pB.x} y1={pB.y} x2={pA.x} y2={pA.y} stroke="#ff6f91" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrA)" />
            {/* c → predicted (add) */}
            <line x1={pC.x} y1={pC.y} x2={pP.x} y2={pP.y} stroke="#5ee4d4" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrB)" />
            <defs>
              <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ff6f91" />
              </marker>
              <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#5ee4d4" />
              </marker>
            </defs>
            <circle cx={pP.x} cy={pP.y} r="14" fill="url(#emb-glow)" />
            <circle cx={pP.x} cy={pP.y} r="6" fill="none" stroke="#5ee4d4" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x={pP.x + 12} y={pP.y - 8} fontFamily="JetBrains Mono" fontSize="11" fill="#5ee4d4">
              prediction → {result?.word ?? "?"}
            </text>
          </g>
        );
      })()}

      {/* word points */}
      {WORDS.map((w) => {
        const { x, y } = xy(w);
        const color = categoryColor[w.category];
        const isHi = highlighted === w.word;
        const isNb = neighborWords?.has(w.word);
        const dimmed = highlighted && !isHi && !isNb;
        return (
          <motion.g
            key={w.word}
            initial={{ opacity: 0 }}
            animate={{ opacity: dimmed ? 0.2 : 1 }}
            onMouseEnter={() => setHovered(w.word)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onWordClick?.(w)}
            className="cursor-pointer"
          >
            {isHi && <circle cx={x} cy={y} r="18" fill={color} opacity="0.25" />}
            <circle cx={x} cy={y} r={isHi ? 6 : isNb ? 5 : 4} fill={color} stroke={isHi ? "#fff" : "none"} strokeWidth="1.5" />
            <text
              x={x + 8}
              y={y + 4}
              fontFamily="JetBrains Mono"
              fontSize={isHi ? 13 : 11}
              fill={isHi || isNb ? "#fff" : "#c9cfe0"}
              fontWeight={isHi ? 700 : 400}
            >
              {w.word}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
