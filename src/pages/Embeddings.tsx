import { useState, useMemo } from "react";
import PageShell from "../components/PageShell";
import EmbeddingScatter from "../components/graphics/EmbeddingScatter";
import { WORDS, WordCategory, categoryColor, categoryLabel, neighbors, analogy } from "../data/embeddings";

const ANALOGIES = [
  { a: "king", b: "man", c: "woman", expected: "queen" },
  { a: "father", b: "man", c: "woman", expected: "mother" },
  { a: "prince", b: "boy", c: "girl", expected: "princess" },
];

export default function Embeddings() {
  const [selected, setSelected] = useState<string | null>("king");
  const [activeAnalogy, setActiveAnalogy] = useState<number | null>(null);

  const sel = selected ? WORDS.find((w) => w.word === selected) ?? null : null;
  const nbrs = selected ? neighbors(selected, 5) : [];

  const showAnalogy = useMemo(() => {
    if (activeAnalogy == null) return null;
    const an = ANALOGIES[activeAnalogy];
    const wa = WORDS.find((w) => w.word === an.a);
    const wb = WORDS.find((w) => w.word === an.b);
    const wc = WORDS.find((w) => w.word === an.c);
    if (!wa || !wb || !wc) return null;
    const { result, predicted } = analogy(an.a, an.b, an.c);
    return predicted ? { a: wa, b: wb, c: wc, predicted, result } : null;
  }, [activeAnalogy]);

  const categories = Array.from(new Set(WORDS.map((w) => w.category))) as WordCategory[];

  return (
    <PageShell
      eyebrow="Module · 04"
      title="Embedding Space"
      subtitle="Words turned into vectors. Distances encode meaning. Click a word to see its neighbours, or run a vector-arithmetic analogy."
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="glass-strong rounded-2xl p-4">
          <EmbeddingScatter
            highlightWord={selected}
            showAnalogy={showAnalogy}
            onWordClick={(w) => {
              setSelected(w.word);
              setActiveAnalogy(null);
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan mb-2">
              Selected
            </p>
            <p className="font-mono text-2xl text-accent-cyan font-bold">
              {sel?.word ?? "—"}
            </p>
            <p className="text-xs font-mono text-ink-400 mt-1">
              category: {sel ? categoryLabel[sel.category] : "—"}
            </p>
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400 mb-2">
                5 nearest neighbours
              </p>
              <div className="space-y-1">
                {nbrs.map((n, i) => (
                  <button
                    key={n.word}
                    onClick={() => setSelected(n.word)}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md bg-ink-800/40 hover:bg-ink-700/60 transition text-left"
                  >
                    <span className="w-5 text-xs font-mono text-ink-500">#{i + 1}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: categoryColor[n.category] }}
                    />
                    <span className="font-mono text-sm text-ink-100">{n.word}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-3">
              Vector arithmetic
            </p>
            <div className="space-y-2">
              {ANALOGIES.map((an, i) => (
                <button
                  key={i}
                  onClick={() => setActiveAnalogy(activeAnalogy === i ? null : i)}
                  className={
                    "w-full text-left p-3 rounded-lg font-mono text-xs transition " +
                    (activeAnalogy === i
                      ? "bg-accent-violet text-ink-950"
                      : "bg-ink-800/40 text-ink-200 hover:bg-ink-700/60")
                  }
                >
                  <span className="font-bold">{an.a}</span> − <span>{an.b}</span> +{" "}
                  <span>{an.c}</span> ≈ <span className="opacity-70">{an.expected}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400 mb-3">
              Legend
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <div key={c} className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: categoryColor[c] }}
                  />
                  <span className="text-ink-300">{categoryLabel[c]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl p-7">
        <h3 className="font-display text-xl mb-3 text-ink-50">Why this matters</h3>
        <p className="text-ink-200 leading-relaxed text-sm">
          Inside a transformer, every token is first turned into a vector (a learned embedding).
          The model never sees words — only points in a high-dimensional space. Distances and
          directions in that space encode meaning: similar words cluster, and the difference
          vector{" "}
          <span className="font-mono text-accent-coral">king − man</span> roughly equals{" "}
          <span className="font-mono text-accent-cyan">queen − woman</span>. That&apos;s where
          everything else — attention, FFN, output — operates.
        </p>
      </div>
    </PageShell>
  );
}
