import { useState } from "react";
import PageShell from "../components/PageShell";
import BertDiagram from "../components/graphics/BertDiagram";
import T5Diagram from "../components/graphics/T5Diagram";
import BlockDetail from "../components/BlockDetail";
import { ArchBlock } from "../data/architecture";

type Model = "bert" | "t5";

export default function Architecture() {
  const [model, setModel] = useState<Model>("bert");
  const [selected, setSelected] = useState<ArchBlock | null>(null);

  const handleSelect = (block: ArchBlock | null) => {
    setSelected((prev) => (prev?.id === block?.id ? null : block));
  };

  return (
    <PageShell
      eyebrow="Module · 01"
      title="Architecture Explorer"
      subtitle="Click any block to see what it computes, where its parameters live, and how it differs between BERT and T5. All shapes are interactive — try it."
    >
      {/* model toggle */}
      <div className="inline-flex glass rounded-full p-1 mb-8">
        <ToggleButton active={model === "bert"} onClick={() => { setModel("bert"); setSelected(null); }}>
          BERT
        </ToggleButton>
        <ToggleButton active={model === "t5"} onClick={() => { setModel("t5"); setSelected(null); }}>
          T5
        </ToggleButton>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="glass rounded-2xl p-6 min-h-[600px] relative">
          {model === "bert" ? (
            <BertDiagram selectedId={selected?.id ?? null} onSelect={handleSelect} />
          ) : (
            <T5Diagram selectedId={selected?.id ?? null} onSelect={handleSelect} />
          )}
        </div>
        <div className="min-h-[500px] lg:sticky lg:top-24 lg:self-start">
          <BlockDetail block={selected} onClose={() => setSelected(null)} />
        </div>
      </div>

      {/* legend */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <LegendItem color="#9aa3c0" label="Input / Output" />
        <LegendItem color="#ffc857" label="Embeddings" />
        <LegendItem color="#5ee4d4" label="Attention" />
        <LegendItem color="#a472ff" label="Feed-forward" />
      </div>

      {/* key insight */}
      <div className="mt-12 glass-strong rounded-2xl p-7 border-l-4 border-accent-coral">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral mb-2">
          Key insight
        </p>
        <p className="text-ink-100 text-lg leading-relaxed">
          BERT is the encoder. T5 is the encoder <span className="font-semibold text-accent-coral">plus</span> a
          decoder that does <span className="font-mono">masked self-attention</span>,{" "}
          <span className="font-mono">cross-attention</span>, and an autoregressive output loop —
          the three things needed to <em>generate</em> sequences. Take those away and you have
          BERT.
        </p>
      </div>
    </PageShell>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-6 py-2 rounded-full text-sm font-semibold transition " +
        (active
          ? "bg-gradient-to-br from-accent-cyan to-accent-violet text-ink-950 shadow-glow"
          : "text-ink-300 hover:text-ink-100")
      }
    >
      {children}
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-ink-300">
      <span className="w-3 h-3 rounded" style={{ background: color + "33", border: "1px solid " + color }} />
      {label}
    </div>
  );
}
