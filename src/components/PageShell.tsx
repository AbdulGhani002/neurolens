import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
};

export default function PageShell({ title, subtitle, eyebrow, children }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        {eyebrow && (
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-cyan mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-ink-300 max-w-3xl text-lg leading-relaxed">{subtitle}</p>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
