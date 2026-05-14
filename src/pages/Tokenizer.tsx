import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import TokenChips from "../components/graphics/TokenChips";
import ModelLoader from "../components/ModelLoader";
import { useTokenizer } from "../hooks/useTransformer";
import { Token } from "../utils/tokenizers";

const PRESETS = [
  "The cat sat on the mat.",
  "She opened the door quickly.",
  "translate English to Urdu: good morning",
  "Unhappiness is preprocessing tokenization.",
  "Multilingual transformers tokenize Bismillah بسم الله",
];

const MODELS = [
  {
    id: "Xenova/bert-base-uncased",
    title: "WordPiece",
    subtitle: "bert-base-uncased · 30,522 tokens",
    accent: "cyan" as const,
    marker: (
      <>
        <span className="font-mono text-accent-cyan">##prefix</span> = sub-piece
      </>
    ),
  },
  {
    id: "Xenova/t5-small",
    title: "SentencePiece",
    subtitle: "t5-small · 32,128 tokens",
    accent: "violet" as const,
    marker: (
      <>
        <span className="font-mono text-accent-violet">▁prefix</span> = word-start
      </>
    ),
  },
  {
    id: "Xenova/gpt2",
    title: "BPE",
    subtitle: "gpt-2 · 50,257 tokens",
    accent: "coral" as const,
    marker: (
      <>
        <span className="font-mono text-accent-coral">Ġprefix</span> = leading space
      </>
    ),
  },
];

export default function Tokenizer() {
  const [input, setInput] = useState(PRESETS[2]);

  const bert = useTokenizer("Xenova/bert-base-uncased");
  const t5 = useTokenizer("Xenova/t5-small");
  const gpt = useTokenizer("Xenova/gpt2");

  const allReady = bert.status === "ready" && t5.status === "ready" && gpt.status === "ready";
  const anyLoading =
    bert.status === "loading" || t5.status === "loading" || gpt.status === "loading";
  const anyError = bert.status === "error" || t5.status === "error" || gpt.status === "error";

  return (
    <PageShell
      eyebrow="Module · 03"
      title="Tokenizer Playground"
      subtitle="Real BERT, T5, and GPT-2 tokenizers running locally in your browser via ONNX/WASM. Type anything — the same text gets tokenized three different ways."
    >
      {/* loaders for each model */}
      {!allReady && (
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          {bert.status !== "ready" && (
            <ModelLoader
              status={bert.status}
              events={bert.events}
              errorMsg={bert.error ?? undefined}
              modelId="bert-base-uncased"
            />
          )}
          {t5.status !== "ready" && (
            <ModelLoader
              status={t5.status}
              events={t5.events}
              errorMsg={t5.error ?? undefined}
              modelId="t5-small"
            />
          )}
          {gpt.status !== "ready" && (
            <ModelLoader
              status={gpt.status}
              events={gpt.events}
              errorMsg={gpt.error ?? undefined}
              modelId="gpt2"
            />
          )}
        </div>
      )}

      {/* input */}
      <div className="glass-strong rounded-2xl p-5 mb-6">
        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan block mb-2">
          Input text · {allReady ? "live" : anyLoading ? "loading models…" : "tokenizers not ready"}
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-ink-950/60 border border-ink-700 rounded-lg px-4 py-3 font-mono text-ink-50 focus:outline-none focus:border-accent-cyan transition"
          disabled={anyLoading}
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
          accent={MODELS[0].accent}
          title={MODELS[0].title}
          subtitle={MODELS[0].subtitle}
          marker={MODELS[0].marker}
          tokenizer={bert.value}
          input={input}
          algorithm="wordpiece"
        />
        <TokenPane
          accent={MODELS[1].accent}
          title={MODELS[1].title}
          subtitle={MODELS[1].subtitle}
          marker={MODELS[1].marker}
          tokenizer={t5.value}
          input={input}
          algorithm="sentencepiece"
        />
        <TokenPane
          accent={MODELS[2].accent}
          title={MODELS[2].title}
          subtitle={MODELS[2].subtitle}
          marker={MODELS[2].marker}
          tokenizer={gpt.value}
          input={input}
          algorithm="bpe"
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
              <span className="font-mono">##</span>-prefixed sub-pieces.
            </p>
          </div>
          <div>
            <p className="font-semibold text-accent-violet mb-2">SentencePiece</p>
            <p>
              Treats whitespace as a regular symbol, encoded as{" "}
              <span className="font-mono">▁</span>. Word-starts carry the marker.
            </p>
          </div>
          <div>
            <p className="font-semibold text-accent-coral mb-2">BPE</p>
            <p>
              Starts from bytes and iteratively merges the most frequent adjacent pair from a
              learned merge table.
            </p>
          </div>
        </div>
      </div>

      {anyError && (
        <div className="mt-6 glass-strong rounded-2xl p-5 border-l-4 border-accent-coral">
          <p className="text-sm text-accent-coral font-mono">
            One or more tokenizers failed to load. Check your network / browser console.
          </p>
        </div>
      )}
    </PageShell>
  );
}

