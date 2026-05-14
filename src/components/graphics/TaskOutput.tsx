import { motion } from "framer-motion";

type Props = {
  task: string;
  inputs: string[];
  outputs: { label: string; value: string; meta?: string }[];
  accent: "cyan" | "coral";
};

export default function TaskOutput({ task, inputs, outputs, accent }: Props) {
  const color = accent === "cyan" ? "#5ee4d4" : "#ff6f91";
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400 mb-1">task</p>
        <p className="font-mono text-sm text-ink-100">{task}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400 mb-2">input</p>
        <div className="flex flex-wrap gap-1.5">
          {inputs.map((t, i) => (
            <span
              key={i}
              className="font-mono text-xs px-2 py-1 rounded-md bg-ink-800/60 text-ink-200 border border-ink-700/60"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono mb-2" style={{ color }}>
          output
        </p>
        <div className="space-y-2">
          {outputs.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg p-3"
              style={{ background: color + "12", borderLeft: "3px solid " + color }}
            >
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400">
                {o.label}
              </p>
              <p className="text-sm text-ink-50 mt-0.5">{o.value}</p>
              {o.meta && <p className="text-[10px] font-mono text-ink-500 mt-1">{o.meta}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
