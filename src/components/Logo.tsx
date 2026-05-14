type Props = {
  size?: number;
  withWordmark?: boolean;
  animated?: boolean;
};

export default function Logo({ size = 36, withWordmark = true, animated = true }: Props) {
  const id = "logo-grad-" + Math.random().toString(36).slice(2, 8);
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={animated ? "drop-shadow-[0_0_18px_rgba(94,228,212,0.35)]" : ""}
        aria-label="NeuroLens logo"
        role="img"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ee4d4" />
            <stop offset="60%" stopColor="#a472ff" />
            <stop offset="100%" stopColor="#ff6f91" />
          </linearGradient>
          <radialGradient id={id + "-r"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5ee4d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5ee4d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* outer lens ring */}
        <circle cx="32" cy="32" r="28" fill="none" stroke={`url(#${id})`} strokeWidth="2.5" />

        {/* inner halo */}
        <circle cx="32" cy="32" r="22" fill={`url(#${id}-r)`} />

        {/* neural lattice — a tiny transformer-ish graph inside the lens */}
        <g stroke={`url(#${id})`} strokeWidth="1.2" fill="none" opacity="0.85">
          <line x1="18" y1="22" x2="32" y2="18" />
          <line x1="18" y1="22" x2="32" y2="32" />
          <line x1="18" y1="22" x2="32" y2="46" />
          <line x1="32" y1="18" x2="46" y2="22" />
          <line x1="32" y1="32" x2="46" y2="22" />
          <line x1="32" y1="32" x2="46" y2="42" />
          <line x1="32" y1="46" x2="46" y2="42" />
          <line x1="18" y1="42" x2="32" y2="32" />
          <line x1="18" y1="42" x2="32" y2="46" />
        </g>

        {/* nodes */}
        <g>
          <circle cx="18" cy="22" r="2.4" fill="#5ee4d4" />
          <circle cx="18" cy="42" r="2.4" fill="#5ee4d4" />
          <circle cx="32" cy="18" r="2.4" fill="#a472ff" />
          <circle cx="32" cy="32" r="3" fill={`url(#${id})`} />
          <circle cx="32" cy="46" r="2.4" fill="#a472ff" />
          <circle cx="46" cy="22" r="2.4" fill="#ff6f91" />
          <circle cx="46" cy="42" r="2.4" fill="#ff6f91" />
        </g>

        {/* lens shimmer */}
        {animated && (
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#5ee4d4"
            strokeWidth="1.2"
            strokeDasharray="4 200"
            className="animate-dash"
            opacity="0.7"
          />
        )}
      </svg>

      {withWordmark && (
        <span className="font-display font-bold tracking-tight text-xl gradient-text select-none">
          NeuroLens
        </span>
      )}
    </div>
  );
}
