import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import TokenChips from "../components/graphics/TokenChips";
import {
  tokenizeWordPiece,
  tokenizeSentencePiece,
  tokenizeBPE,
} from "../utils/tokenizers";

const PRESETS = [
  "The cat sat on the mat.",
  "She opened the door quickly.",
  "translate English to Urdu: good morning",
  "Unhappiness is preprocessing the tokenization.",
];

export default function Tokenizer() {
  const [input, setInput] = useState(PRESETS[2]);

  const results = useMemo(
    () => ({
      wp: tokenizeWordPiece(input),
      sp: tokenizeSentencePiece(input),
      bpe: tokenizeBPE(input),
    }),
    [input]
  );

  return (
    <PageShell
      eyebrow="Module · 03"
      title="Tokenizer Playground"
      subtitle="Three algorithms, one sentence. WordPiece (BERT) uses ## for continuations. SentencePiece (T5) marks word-starts with ▁. BPE (GPT) merges byte pairs greedily."
    >
      {/* input */}
      <div className="glass-strong rounded-2xl p-5 mb-6">
        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan block mb-2">
          Input text
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

      {/* three panes */}
      <div className="grid lg:grid-cols-3 gap-5">
        <TokenPane
          accent="cyan"
          title="WordPiece"
          subtitle="BERT · 30,522 tokens"
          marker={<><span className="font-mono text-accent-cyan">##prefix</span> = sub-piece</>}
          result={results.wp}
        />
        <TokenPane
          accent="violet"
          title="SentencePiece"
          subtitle="T5 · 32,128 tokens"
          marker={<><span className="font-mono text-accent-violet">▁prefix</span> = word-start</>}
          result={results.sp}
        />
        <TokenPane
          accent="coral"
          title="BPE"
          subtitle="GPT-2 · 50,257 tokens"
          marker={<><span className="font-mono text-accent-coral">Ġprefix</span> = leading space</>}
          result={results.bpe}
        />
      </div>

      {/* comparison */}
      <div className="mt-10 glass rounded-2xl p-7">
        <h3 className="font-display text-xl mb-3 text-ink-50">What you&apos;re seeing</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-ink-200 leading-relaxed">
          <div>
            <p className="font-semibold text-accent-cyan mb-2">WordPiece</p>
            <p>
              Splits unknown words into longest-known prefix, then continues with{" "}
              <span className="font-mono">##</span>-prefixed sub-pieces. The <em>first</em> piece
              has no prefix; continuations do.
            </p>
          </div>
          <div>
            <p className="font-semibold text-accent-violet mb-2">SentencePiece</p>
            <p>
              Treats whitespace as a regular symbol, encoded as{" "}
              <span className="font-mono">▁</span>. Word-starts carry the marker; continuations
              don&apos;t. This makes detokenization a pure string-join.
            </p>
          </div>
          <div>
            <p className="font-semibold text-accent-coral mb-2">BPE</p>
            <p>
              Starts from characters and iteratively merges the most frequent adjacent pair from a
              learned merge table. Tends to produce smaller chunks for rare words.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-strong rounded-2xl p-7 border-l-4 border-accent-amber">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-amber mb-2">
          Note
        </p>
        <p className="text-ink-200 text-sm leading-relaxed">
          These are <em>simplified</em> in-browser implementations with a tiny vocab — they
          reproduce the <em>shape</em> of each algorithm, not the exact splits of a production
          checkpoint. For exact tokenization, use{" "}
          <span className="font-mono">transformers.AutoTokenizer</span>.
        </p>
      </div>
    </PageShell>
  );
}

function TokenPane({
  accent,
  title,
  subtitle,
  marker,
  result,
}: {
  accent: "cyan" | "violet" | "coral";
  title: string;
  subtitle: string;
  marker: React.ReactNode;
  result: ReturnType<typeof tokenizeWordPiece>;
}) {
  const colorClass =
    accent === "cyan"
      ? "text-accent-cyan"
      : accent === "violet"
      ? "text-accent-violet"
      : "text-accent-coral";

  return (
    <div className="glass-strong rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <p className={`text-[10px] uppercase tracking-[0.2em] font-mono ${colorClass}`}>
          {subtitle}
        </p>
        <h3 className={`font-display text-xl font-bold ${colorClass} mt-1`}>{title}</h3>
        <p className="text-xs font-mono text-ink-400 mt-1">{marker}</p>
      </div>

      <div className="flex-1 min-h-[140px]">
        <TokenChips tokens={result.tokens} accent={accent} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-ink-700/40">
        <div>
          <p className="text-ink-400">Tokens</p>
          <p className={`text-lg font-bold ${colorClass}`}>{result.tokens.length}</p>
        </div>
        <div>
          <p className="text-ink-400">Vocab hits</p>
          <p className="text-lg font-bold text-ink-100">{result.vocabHits}</p>
        </div>
      </div>
    </div>
  );
}