function TokenPane({
  accent,
  title,
  subtitle,
  marker,
  tokenizer,
  input,
  algorithm,
}: {
  accent: "cyan" | "violet" | "coral";
  title: string;
  subtitle: string;
  marker: React.ReactNode;
  tokenizer: any;
  input: string;
  algorithm: "wordpiece" | "sentencepiece" | "bpe";
}) {
  const colorClass =
    accent === "cyan"
      ? "text-accent-cyan"
      : accent === "violet"
      ? "text-accent-violet"
      : "text-accent-coral";

  const [tokens, setTokens] = useState<Token[]>([]);
  const [vocabSize, setVocabSize] = useState(0);

  useEffect(() => {
    if (!tokenizer || !input) {
      setTokens([]);
      return;
    }
    try {
      const ids: number[] = tokenizer.encode(input, { add_special_tokens: false });
      const raw: string[] = ids.map((id: number) => tokenizer.decode([id], { skip_special_tokens: false }));
      const out = idsToTokens(ids, raw, tokenizer, algorithm);
      setTokens(out);
      setVocabSize(tokenizer.model?.vocab?.length ?? tokenizer.vocab_size ?? 0);
    } catch (e) {
      console.warn("tokenization failed:", e);
      setTokens([]);
    }
  }, [tokenizer, input, algorithm]);

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
        {tokenizer ? (
          tokens.length > 0 ? (
            <TokenChips tokens={tokens} accent={accent} />
          ) : (
            <p className="text-xs font-mono text-ink-500">type to tokenize…</p>
          )
        ) : (
          <p className="text-xs font-mono text-ink-500">loading tokenizer…</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-ink-700/40">
        <div>
          <p className="text-ink-400">Tokens</p>
          <p className={`text-lg font-bold ${colorClass}`}>{tokens.length}</p>
        </div>
        <div>
          <p className="text-ink-400">Vocab size</p>
          <p className="text-lg font-bold text-ink-100">{vocabSize ? vocabSize.toLocaleString() : "—"}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Convert token IDs + decoded surface strings into our Token type, recognising
 * the continuation markers each algorithm uses.
 */
function idsToTokens(
  ids: number[],
  decoded: string[],
  tokenizer: any,
  algorithm: "wordpiece" | "sentencepiece" | "bpe"
): Token[] {
  // Convert IDs to the raw token strings (including ## / ▁ / Ġ markers if present)
  const surface: string[] = ids.map((id: number) => {
    try {
      const arr = tokenizer.model.convert_ids_to_tokens
        ? tokenizer.model.convert_ids_to_tokens([id])
        : tokenizer.convert_ids_to_tokens?.([id]) ?? null;
      return arr ? arr[0] : decoded[ids.indexOf(id)] ?? String(id);
    } catch {
      return decoded[ids.indexOf(id)] ?? String(id);
    }
  });

  return surface.map((tok, i) => {
    let display = tok;
    let isContinuation = false;
    if (algorithm === "wordpiece") {
      isContinuation = tok.startsWith("##");
      display = tok;
    } else if (algorithm === "sentencepiece") {
      // SentencePiece uses ▁ (U+2581) for word starts
      isContinuation = !tok.startsWith("▁") && i > 0;
      display = tok;
    } else if (algorithm === "bpe") {
      // GPT-2 BPE uses Ġ (U+0120) for the start of a new word
      isContinuation = !tok.startsWith("Ġ") && i > 0;
      display = tok;
    }
    return {
      text: display,
      isContinuation,
      raw: tok,
    };
  });
}
