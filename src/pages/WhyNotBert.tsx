import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import ModelLoader from "../components/ModelLoader";
import { useT5 } from "../hooks/useGeneration";
import { useAutoAttention } from "../hooks/useAttention";

const PRESETS = [
  "Good morning, how are you?",
  "The cat sat on the mat.",
  "I love coding in TypeScript.",
];

export default function WhyNotBert() {
  const [input, setInput] = useState(PRESETS[0]);
  const t5 = useT5("Xenova/t5-small");
  const att = useAutoAttention(input, {
    modelId: "Xenova/all-MiniLM-L6-v2",
    debounceMs: 400,
  });

  // re-run T5 on input change
  useEffect(() => {
    if (!input.trim()) return;
    if (t5.pipe.status === "ready") {
      t5.generate("translate English to German: " + input, { max_new_tokens: 64 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, t5.pipe.status]);

  return (
    <PageShell
      eyebrow="Module · 06"
      title="Why not BERT for generation?"
      subtitle="Side-by-side, live. T5-small actually translates your sentence token by token. BERT (MiniLM here) actually runs — and produces N output vectors for N input tokens. Generation never happens because there's nowhere for it to start."
    >
      {/* model loaders */}
      {(t5.pipe.status !== "ready" || !att.ready) && (
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {t5.pipe.status !== "ready" && (
            <ModelLoader
              status={t5.pipe.status}
              events={t5.pipe.events}
              errorMsg={t5.pipe.error ?? undefined}
              modelId="T5-small (encoder-decoder, generation)"
            />
          )}
          {!att.ready && (
            <ModelLoader
              status={att.model.status as any}
              events={att.model.events}
              errorMsg={att.model.error ?? undefined}
              modelId="MiniLM (encoder-only, no decoder)"
            />
          )}
        </div>
      )}

      {/* input */}
      <div className="glass-strong rounded-2xl p-5 mb-8">
        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan block mb-2">
          English sentence (we&apos;ll translate to German)
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

      {/* side-by-side: real T5 vs real BERT */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-2xl p-6 border-l-4 border-accent-coral"
        >
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral">
              T5 · encoder-decoder
            </p>
            <h3 className="font-display font-bold text-xl text-ink-50">
              translating, token by token
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
                prompt
              </p>
              <p className="font-mono text-xs text-ink-200 bg-ink-950/60 px-3 py-2 rounded border border-ink-700/40">
                <span className="text-accent-amber">translate English to German:</span>{" "}
                <span className="text-ink-100">{input}</span>
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
                decoder output (autoregressive)
              </p>
              <div className="rounded-lg p-4 bg-accent-coral/10 border-l-4 border-accent-coral min-h-[80px]">
                {t5.state.status === "running" && !t5.state.streaming && !t5.state.result?.text && (
                  <p className="text-ink-400 font-mono text-xs">generating…</p>
                )}
                {(t5.state.streaming || t5.state.result?.text) && (
                  <p className="text-ink-50 text-base leading-relaxed">
                    {t5.state.streaming || t5.state.result?.text}
                    {t5.state.status === "running" && (
                      <span className="inline-block w-2 h-4 ml-1 bg-accent-coral animate-pulse-soft align-middle" />
                    )}
                  </p>
                )}
                {t5.state.status === "error" && (
                  <p className="text-accent-coral font-mono text-xs">{t5.state.error}</p>
                )}
              </div>
            </div>

            {t5.state.result && (
              <div className="flex gap-4 text-[10px] font-mono text-ink-400 pt-2 border-t border-ink-700/40">
                <span>
                  tokens: <span className="text-ink-100">{t5.state.result.numTokens}</span>
                </span>
                <span>
                  latency:{" "}
                  <span className="text-ink-100">{t5.state.result.elapsedMs.toFixed(0)}ms</span>
                </span>
                <span>
                  tok/s:{" "}
                  <span className="text-ink-100">{t5.state.result.tokPerSec.toFixed(1)}</span>
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-2xl p-6 border-l-4 border-accent-cyan"
        >
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
              BERT · encoder-only
            </p>
            <h3 className="font-display font-bold text-xl text-ink-50">
              nothing to extend with
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
                input
              </p>
              <p className="font-mono text-xs text-ink-200 bg-ink-950/60 px-3 py-2 rounded border border-ink-700/40">
                {input}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
                output vectors · one per input token, that&apos;s it
              </p>
              <div className="rounded-lg p-4 bg-accent-cyan/10 border-l-4 border-accent-cyan min-h-[80px]">
                {att.state.result ? (
                  <div className="flex flex-wrap gap-1.5">
                    {att.state.result.tokens.map((t, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="font-mono text-[10px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                        title={`${t} → 384-d vector`}
                      >
                        {t} ⟶ [{att.state.result.hiddenDim}d]
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-400 font-mono text-xs">running encoder…</p>
                )}
              </div>
            </div>

            <p className="text-[11px] font-mono text-accent-coral mt-2 pt-2 border-t border-ink-700/40">
              same length in = same length out · no generation loop · nothing produces a new token
            </p>
          </div>
        </motion.div>
      </div>

      {/* three missing pieces */}
      <div className="mb-12">
        <h2 className="font-display text-2xl text-ink-50 mb-6">
          The three pieces BERT is missing
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <MissingPiece
            num="01"
            title="A causal mask"
            body="At each step, the decoder must look only at tokens already produced — not the future. BERT's attention is bidirectional. Every token sees every other. Useful for understanding, fatal for generation."
            formula="mask[i,j] = -∞ if j > i"
          />
          <MissingPiece
            num="02"
            title="Cross-attention"
            body="The decoder needs a way to look back at the source. T5's cross-attention queries the encoder's output for every decoded position. BERT has no decoder, so there is nothing doing this lookup."
            formula="Q = decoder, K, V = encoder"
          />
          <MissingPiece
            num="03"
            title="An autoregressive loop"
            body="Generation is sequential: produce token t, feed it back, produce token t+1. The output-back-to-input plumbing doesn't exist in BERT — one pass in, one set of vectors out."
            formula="yₜ ← softmax(h_t · Eᵀ)"
          />
        </div>
      </div>

      {/* takeaway */}
      <div className="glass-strong rounded-2xl p-7 border-l-4 border-accent-violet">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-2">
          Takeaway
        </p>
        <p className="text-ink-50 text-lg leading-relaxed">
          BERT is <span className="font-semibold text-accent-cyan">half</span> of T5. Add the
          decoder — masked self-attention, cross-attention, and an autoregressive output loop —
          and you turn an understanding model into a generation model. The proof is the screen
          above: same in-browser stack, two architectures, only one generates.
        </p>
      </div>
    </PageShell>
  );
}

function MissingPiece({
  num,
  title,
  body,
  formula,
}: {
  num: string;
  title: string;
  body: string;
  formula: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <span className="absolute top-2 right-3 font-display font-bold text-5xl text-ink-700/40 select-none">
        {num}
      </span>
      <h3 className="font-display font-semibold text-lg text-accent-cyan mb-2">{title}</h3>
      <p className="text-sm text-ink-200 leading-relaxed mb-3">{body}</p>
      <code className="text-xs font-mono text-accent-violet bg-ink-950/60 px-2 py-1 rounded border border-ink-700/60 inline-block">
        {formula}
      </code>
    </div>
  );
}
