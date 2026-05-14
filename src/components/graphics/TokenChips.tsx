import { motion } from "framer-motion";
import { Token } from "../../utils/tokenizers";

type Props = {
  tokens: Token[];
  accent: "cyan" | "violet" | "coral";
};

const ACCENT: Record<Props["accent"], { base: string; cont: string; text: string }> = {
  cyan: { base: "#5ee4d4", cont: "#5ee4d488", text: "#0c1027" },
  violet: { base: "#a472ff", cont: "#a472ff88", text: "#0c1027" },
  coral: { base: "#ff6f91", cont: "#ff6f9188", text: "#0c1027" },
};

export default function TokenChips({ tokens, accent }: Props) {
  const A = ACCENT[accent];
  return (
    <div className="flex flex-wrap gap-1.5">
      {tokens.map((t, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.015 }}
          className="font-mono text-xs px-2 py-1 rounded-md inline-flex items-center gap-1"
          style={{
            background: t.isContinuation ? A.cont : A.base,
            color: A.text,
            fontWeight: t.isContinuation ? 500 : 700,
          }}
          title={`raw: "${t.raw}"`}
        >
          {t.text}
        </motion.span>
      ))}
    </div>
  );
}
