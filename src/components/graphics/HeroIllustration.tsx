import { motion } from "framer-motion";

/**
 * Hero illustration — a stylized transformer:
 * - Left column: input tokens
 * - Middle: stacked encoder/decoder blocks with attention web
 * - Right column: output tokens
 * Entirely hand-drawn SVG, no images, no emojis.
 */
export default function HeroIllustration() {
  const tokens = ["The", "lab", "is", "fun"];
  const outputs = ["یہ", "لیب", "مزے", "کی"];

  return (
    <div className="relative w-full aspect-[16/10]">
      <svg viewBox="0 0 800 500" className="w-full h-full">
        <defs>
          <linearGradient id="hero-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ee4d4" />
            <stop offset="55%" stopColor="#a472ff" />
            <stop offset="100%" stopColor="#ff6f91" />
          </linearGradient>
          <linearGradient id="hero-grad-faint" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5ee4d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#a472ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ff6f91" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a472ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a472ff" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* halo behind */}
        <circle cx="400" cy="250" r="220" fill="url(#hero-glow)" />

        {/* faint orbiting rings */}
        <g opacity="0.4">
          <ellipse cx="400" cy="250" rx="320" ry="140" fill="none" stroke="#48527a" strokeDasharray="2 6" />
          <ellipse cx="400" cy="250" rx="260" ry="110" fill="none" stroke="#48527a" strokeDasharray="2 6" />
        </g>

        {/* INPUT tokens — left */}
        {tokens.map((t, i) => (
          <g key={"in-" + i} transform={`translate(40, ${110 + i * 80})`}>
            <rect width="120" height="48" rx="12" fill="#181d3a" stroke="#48527a" />
            <text x="60" y="30" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="16" fill="#c9cfe0">
              {t}
            </text>
          </g>
        ))}

        {/* token → encoder lines */}
        {tokens.map((_, i) => (
          <motion.line
            key={"in-line-" + i}
            x1="160"
            y1={134 + i * 80}
            x2="280"
            y2={250}
            stroke="url(#hero-grad-faint)"
            strokeWidth="1.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
          />
        ))}

        {/* ENCODER stack — middle-left */}
        <g transform="translate(280, 130)">
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={"enc-" + i}
              x={0}
              y={i * 80}
              width="100"
              height="60"
              rx="14"
              fill="rgba(94,228,212,0.08)"
              stroke="#5ee4d4"
              strokeWidth="1.4"
              initial={{ opacity: 0, y: i * 80 + 10 }}
              animate={{ opacity: 1, y: i * 80 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            />
          ))}
          <text x="50" y="-10" textAnchor="middle" fontFamily="Sora" fontSize="14" fill="#5ee4d4" fontWeight="600">
            Encoder
          </text>
          {[0, 1, 2].map((i) => (
            <text
              key={"enc-l-" + i}
              x="50"
              y={i * 80 + 36}
              textAnchor="middle"
              fontFamily="JetBrains Mono"
              fontSize="11"
              fill="#9aa3c0"
            >
              Layer {i + 1}
            </text>
          ))}
        </g>

        {/* attention web between encoder and decoder */}
        <g opacity="0.55" filter="url(#soft-glow)">
          {[0, 1, 2].map((i) =>
            [0, 1, 2].map((j) => (
              <motion.path
                key={`attn-${i}-${j}`}
                d={`M 380 ${160 + i * 80} C 440 ${160 + i * 80}, 440 ${160 + j * 80}, 500 ${160 + j * 80}`}
                fill="none"
                stroke="url(#hero-grad)"
                strokeWidth="0.9"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8 + (i + j) * 0.06, duration: 0.8 }}
              />
            ))
          )}
        </g>

        {/* DECODER stack — middle-right */}
        <g transform="translate(500, 130)">
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={"dec-" + i}
              x={0}
              y={i * 80}
              width="100"
              height="60"
              rx="14"
              fill="rgba(255,111,145,0.08)"
              stroke="#ff6f91"
              strokeWidth="1.4"
              initial={{ opacity: 0, y: i * 80 + 10 }}
              animate={{ opacity: 1, y: i * 80 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            />
          ))}
          <text x="50" y="-10" textAnchor="middle" fontFamily="Sora" fontSize="14" fill="#ff6f91" fontWeight="600">
            Decoder
          </text>
          {[0, 1, 2].map((i) => (
            <text
              key={"dec-l-" + i}
              x="50"
              y={i * 80 + 36}
              textAnchor="middle"
              fontFamily="JetBrains Mono"
              fontSize="11"
              fill="#9aa3c0"
            >
              Layer {i + 1}
            </text>
          ))}
        </g>

        {/* decoder → output lines */}
        {outputs.map((_, i) => (
          <motion.line
            key={"out-line-" + i}
            x1="600"
            y1={250}
            x2="650"
            y2={134 + i * 80}
            stroke="url(#hero-grad-faint)"
            strokeWidth="1.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ delay: 1.0 + i * 0.1, duration: 0.8 }}
          />
        ))}

        {/* OUTPUT tokens — right */}
        {outputs.map((t, i) => (
          <g key={"out-" + i} transform={`translate(650, ${110 + i * 80})`}>
            <rect width="120" height="48" rx="12" fill="#181d3a" stroke="#48527a" />
            <text x="60" y="30" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="16" fill="#c9cfe0">
              {t}
            </text>
          </g>
        ))}

        {/* floating particles */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 60 + Math.random() * 680;
          const y = 30 + Math.random() * 440;
          return (
            <motion.circle
              key={"p-" + i}
              cx={x}
              cy={y}
              r={1.2 + Math.random() * 1.8}
              fill={["#5ee4d4", "#a472ff", "#ff6f91", "#ffc857"][i % 4]}
              animate={{ opacity: [0.2, 0.9, 0.2], y: [y, y - 6, y] }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
