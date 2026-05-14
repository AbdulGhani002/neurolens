import PageShell from "../components/PageShell";
import GenerationDemo from "../components/graphics/GenerationDemo";

export default function WhyNotBert() {
  return (
    <PageShell
      eyebrow="Module · 06"
      title="Why not BERT for generation?"
      subtitle="A common student question — answered visually. The encoder-only architecture is missing three things you need to generate sequences."
    >
      {/* side-by-side animated demo */}
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <div className="glass-strong rounded-2xl p-6 border-l-4 border-accent-coral">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral">
              T5 · encoder-decoder
            </p>
            <h3 className="font-display font-bold text-xl text-ink-50">Translates token by token</h3>
          </div>
          <GenerationDemo
            source={["translate", "to", "Urdu", ":", "good", "morning"]}
            target={["صبح", "بخیر"]}
            variant="t5"
            stepMs={1200}
          />
        </div>

        <div className="glass-strong rounded-2xl p-6 border-l-4 border-accent-cyan">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
              BERT · encoder-only
            </p>
            <h3 className="font-display font-bold text-xl text-ink-50">Has nothing to extend with</h3>
          </div>
          <GenerationDemo
            source={["translate", "to", "Urdu", ":", "good", "morning"]}
            target={[]}
            variant="bert"
          />
        </div>
      </div>

      {/* the three missing pieces */}
      <div className="mb-12">
        <h2 className="font-display text-2xl text-ink-50 mb-6">The three missing pieces</h2>
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

      {/* what BERT can do instead */}
      <div className="glass rounded-2xl p-7 mb-12">
        <h3 className="font-display text-xl text-ink-50 mb-3">
          What BERT can do — and why it&apos;s still useful
        </h3>
        <p className="text-ink-200 leading-relaxed text-sm mb-4">
          BERT&apos;s bidirectional attention is exactly what you want when the goal is to{" "}
          <em>read</em> a sequence: classify it, tag every token, answer a span question, or
          produce a sentence embedding. For those, looking at both left and right context at every
          layer is a strength.
        </p>
        <p className="text-ink-200 leading-relaxed text-sm">
          For <em>producing</em> a new sequence, you need the same architecture turned around: an
          encoder that reads the source, plus a decoder that emits the target one token at a time.
          That decoder is what BERT lacks and T5 has.
        </p>
      </div>

      {/* takeaway */}
      <div className="glass-strong rounded-2xl p-7 border-l-4 border-accent-violet">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-2">
          Takeaway
        </p>
        <p className="text-ink-50 text-lg leading-relaxed">
          BERT is <span className="font-semibold text-accent-cyan">half</span> of T5. Add the
          decoder — masked self-attention, cross-attention, and an autoregressive output loop —
          and you turn an understanding model into a generation model.
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
