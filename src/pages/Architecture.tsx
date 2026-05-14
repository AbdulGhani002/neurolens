import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import BertDiagram from "../components/graphics/BertDiagram";
import T5Diagram from "../components/graphics/T5Diagram";
import BlockDetail from "../components/BlockDetail";
import { ArchBlock } from "../data/architecture";
import {
  MODEL_CONFIGS,
  ModelConfig,
  blockParams,
  fmtParams,
} from "../data/modelConfigs";

export default function Architecture() {
  const [modelId, setModelId] = useState("bert-base");
  const [selected, setSelected] = useState<ArchBlock | null>(null);

  const config = MODEL_CONFIGS.find((c) => c.id === modelId)!;
  const params = useMemo(() => blockParams(config), [config]);

  const handleSelect = (block: ArchBlock | null) => {
    setSelected((prev) => (prev?.id === block?.id ? null : block));
  };

  const family = config.family;
  const bertModels = MODEL_CONFIGS.filter((c) => c.family === "bert");
  const t5Models = MODEL_CONFIGS.filter((c) => c.family === "t5");

  return (
    <PageShell
      eyebrow="Module · 01"
      title="Architecture Explorer"
      subtitle="Pick any BERT or T5 variant — the diagram on the left stays the same shape but the numbers underneath are real. Click a block for its math, parameter count, and role."
    >
      {/* model picker */}
      <div className="mb-8 glass-strong rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan mb-3">
          Model
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-accent-cyan mb-1.5">
              BERT family · encoder-only
            </p>
            <div className="flex flex-wrap gap-1.5">
              {bertModels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setModelId(c.id);
                    setSelected(null);
                  }}
                  className={
                    "text-xs font-mono px-3 py-1.5 rounded-md transition " +
                    (modelId === c.id
                      ? "bg-accent-cyan text-ink-950 font-bold"
                      : "bg-ink-800/60 text-ink-200 hover:bg-ink-700/60")
                  }
                >
                  {c.display}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-accent-coral mb-1.5">
              T5 family · encoder-decoder
            </p>
            <div className="flex flex-wrap gap-1.5">
              {t5Models.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setModelId(c.id);
                    setSelected(null);
                  }}
                  className={
                    "text-xs font-mono px-3 py-1.5 rounded-md transition " +
                    (modelId === c.id
                      ? "bg-accent-coral text-ink-950 font-bold"
                      : "bg-ink-800/60 text-ink-200 hover:bg-ink-700/60")
                  }
                >
                  {c.display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Layers" value={config.encoderLayers + (config.decoderLayers ?? 0)} />
          <Stat label="Heads" value={config.heads} />
          <Stat label="Hidden dim" value={config.hidden} />
          <Stat label="FFN inner" value={config.ffnHidden} />
          <Stat label="Params" value={fmtParams(config.paramsM * 1e6)} highlight />
        </div>

        {config.notes && (
          <p className="text-xs font-mono text-ink-400 mt-3 leading-relaxed">{config.notes}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="glass rounded-2xl p-6 min-h-[600px] relative">
          <motion.div
            key={modelId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {family === "bert" ? (
              <BertDiagram selectedId={selected?.id ?? null} onSelect={handleSelect} />
            ) : (
              <T5Diagram selectedId={selected?.id ?? null} onSelect={handleSelect} />
            )}
          </motion.div>
        </div>
        <div className="min-h-[500px] lg:sticky lg:top-24 lg:self-start">
          <BlockDetail block={selected} onClose={() => setSelected(null)} />
          {selected && <BlockParams block={selected} config={config} params={params} />}
        </div>
      </div>

      {/* per-layer breakdown */}
      <div className="mt-12 glass-strong rounded-2xl p-7">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-3">
          Where the parameters live · {config.display}
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          <ParamCard
            label="Embeddings"
            value={params.embeddings}
            note={`${config.vocab.toLocaleString()} × ${config.hidden}`}
            color="#ffc857"
          />
          <ParamCard
            label="Self-attn (per layer)"
            value={params.selfAttnPerLayer}
            note={`4 × ${config.hidden}² (Q,K,V,O)`}
            color="#5ee4d4"
          />
          <ParamCard
            label="FFN (per layer)"
            value={params.ffnPerLayer}
            note={`2 × ${config.hidden} × ${config.ffnHidden}`}
            color="#a472ff"
          />
          <ParamCard
            label={`Total · ${params.layers} layers`}
            value={params.total}
            note="embedding + all attn + all FFN"
            color="#ff6f91"
            highlight
          />
        </div>
        <p className="text-xs font-mono text-ink-400 mt-4 leading-relaxed">
          Each attention head operates in a{" "}
          <span className="text-accent-cyan">{params.headDim}-dim</span> sub-space (hidden ÷
          heads). The feed-forward layer is the parameter heavyweight — it&apos;s where most of
          the model&apos;s capacity lives.
        </p>
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

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg p-3 text-center border " +
        (highlight
          ? "bg-accent-cyan/10 border-accent-cyan/40"
          : "bg-ink-800/40 border-ink-700/40")
      }
    >
      <div
        className={
          "text-xl font-display font-bold " + (highlight ? "text-accent-cyan" : "text-ink-50")
        }
      >
        {value}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function ParamCard({
  label,
  value,
  note,
  color,
  highlight,
}: {
  label: string;
  value: number;
  note: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: color + (highlight ? "18" : "0c"),
        borderLeft: `3px solid ${color}`,
      }}
    >
      <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>
        {label}
      </p>
      <p className="font-display font-bold text-xl text-ink-50 mt-1">{fmtParams(value)}</p>
      <p className="text-[10px] font-mono text-ink-400 mt-1">{note}</p>
    </div>
  );
}

function BlockParams({
  block,
  config,
  params,
}: {
  block: ArchBlock;
  config: ModelConfig;
  params: ReturnType<typeof blockParams>;
}) {
  let count: number | null = null;
  let formula: string | null = null;
  if (block.category === "attn") {
    count = params.selfAttnPerLayer;
    formula = `4 × ${config.hidden}² = ${fmtParams(count)} per layer`;
  } else if (block.category === "ffn") {
    count = params.ffnPerLayer;
    formula = `2 × ${config.hidden} × ${config.ffnHidden} = ${fmtParams(count)} per layer`;
  } else if (block.category === "embed") {
    count = params.embeddings;
    formula = `${config.vocab.toLocaleString()} × ${config.hidden} = ${fmtParams(count)}`;
  } else if (block.category === "norm") {
    count = config.hidden * 2;
    formula = `2 × ${config.hidden} = ${count} params (γ, β)`;
  }

  if (count == null) return null;

  return (
    <div className="mt-3 glass rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-2">
        params · {config.display}
      </p>
      <p className="font-display font-bold text-2xl text-accent-violet">{fmtParams(count)}</p>
      <p className="text-xs font-mono text-ink-400 mt-1">{formula}</p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-ink-300">
      <span
        className="w-3 h-3 rounded"
        style={{ background: color + "33", border: "1px solid " + color }}
      />
      {label}
    </div>
  );
}
