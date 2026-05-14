import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import AttentionHeatmap from "../components/graphics/AttentionHeatmap";
import AttentionArcs from "../components/graphics/AttentionArcs";
import SAMPLES from "../data/attentionData";

export default function Attention() {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const [headIdx, setHeadIdx] = useState<number | null>(null);
  const [fromTok, setFromTok] = useState<number | null>(null);

  const sample = SAMPLES.find((s) => s.id === sampleId)!;
  const focusedHead = headIdx != null ? sample.heads[headIdx] : sample.heads[5];

  return (
    <PageShell
      eyebrow="Module · 02"
      title="Attention Visualizer"
      subtitle="Each encoder layer has 12 attention heads. Each head learns a different pattern — diagonal, previous-token, syntactic dependency, [CLS]-sink. Click a head to inspect it."
    >
      {/* sentence picker */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSampleId(s.id);
              setHeadIdx(null);
              setFromTok(null);
            }}
            className={
              "px-4 py-2 rounded-lg text-sm font-mono transition " +
              (sampleId === s.id
                ? "bg-accent-cyan text-ink-950"
                : "glass text-ink-200 hover:text-ink-50")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 12-head grid */}
      <div className="mb-12">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-violet mb-3">
          12 heads · click to focus
        </p>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
          {sample.heads.map((h, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setHeadIdx(headIdx === i ? null : i)}
              className={
                "glass rounded-xl p-2 transition border-2 " +
                (headIdx === i
                  ? "border-accent-cyan shadow-glow"
                  : "border-transparent hover:border-ink-600")
              }
            >
              <div className="text-[10px] font-mono text-ink-400 mb-1 text-left">
                head {i.toString().padStart(2, "0")}
              </div>
              <AttentionHeatmap matrix={h} tokens={sample.tokens} size={140} showLabels={false} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* focused detail */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
                Focused head
              </p>
              <h3 className="font-display font-semibold text-xl text-ink-50">
                Head {(headIdx ?? 5).toString().padStart(2, "0")}
              </h3>
            </div>
            <p className="text-xs font-mono text-ink-400 max-w-[60%] text-right">
              {sample.headNotes[headIdx ?? 5]}
            </p>
          </div>
          <AttentionHeatmap
            matrix={focusedHead}
            tokens={sample.tokens}
            size={420}
            highlightRow={fromTok}
            onRowClick={(i) => setFromTok(fromTok === i ? null : i)}
          />
          <p className="text-xs font-mono text-ink-400 mt-3">
            click a row label to see arcs for that source token →
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-2">
            Arc view
          </p>
          <h3 className="font-display font-semibold text-xl text-ink-50 mb-4">
            {fromTok != null ? (
              <>
                <span className="font-mono text-accent-cyan">{sample.tokens[fromTok]}</span> attends to…
              </>
            ) : (
              "Pick a source token"
            )}
          </h3>
          <AttentionArcs matrix={focusedHead} tokens={sample.tokens} fromToken={fromTok} />
          {fromTok != null && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
              {focusedHead[fromTok]
                .map((v, j) => ({ v, j }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 4)
                .map(({ v, j }) => (
                  <div key={j} className="flex justify-between items-center px-3 py-2 rounded-lg bg-ink-800/40">
                    <span className="text-ink-200">{sample.tokens[j]}</span>
                    <span className="text-accent-cyan">{(v * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* explainer */}
      <div className="mt-12 glass rounded-2xl p-7">
        <h3 className="font-display text-xl mb-3 text-ink-50">What you&apos;re looking at</h3>
        <ul className="space-y-2 text-sm text-ink-200 leading-relaxed">
          <li>
            <span className="font-mono text-accent-cyan">Row i, column j</span> = how much token{" "}
            <em>i</em> is attending to token <em>j</em>. Each row sums to 1.
          </li>
          <li>
            BERT-base has <span className="font-mono">12 layers × 12 heads = 144 heads</span>{" "}
            total. Each one learns a different pattern during pretraining.
          </li>
          <li>
            The attention is <span className="text-accent-cyan font-semibold">bidirectional</span>:
            both lower and upper triangles are populated. The decoder of T5 would have a strict
            lower-triangle pattern — that&apos;s the causal mask.
          </li>
        </ul>
      </div>
    </PageShell>
  );
}
