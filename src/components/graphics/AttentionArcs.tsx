type Props = {
  matrix: number[][];
  tokens: string[];
  fromToken: number | null;
};

/**
 * Renders the attention pattern as arcs between tokens placed on a horizontal line.
 * Thickness/opacity encode weight. Lets students "see" where a token looks.
 */
export default function AttentionArcs({ matrix, tokens, fromToken }: Props) {
  const w = 700;
  const h = 200;
  const padding = 60;
  const n = tokens.length;
  const xFor = (i: number) => padding + (i * (w - 2 * padding)) / (n - 1);
  const baseY = h - 40;

  const row = fromToken != null ? matrix[fromToken] : null;
  const max = row ? Math.max(...row) : 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5ee4d4" />
          <stop offset="100%" stopColor="#a472ff" />
        </linearGradient>
      </defs>

      {/* arcs */}
      {row &&
        row.map((v, j) => {
          if (fromToken == null) return null;
          const w_ = (v / max) * 5 + 0.5;
          const op = Math.min(1, (v / max) ** 0.7 + 0.1);
          const x1 = xFor(fromToken);
          const x2 = xFor(j);
          const dx = Math.abs(x2 - x1);
          const cy = baseY - 20 - dx * 0.5;
          return (
            <path
              key={"arc-" + j}
              d={`M ${x1} ${baseY} Q ${(x1 + x2) / 2} ${cy} ${x2} ${baseY}`}
              fill="none"
              stroke="url(#arc-grad)"
              strokeWidth={w_}
              opacity={op}
              strokeLinecap="round"
            />
          );
        })}

      {/* baseline */}
      <line x1={padding - 30} y1={baseY} x2={w - padding + 30} y2={baseY} stroke="#48527a" strokeWidth="1" />

      {/* token labels */}
      {tokens.map((t, i) => {
        const isSource = i === fromToken;
        return (
          <g key={"tok-" + i}>
            <circle cx={xFor(i)} cy={baseY} r={isSource ? 6 : 3} fill={isSource ? "#5ee4d4" : "#9aa3c0"} />
            <text
              x={xFor(i)}
              y={baseY + 22}
              textAnchor="middle"
              fontFamily="JetBrains Mono"
              fontSize="12"
              fill={isSource ? "#5ee4d4" : "#c9cfe0"}
              fontWeight={isSource ? 700 : 400}
            >
              {t}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
