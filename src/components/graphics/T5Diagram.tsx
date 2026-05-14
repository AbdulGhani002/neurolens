import { motion } from "framer-motion";
import { ArchBlock, t5Blocks, categoryStyle } from "../../data/architecture";

type Props = {
  selectedId: string | null;
  onSelect: (block: ArchBlock | null) => void;
};

const COL_W = 220;
const ENC_X = 40;
const DEC_X = 320;

type Layout = { x: number; y: number; w: number; h: number };

const blockLayout: Record<string, Layout> = {
  "t5-input": { x: ENC_X, y: 30, w: COL_W, h: 44 },
  "t5-enc-embed": { x: ENC_X, y: 95, w: COL_W, h: 58 },
  "t5-enc-attn": { x: ENC_X, y: 175, w: COL_W, h: 60 },
  "t5-enc-ffn": { x: ENC_X, y: 260, w: COL_W, h: 60 },
  "t5-enc-stack": { x: ENC_X, y: 345, w: COL_W, h: 36 },
  "t5-dec-input": { x: DEC_X, y: 30, w: COL_W, h: 44 },
  "t5-dec-self": { x: DEC_X, y: 95, w: COL_W, h: 58 },
  "t5-dec-cross": { x: DEC_X, y: 175, w: COL_W, h: 60 },
  "t5-dec-ffn": { x: DEC_X, y: 260, w: COL_W, h: 60 },
  "t5-dec-stack": { x: DEC_X, y: 345, w: COL_W, h: 36 },
  "t5-output": { x: DEC_X, y: 410, w: COL_W, h: 54 },
};

export default function T5Diagram({ selectedId, onSelect }: Props) {
  return (
    <div className="relative w-full">
      <div className="absolute top-2 left-4 font-display text-sm text-accent-coral tracking-wider font-semibold">
        T5 · encoder + decoder
      </div>
      <svg viewBox="0 0 580 500" className="w-full">
        <defs>
          <linearGradient id="t5-flow-enc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5ee4d4" />
            <stop offset="100%" stopColor="#a472ff" />
          </linearGradient>
          <linearGradient id="t5-flow-dec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a472ff" />
            <stop offset="100%" stopColor="#ff6f91" />
          </linearGradient>
        </defs>

        {/* column labels */}
        <text x={ENC_X + COL_W / 2} y={18} textAnchor="middle" fontFamily="Sora" fontSize="11" fill="#5ee4d4" fontWeight="600" letterSpacing="2">
          ENCODER
        </text>
        <text x={DEC_X + COL_W / 2} y={18} textAnchor="middle" fontFamily="Sora" fontSize="11" fill="#ff6f91" fontWeight="600" letterSpacing="2">
          DECODER
        </text>

        {/* vertical flow lines */}
        <line x1={ENC_X + COL_W / 2} y1={50} x2={ENC_X + COL_W / 2} y2={395} stroke="url(#t5-flow-enc)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <line x1={DEC_X + COL_W / 2} y1={50} x2={DEC_X + COL_W / 2} y2={465} stroke="url(#t5-flow-dec)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

        {/* cross-attention arrow from encoder to decoder cross-attn */}
        <motion.path
          d={`M ${ENC_X + COL_W} 380 Q ${(ENC_X + COL_W + DEC_X) / 2} 380, ${(ENC_X + COL_W + DEC_X) / 2} 205 Q ${(ENC_X + COL_W + DEC_X) / 2} 205, ${DEC_X} 205`}
          fill="none"
          stroke="#a472ff"
          strokeWidth="2"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        />
        <text
          x={(ENC_X + COL_W + DEC_X) / 2}
          y={195}
          textAnchor="middle"
          fontFamily="JetBrains Mono"
          fontSize="9"
          fill="#a472ff"
        >
          encoder memory
        </text>
        <text
          x={(ENC_X + COL_W + DEC_X) / 2}
          y={208}
          textAnchor="middle"
          fontFamily="JetBrains Mono"
          fontSize="9"
          fill="#a472ff"
        >
          → cross-attn K, V
        </text>

        {/* output autoregressive feedback loop */}
        <motion.path
          d={`M ${DEC_X + COL_W} 437 Q ${DEC_X + COL_W + 30} 437, ${DEC_X + COL_W + 30} 50 Q ${DEC_X + COL_W + 30} 30, ${DEC_X + COL_W - 30} 30 L ${DEC_X + COL_W - 30} 30`}
          fill="none"
          stroke="#ff6f91"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1.1 }}
          opacity="0.7"
        />
        <text x={DEC_X + COL_W + 38} y={240} fontFamily="JetBrains Mono" fontSize="9" fill="#ff6f91">
          autoregressive
        </text>
        <text x={DEC_X + COL_W + 38} y={252} fontFamily="JetBrains Mono" fontSize="9" fill="#ff6f91">
          feedback
        </text>

        {t5Blocks.map((b, i) => {
          const cfg = blockLayout[b.id];
          if (!cfg) return null;
          const style = categoryStyle[b.category];
          const isSelected = selectedId === b.id;
          const isStack = b.id.endsWith("stack");

          return (
            <motion.g
              key={b.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              onClick={() => onSelect(b)}
              className="cursor-pointer"
            >
              <rect
                x={cfg.x}
                y={cfg.y}
                width={cfg.w}
                height={cfg.h}
                rx={isStack ? cfg.h / 2 : 10}
                fill={isSelected ? style.stroke + "44" : style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? 2.3 : 1.3}
                strokeDasharray={isStack && !isSelected ? "3 3" : "0"}
              />
              <text
                x={cfg.x + cfg.w / 2}
                y={cfg.y + (isStack ? cfg.h / 2 + 4 : 20)}
                textAnchor="middle"
                fontFamily="Sora"
                fontSize={isStack ? 11 : 13}
                fontWeight="600"
                fill={style.stroke}
              >
                {b.label}
              </text>
              {!isStack && (
                <text
                  x={cfg.x + cfg.w / 2}
                  y={cfg.y + 38}
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="10"
                  fill="#c9cfe0"
                  opacity="0.85"
                >
                  {b.short.length > 36 ? b.short.slice(0, 36) + "…" : b.short}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
