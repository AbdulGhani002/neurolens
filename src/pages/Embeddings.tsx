import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import ModelLoader from "../components/ModelLoader";
import { useAutoEmbeddings, WordVector } from "../hooks/useEmbeddings";

const SEED: { word: string; category: string }[] = [
  // royalty
  { word: "king", category: "royalty" },
  { word: "queen", category: "royalty" },
  { word: "prince", category: "royalty" },
  { word: "princess", category: "royalty" },
  // people
  { word: "man", category: "people" },
  { word: "woman", category: "people" },
  { word: "boy", category: "people" },
  { word: "girl", category: "people" },
  { word: "father", category: "people" },
  { word: "mother", category: "people" },
  // animals
  { word: "cat", category: "animals" },
  { word: "dog", category: "animals" },
  { word: "horse", category: "animals" },
  { word: "cow", category: "animals" },
  { word: "bird", category: "animals" },
  { word: "fish", category: "animals" },
  // food
  { word: "bread", category: "food" },
  { word: "pizza", category: "food" },
  { word: "rice", category: "food" },
  { word: "apple", category: "food" },
  { word: "banana", category: "food" },
  // places
  { word: "Paris", category: "places" },
  { word: "London", category: "places" },
  { word: "Tokyo", category: "places" },
  { word: "Karachi", category: "places" },
  { word: "Berlin", category: "places" },
  // tech
  { word: "computer", category: "tech" },
  { word: "code", category: "tech" },
  { word: "algorithm", category: "tech" },
  { word: "network", category: "tech" },
  // emotions
  { word: "happy", category: "emotions" },
  { word: "sad", category: "emotions" },
  { word: "angry", category: "emotions" },
  { word: "love", category: "emotions" },
  // verbs
  { word: "run", category: "verbs" },
  { word: "walk", category: "verbs" },
  { word: "eat", category: "verbs" },
  { word: "sleep", category: "verbs" },
];

const CATEGORY_COLOR: Record<string, string> = {
  royalty: "#ffc857",
  people: "#a472ff",
  animals: "#5ee4d4",
  food: "#ff6f91",
  places: "#a472ff",
  tech: "#5ee4d4",
  emotions: "#ff6f91",
  verbs: "#9aa3c0",
  custom: "#fff",
};

const ANALOGIES = [
  ["king", "man", "woman"],
  ["father", "man", "woman"],
  ["prince", "boy", "girl"],
];

