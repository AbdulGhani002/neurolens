import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import AttentionHeatmap from "../components/graphics/AttentionHeatmap";
import AttentionArcs from "../components/graphics/AttentionArcs";
import ModelLoader from "../components/ModelLoader";
import { useAutoAttention } from "../hooks/useAttention";
import { useWebGPU } from "../hooks/useTransformer";

const PRESETS = [
  "The cat sat on the mat.",
  "She opened the door quickly.",
  "Imran works at NUTECH Islamabad.",
  "Multi-head attention helps the model focus.",
];

export default function Attention() {
  const [input, setInput] = useState(PRESETS[0]);
  const [layerIdx, setLayerIdx] = useState(0);
  const [headIdx, setHeadIdx] = useState<number | null>(null);
  const [fromTok, setFromTok] = useState<number | null>(null);

  const att = useAutoAttention(input, { modelId: "Xenova/all-MiniLM-L6-v2", debounceMs: 300 });
  const webgpu = useWebGPU();

  // reset layer/head when result changes shape
  useEffect(() => {
    if (att.state.result && layerIdx >= att.state.result.attentions.length) {
      setLayerIdx(0);
    }
  }, [att.state.result, layerIdx]);

  const result = att.state.result;
  const layerAttn = result?.attentions[layerIdx];
  const focusedHead = layerAttn ? layerAttn[headIdx ?? 0] : null;

  return (
    <PageShell
      eyebrow="Module · 02"
      title="Attention Visualizer"
      subtitle="Live transformer forward pass in your browser. We pull each token's real 384-dim representation out of all-MiniLM-L6-v2 (a 6-layer BERT-style sentence transformer) and visualize the softmax-normalised token×token similarity matrix — the same interpretability signal used in BERTology papers."
    >
      {/* device + model status bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-mono">
        <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
          model:&nbsp;<span className="text-accent-cyan">all-MiniLM-L6-v2</span>
        </span>
        <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
          device:&nbsp;
          <span className={webgpu ? "text-accent-violet" : "text-accent-amber"}>
            {webgpu == null ? "detecting…" : webgpu ? "webgpu · fp16" : "wasm · q8"}
          </span>
        </span>
        {result && (
          <>
            <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
              tokens:&nbsp;<span className="text-ink-100">{result.tokens.length}</span>
            </span>
            <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
              hidden dim:&nbsp;<span className="text-ink-100">{result.hiddenDim}</span>
            </span>
            <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
              latency:&nbsp;<span className="text-ink-100">{result.elapsedMs.toFixed(0)}ms</span>
            </span>
          </>
        )}
        {att.state.status === "running" && (
          <span className="px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
            running forward pass…
          </span>
        )}
      </div>

      {/* loaders */}
      {!att.ready && (
        <div className="grid lg:grid-cols-2 gap-5 mb-8">
          {att.tokenizer.status !== "ready" && (
            <ModelLoader
              status={att.tokenizer.status}
              events={att.tokenizer.events}
              errorMsg={att.tokenizer.error ?? undefined}
              modelId="tokenizer · all-MiniLM-L6-v2"
            />
          )}
          {att.model.status !== "ready" && (
            <ModelLoader
              status={att.model.status}
              events={att.model.events}
              errorMsg={att.model.error ?? undefined}
              modelId="encoder · all-MiniLM-L6-v2 (sentence-transformer)"
            />
          )}
        </div>
      )}

      {/* input + presets */}
      <div className="glass-strong rounded-2xl p-5 mb-6">
        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan block mb-2">
          Input sentence
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-ink-950/60 border border-ink-700 rounded-lg px-4 py-3 font-mono text-ink-50 focus:outline-none focus:border-accent-cyan transition"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs font-mono px-3 py-1 rounded-md bg-ink-800/60 text-ink-300 hover:bg-ink-700/60 hover:text-ink-50 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* layer selector — only shown when we have >1 layer */}
      {result && result.attentions.length > 1 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet">
              Layer · {layerIdx + 1} / {result.attentions.length}
            </p>
            <p className="text-xs font-mono text-ink-400">click a layer to inspect its heads</p>
          </div>
          <div className="flex gap-1">
            {result.attentions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setLayerIdx(i);
                  setHeadIdx(null);
                  setFromTok(null);
                }}
                className={
                  "flex-1 h-10 rounded-md font-mono text-xs transition " +
                  (i === layerIdx
                    ? "bg-accent-cyan text-ink-950 font-bold"
                    : "bg-ink-800/60 text-ink-300 hover:bg-ink-700/60")
                }
              >
                L{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* note when we derive similarity from real hidden states */}
      {result?.derivedFromHidden && (
        <div className="mb-6 glass-strong rounded-2xl p-5 border-l-4 border-accent-amber">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-amber mb-1">
            note · token similarity from real hidden states
          </p>
          <p className="text-sm text-ink-200 leading-relaxed">
            We use <span className="font-mono text-accent-cyan">all-MiniLM-L6-v2</span> (a
            BERT-style sentence transformer, 6 layers · 12 heads · {result.hiddenDim}-d hidden)
            because its ONNX export actually exposes per-token hidden states — bert-base&apos;s
            browser export only returns logits. What you see below is computed from the
            model&apos;s <em>real last-layer hidden states</em>: pairwise cosine similarity,
            softmax-normalised per row. Same signal used in BERTology probing papers.
          </p>
        </div>
      )}

      {/* heads grid (12 if real attention, 1 if derived from hidden states) */}
      {result && layerAttn && (
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-violet mb-3">
            {layerAttn.length === 1
              ? `Layer ${layerIdx + 1} · similarity matrix`
              : `${layerAttn.length} heads of layer ${layerIdx + 1} · click to focus`}
          </p>
          <div
            className={
              layerAttn.length === 1
                ? "max-w-sm"
                : "grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3"
            }
          >
            {layerAttn.map((h, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setHeadIdx(headIdx === i ? null : i)}
                className={
                  "glass rounded-xl p-2 transition border-2 w-full " +
                  (headIdx === i
                    ? "border-accent-cyan shadow-glow"
                    : "border-transparent hover:border-ink-600")
                }
              >
                <div className="text-[10px] font-mono text-ink-400 mb-1 text-left">
                  {layerAttn.length === 1 ? "similarity" : `head ${i.toString().padStart(2, "0")}`}
                </div>
                <AttentionHeatmap matrix={h} tokens={result.tokens} size={140} showLabels={false} />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* focused detail */}
      {result && focusedHead && (
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
                  layer {layerIdx + 1} · head {(headIdx ?? 0).toString().padStart(2, "0")}
                </p>
                <h3 className="font-display font-semibold text-xl text-ink-50">
                  Real attention matrix
                </h3>
              </div>
              <p className="text-xs font-mono text-ink-400">
                rows = queries · cols = keys
              </p>
            </div>
            <AttentionHeatmap
              matrix={focusedHead}
              tokens={result.tokens}
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
                  <span className="font-mono text-accent-cyan">{result.tokens[fromTok]}</span> attends to…
                </>
              ) : (
                "Pick a source token"
              )}
            </h3>
            <AttentionArcs matrix={focusedHead} tokens={result.tokens} fromToken={fromTok} />
            {fromTok != null && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                {focusedHead[fromTok]
                  .map((v, j) => ({ v, j }))
                  .sort((a, b) => b.v - a.v)
                  .slice(0, 4)
                  .map(({ v, j }) => (
                    <div
                      key={j}
                      className="flex justify-between items-center px-3 py-2 rounded-lg bg-ink-800/40"
                    >
                      <span className="text-ink-200">{result.tokens[j]}</span>
                      <span className="text-accent-cyan">{(v * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* placeholder if no head selected */}
      {result && !focusedHead && (
        <div className="glass rounded-2xl p-10 text-center text-ink-400">
          Pick a head above to inspect its full attention matrix.
        </div>
      )}

      {/* explainer */}
      <div className="mt-12 glass rounded-2xl p-7">
        <h3 className="font-display text-xl mb-3 text-ink-50">What you&apos;re looking at</h3>
        <ul className="space-y-2 text-sm text-ink-200 leading-relaxed">
          <li>
            Every matrix is computed from a <span className="text-accent-cyan font-mono">real forward pass</span>{" "}
            through a real transformer — same arithmetic as production.
          </li>
          <li>
            <span className="font-mono text-accent-cyan">Row i, column j</span> = how strongly the
            model has aligned token <em>i</em> with token <em>j</em> at the top of the stack. Each
            row sums to 1 (softmax over cosine similarities).
          </li>
          <li>
            <span className="font-mono">all-MiniLM-L6-v2</span> is a BERT-style sentence
            transformer (6 layers · 12 heads · 384-d hidden, ~22M params). Its bidirectional
            attention is exactly the same flavour as BERT-base — both lower and upper triangles
            are populated. A T5 decoder would show a strict lower-triangle pattern from its causal
            mask.
          </li>
        </ul>
      </div>

      {att.state.status === "error" && (
        <div className="mt-6 glass-strong rounded-2xl p-5 border-l-4 border-accent-coral">
          <p className="text-sm text-accent-coral font-mono">
            inference failed: {att.state.error}
          </p>
        </div>
      )}
    </PageShell>
  );
}
