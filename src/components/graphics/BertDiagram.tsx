import { motion } from "framer-motion";
import { ArchBlock, bertBlocks, categoryStyle } from "../../data/architecture";

type Props = {
  selectedId: string | null;
  onSelect: (block: ArchBlock | null) => void;
};

const W = 320;
const X = 60;

const blockY: Record<string, { y: number; h: number }> = {
  "bert-input": { y: 30, h: 50 },
  "bert-embed": { y: 100, h: 70 },
  "bert-attn": { y: 200, h: 70 },
  "bert-norm1": { y: 285, h: 40 },
  "bert-ffn": { y: 340, h: 70 },
  "bert-norm2": { y: 425, h: 40 },
  "bert-stack": { y: 485, h: 35 },
  "bert-output": { y: 540, h: 60 },
};

export default function BertDiagram({ selectedId, onSelect }: Props) {
  return (
    <div className="relative w-full">
      <div className="absolute top-2 left-4 font-display text-sm text-accent-cyan tracking-wider font-semibold">
        BERT · encoder-only
      </div>
      <svg viewBox={`0 0 ${X * 2 + W} 640`} className="w-full">
        <defs>
          <linearGradient id="bert-flow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5ee4d4" />
            <stop offset="100%" stopColor="#a472ff" />
          </linearGradient>
          <marker id="arrow-bert" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#5ee4d4" />
          </marker>
        </defs>

        {/* connecting flow line */}
        <motion.line
          x1={X + W / 2}
          y1={40}
          x2={X + W / 2}
          y2={600}
          stroke="url(#bert-flow)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2 }}
          opacity="0.5"
        />

        {bertBlocks.map((b, i) => {
          const cfg = blockY[b.id];
          if (!cfg) return null;
          const style = categoryStyle[b.category];
          const isSelected = selectedId === b.id;

          if (b.id === "bert-stack") {
            // render as a compact "× 12 layers" pill
            return (
              <motion.g
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => onSelect(b)}
                className="cursor-pointer"
              >
                <rect
                  x={X + W / 2 - 80}
                  y={cfg.y}
                  width={160}
                  height={cfg.h}
                  rx={cfg.h / 2}
                  fill={isSelected ? style.stroke + "33" : style.fill}
                  stroke={style.stroke}
                  strokeDasharray={isSelected ? "0" : "3 3"}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <text
                  x={X + W / 2}
                  y={cfg.y + cfg.h / 2 + 4}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                  fontSize="12"
                  fill="#c9cfe0"
                >
                  ↑ repeat × 12 layers ↑
                </text>
              </motion.g>
            );
          }

          return (
            <motion.g
              key={b.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              onClick={() => onSelect(b)}
              className="cursor-pointer"
            >
              <rect
                x={X}
                y={cfg.y}
                width={W}
                height={cfg.h}
                rx={10}
                fill={isSelected ? style.stroke + "44" : style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? 2.5 : 1.4}
              />
              <text
                x={X + 16}
                y={cfg.y + 22}
                fontFamily="Sora"
                fontSize="14"
                fontWeight="600"
                fill={style.stroke}
              >
                {b.label}
              </text>
              <text
                x={X + 16}
                y={cfg.y + 40}
                fontFamily="Inter"
                fontSize="11"
                fill="#c9cfe0"
                opacity="0.85"
              >
                {b.short.length > 50 ? b.short.slice(0, 50) + "…" : b.short}
              </text>
              {/* category pill on the right */}
              <rect
                x={X + W - 80}
                y={cfg.y + 8}
                width={70}
                height={16}
                rx={8}
                fill={style.stroke + "22"}
                stroke={style.stroke}
                strokeWidth="0.6"
              />
              <text
                x={X + W - 45}
                y={cfg.y + 19}
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fill={style.stroke}
              >
                {style.label}
              </text>
            </motion.g>
          );
        })}

        {/* residual hint markers (right side) */}
        <g opacity="0.6">
          <path
            d={`M ${X + W + 10} 235 Q ${X + W + 40} 235, ${X + W + 40} 305 Q ${X + W + 40} 325, ${X + W + 10} 325`}
            fill="none"
            stroke="#9aa3c0"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text x={X + W + 45} y={285} fontFamily="JetBrains Mono" fontSize="9" fill="#9aa3c0">
            residual
          </text>
          <path
            d={`M ${X + W + 10} 375 Q ${X + W + 40} 375, ${X + W + 40} 445 Q ${X + W + 40} 465, ${X + W + 10} 465`}
            fill="none"
            stroke="#9aa3c0"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text x={X + W + 45} y={425} fontFamily="JetBrains Mono" fontSize="9" fill="#9aa3c0">
            residual
          </text>
        </g>
      </svg>
    </div>
  );
}
