type Props = {
  matrix: number[][];
  tokens: string[];
  size?: number;
  showLabels?: boolean;
  highlightRow?: number | null;
  onCellHover?: (i: number, j: number) => void;
  onRowClick?: (i: number) => void;
};

/**
 * Renders an N×N attention matrix as an SVG heatmap.
 * Values are mapped from a dark base to a bright accent via a 3-stop gradient.
 */
export default function AttentionHeatmap({
  matrix,
  tokens,
  size = 320,
  showLabels = true,
  highlightRow = null,
  onCellHover,
  onRowClick,
}: Props) {
  const n = matrix.length;
  const labelW = showLabels ? 70 : 0;
  const labelH = showLabels ? 60 : 0;
  const cell = (size - labelW) / n;
  const total = labelW + n * cell;
  const totalH = labelH + n * cell;

  // find global max for normalization
  let max = 0;
  for (const row of matrix) for (const v of row) if (v > max) max = v;

  const colorFor = (v: number) => {
    const t = max > 0 ? Math.min(1, v / max) : 0;
    // dark navy -> cyan -> violet
    if (t < 0.5) {
      const k = t * 2;
      return interp([24, 29, 58], [94, 228, 212], k);
    }
    const k = (t - 0.5) * 2;
    return interp([94, 228, 212], [164, 114, 255], k);
  };

  return (
    <svg viewBox={`0 0 ${total} ${totalH}`} className="w-full select-none">
      {/* column labels (top) */}
      {showLabels &&
        tokens.map((t, j) => (
          <text
            key={"col-" + j}
            x={labelW + j * cell + cell / 2}
            y={labelH - 8}
            textAnchor="end"
            transform={`rotate(-50, ${labelW + j * cell + cell / 2}, ${labelH - 8})`}
            fontFamily="JetBrains Mono"
            fontSize={Math.max(7, cell * 0.32)}
            fill="#9aa3c0"
          >
            {t}
          </text>
        ))}
      {/* row labels (left) + matrix */}
      {matrix.map((row, i) => (
        <g key={"row-" + i}>
          {showLabels && (
            <text
              x={labelW - 6}
              y={labelH + i * cell + cell * 0.65}
              textAnchor="end"
              fontFamily="JetBrains Mono"
              fontSize={Math.max(7, cell * 0.32)}
              fill={highlightRow === i ? "#5ee4d4" : "#9aa3c0"}
              fontWeight={highlightRow === i ? 700 : 400}
              onClick={() => onRowClick?.(i)}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {tokens[i]}
            </text>
          )}
          {row.map((v, j) => (
            <rect
              key={"c-" + i + "-" + j}
              x={labelW + j * cell}
              y={labelH + i * cell}
              width={cell}
              height={cell}
              fill={colorFor(v)}
              opacity={highlightRow == null || highlightRow === i ? 1 : 0.25}
              stroke={highlightRow === i ? "#5ee4d4" : "none"}
              strokeWidth={highlightRow === i ? 0.6 : 0}
              onMouseEnter={() => onCellHover?.(i, j)}
            >
              <title>{`${tokens[i]} → ${tokens[j]}: ${v.toFixed(3)}`}</title>
            </rect>
          ))}
        </g>
      ))}
    </svg>
  );
}

function interp(a: number[], b: number[], t: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