export default function Embeddings() {
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<string | null>("king");
  const [showAnalogy, setShowAnalogy] = useState<number | null>(null);

  const allWords = useMemo(
    () => [...SEED, ...extra.map((w) => ({ word: w, category: "custom" }))],
    [extra]
  );

  const emb = useAutoEmbeddings(allWords);

  // re-embed when the word list grows
  useEffect(() => {
    if (emb.pipe.status === "ready") {
      emb.embed(allWords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, emb.pipe.status]);

  const points = emb.state.result;
  const nbrs = selected ? emb.neighbors(selected, 6) : [];
  const analogyResult = useMemo(() => {
    if (showAnalogy == null) return null;
    const [a, b, c] = ANALOGIES[showAnalogy];
    return emb.analogy(a, b, c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalogy, points.length]);

  const addWord = () => {
    const t = draft.trim();
    if (!t || allWords.find((w) => w.word === t)) return;
    setExtra((prev) => [...prev, t]);
    setDraft("");
    setSelected(t);
  };

  return (
    <PageShell
      eyebrow="Module · 04"
      title="Embedding Space"
      subtitle="Real 384-dim sentence-transformer embeddings projected to 2-D via PCA. Add any word — it gets embedded live and the projection re-fits. Click a point to see its real cosine neighbours."
    >
      {emb.pipe.status !== "ready" && (
        <div className="mb-6">
          <ModelLoader
            status={emb.pipe.status}
            events={emb.pipe.events}
            errorMsg={emb.pipe.error ?? undefined}
            modelId="all-MiniLM-L6-v2 · feature-extraction"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-mono">
        <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
          model:&nbsp;<span className="text-accent-cyan">all-MiniLM-L6-v2</span>
        </span>
        <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
          dim:&nbsp;<span className="text-ink-100">384</span>
        </span>
        <span className="px-3 py-1 rounded-full glass border border-ink-700/40">
          words:&nbsp;<span className="text-ink-100">{points.length}</span>
        </span>
        {emb.state.status === "running" && (
          <span className="px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
            embedding…
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="glass-strong rounded-2xl p-4 min-h-[520px]">
          {points.length > 0 ? (
            <EmbeddingScatter
              points={points}
              highlightWord={selected}
              analogyResult={analogyResult}
              analogyTriple={showAnalogy != null ? ANALOGIES[showAnalogy] : null}
              onWordClick={(w) => {
                setSelected(w.word);
                setShowAnalogy(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-ink-400">
              {emb.pipe.status === "ready" ? "computing embeddings…" : "loading model…"}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan mb-2">
              Add your own word
            </p>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWord()}
                placeholder="type any word…"
                className="flex-1 bg-ink-950/60 border border-ink-700 rounded-lg px-3 py-2 font-mono text-sm text-ink-50 focus:outline-none focus:border-accent-cyan transition"
              />
              <button
                onClick={addWord}
                className="px-4 py-2 rounded-lg bg-accent-cyan text-ink-950 font-semibold text-sm hover:shadow-glow transition"
              >
                add
              </button>
            </div>
            {extra.length > 0 && (
              <p className="text-[10px] font-mono text-ink-400 mt-3">
                added: {extra.join(", ")}
              </p>
            )}
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan mb-2">
              Selected
            </p>
            <p className="font-mono text-2xl text-accent-cyan font-bold">{selected ?? "—"}</p>
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400 mb-2">
                real cosine neighbours
              </p>
              <div className="space-y-1">
                {nbrs.map((n, i) => (
                  <button
                    key={n.word}
                    onClick={() => setSelected(n.word)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-md bg-ink-800/40 hover:bg-ink-700/60 transition text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-5 text-xs font-mono text-ink-500">#{i + 1}</span>
                      <span className="font-mono text-sm text-ink-100">{n.word}</span>
                    </span>
                    <span className="text-[10px] font-mono text-accent-cyan">
                      {(n.sim * 100).toFixed(1)}%
                    </span>
                  </button>
                ))}
                {nbrs.length === 0 && (
                  <p className="text-xs font-mono text-ink-500">
                    select a point to see neighbours
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-violet mb-3">
              Vector arithmetic
            </p>
            <div className="space-y-2">
              {ANALOGIES.map(([a, b, c], i) => (
                <button
                  key={i}
                  onClick={() => setShowAnalogy(showAnalogy === i ? null : i)}
                  className={
                    "w-full text-left p-3 rounded-lg font-mono text-xs transition " +
                    (showAnalogy === i
                      ? "bg-accent-violet text-ink-950"
                      : "bg-ink-800/40 text-ink-200 hover:bg-ink-700/60")
                  }
                >
                  <span className="font-bold">{a}</span> − <span>{b}</span> +{" "}
                  <span>{c}</span> ={" "}
                  <span className="opacity-80">
                    {showAnalogy === i ? (analogyResult?.word ?? "…") : "?"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl p-7">
        <h3 className="font-display text-xl mb-3 text-ink-50">Real embeddings, real maths</h3>
        <p className="text-ink-200 leading-relaxed text-sm mb-3">
          Each word is run through <span className="font-mono text-accent-cyan">all-MiniLM-L6-v2</span>{" "}
          and pooled into a 384-dim vector. Distances and nearest neighbours below are computed on
          the real vectors, not on the 2-D projection. The PCA is just for plotting — the actual
          semantic structure lives in the 384-d space.
        </p>
        <p className="text-ink-300 leading-relaxed text-sm">
          Add a word, click any point. The neighbour percentages are cosine similarities — 100% =
          identical direction, 0% = perpendicular.
        </p>
      </div>
    </PageShell>
  );
}

function EmbeddingScatter({
  points,
  highlightWord,
  analogyResult,
  analogyTriple,
  onWordClick,
}: {
  points: WordVector[];
  highlightWord: string | null;
  analogyResult: { word: string; sim: number } | null;
  analogyTriple: string[] | null;
  onWordClick: (w: WordVector) => void;
}) {
  const W = 720;
  const H = 520;
  const PAD = 30;
  const xy = (p: WordVector) => ({
    x: PAD + p.x * (W - 2 * PAD),
    y: PAD + (1 - p.y) * (H - 2 * PAD),
  });

  const highlighted = highlightWord
    ? points.find((p) => p.word === highlightWord) ?? null
    : null;
  const analogyPts = analogyTriple
    ? analogyTriple
        .map((w) => points.find((p) => p.word === w))
        .filter((p): p is WordVector => !!p)
    : [];
  const analogyResultPt = analogyResult
    ? points.find((p) => p.word === analogyResult.word) ?? null
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <radialGradient id="emb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5ee4d4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5ee4d4" stopOpacity="0" />
        </radialGradient>
        <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#ff6f91" />
        </marker>
        <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#5ee4d4" />
        </marker>
      </defs>

      <text x={W - PAD} y={H - PAD + 18} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#48527a">
        pc 1 →
      </text>
      <text x={PAD - 6} y={PAD + 6} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#48527a">
        pc 2 ↑
      </text>

      {/* analogy arrows */}
      {analogyPts.length === 3 && analogyResultPt && (() => {
        const [a, b, c] = analogyPts;
        const pA = xy(a), pB = xy(b), pC = xy(c), pR = xy(analogyResultPt);
        return (
          <g opacity="0.8">
            <line x1={pB.x} y1={pB.y} x2={pA.x} y2={pA.y} stroke="#ff6f91" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrA)" />
            <line x1={pC.x} y1={pC.y} x2={pR.x} y2={pR.y} stroke="#5ee4d4" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrB)" />
            <circle cx={pR.x} cy={pR.y} r="14" fill="url(#emb-glow)" />
          </g>
        );
      })()}

      {points.map((p) => {
        const { x, y } = xy(p);
        const color = CATEGORY_COLOR[p.category ?? "custom"] ?? "#fff";
        const isHi = highlighted?.word === p.word;
        return (
          <motion.g
            key={p.word}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onWordClick(p)}
            className="cursor-pointer"
          >
            {isHi && <circle cx={x} cy={y} r="18" fill={color} opacity="0.25" />}
            <circle cx={x} cy={y} r={isHi ? 6 : 4} fill={color} stroke={isHi ? "#fff" : "none"} strokeWidth="1.5" />
            <text
              x={x + 8}
              y={y + 4}
              fontFamily="JetBrains Mono"
              fontSize={isHi ? 13 : 11}
              fill={isHi ? "#fff" : "#c9cfe0"}
              fontWeight={isHi ? 700 : 400}
            >
              {p.word}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
