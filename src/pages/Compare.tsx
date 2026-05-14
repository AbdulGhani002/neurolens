import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import ModelLoader from "../components/ModelLoader";
import { useT5, useClassifier } from "../hooks/useGeneration";

type Task = "translate-de" | "translate-fr" | "summarize" | "sentiment";

const TASKS: { id: Task; label: string; prefix: string; description: string }[] = [
  {
    id: "translate-de",
    label: "Translate → German",
    prefix: "translate English to German: ",
    description: "Real T5-small autoregressive translation.",
  },
  {
    id: "translate-fr",
    label: "Translate → French",
    prefix: "translate English to French: ",
    description: "Real T5-small autoregressive translation.",
  },
  {
    id: "summarize",
    label: "Summarize",
    prefix: "summarize: ",
    description: "Real T5-small abstractive summarization.",
  },
  {
    id: "sentiment",
    label: "Sentiment classification",
    prefix: "sst2 sentence: ",
    description: "T5 framed as text-to-text vs DistilBERT-SST2 classifier.",
  },
];

const PRESETS: Record<Task, string[]> = {
  "translate-de": [
    "Good morning, how are you?",
    "The cat sat on the mat.",
    "Multi-head attention helps the model focus.",
  ],
  "translate-fr": [
    "Good morning, how are you?",
    "I love coding in TypeScript.",
    "Where is the nearest train station?",
  ],
  summarize: [
    "Transformers are deep learning models that use self-attention to weigh input tokens. BERT is encoder-only and great at understanding tasks like classification and NER. T5 has both an encoder and a decoder, so it can generate text — useful for translation and summarization. They both come from the same Transformer architecture introduced by Vaswani et al. in 2017.",
    "Pakistan won the cricket match by 5 wickets at the National Stadium in Karachi on Friday. Captain Babar Azam scored 87 runs off 92 balls, anchoring the chase after early wickets fell. The crowd of 30,000 erupted as Pakistan crossed the line with two overs to spare.",
  ],
  sentiment: [
    "The lab was amazing!",
    "I really did not enjoy that movie at all.",
    "Honestly, it was just okay — not great, not terrible.",
  ],
};

export default function Compare() {
  const [task, setTask] = useState<Task>("translate-de");
  const [input, setInput] = useState(PRESETS["translate-de"][0]);

  const t5 = useT5("Xenova/t5-small");
  const sst = useClassifier("Xenova/distilbert-base-uncased-finetuned-sst-2-english");

  const taskInfo = TASKS.find((t) => t.id === task)!;

  // re-run on any change
  useEffect(() => {
    if (!input.trim()) return;
    if (t5.pipe.status === "ready") {
      t5.generate(taskInfo.prefix + input, { max_new_tokens: 96 });
    }
    if (task === "sentiment" && sst.pipe.status === "ready") {
      sst.classify(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, task, t5.pipe.status, sst.pipe.status]);

  return (
    <PageShell
      eyebrow="Module · 05"
      title="BERT vs T5"
      subtitle="Same input, two architectures, real models running in your browser. Type whatever you want — T5-small actually translates and summarizes; DistilBERT actually classifies."
    >
      {/* loaders */}
      {(t5.pipe.status !== "ready" || sst.pipe.status !== "ready") && (
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {t5.pipe.status !== "ready" && (
            <ModelLoader
              status={t5.pipe.status}
              events={t5.pipe.events}
              errorMsg={t5.pipe.error ?? undefined}
              modelId="T5-small · text2text-generation"
            />
          )}
          {sst.pipe.status !== "ready" && task === "sentiment" && (
            <ModelLoader
              status={sst.pipe.status}
              events={sst.pipe.events}
              errorMsg={sst.pipe.error ?? undefined}
              modelId="DistilBERT-SST2 · classification"
            />
          )}
        </div>
      )}

      {/* task selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TASKS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTask(t.id);
              setInput(PRESETS[t.id][0]);
            }}
            className={
              "px-4 py-2 rounded-lg text-sm font-mono transition " +
              (task === t.id
                ? "bg-accent-cyan text-ink-950"
                : "glass text-ink-200 hover:text-ink-50")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="glass-strong rounded-2xl p-5 mb-6">
        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan block mb-2">
          Input · {taskInfo.description}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={task === "summarize" ? 5 : 2}
          className="w-full bg-ink-950/60 border border-ink-700 rounded-lg px-4 py-3 font-mono text-sm text-ink-50 focus:outline-none focus:border-accent-cyan transition resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESETS[task].map((p, i) => (
            <button
              key={i}
              onClick={() => setInput(p)}
              className="text-xs font-mono px-3 py-1 rounded-md bg-ink-800/60 text-ink-300 hover:bg-ink-700/60 hover:text-ink-50 transition truncate max-w-md"
            >
              {p.length > 60 ? p.slice(0, 60) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* two panes */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* BERT side */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-2xl p-6 border-l-4 border-accent-cyan"
        >
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
              encoder-only
            </p>
            <h3 className="font-display font-bold text-2xl text-accent-cyan">BERT</h3>
            <p className="text-xs font-mono text-ink-400 mt-1">
              {task === "sentiment"
                ? "distilbert-sst2 · [CLS] vector → softmax over 2 labels"
                : "no decoder · cannot produce target sequences"}
            </p>
          </div>

          {task === "sentiment" ? (
            <ClassifierPane state={sst.state} />
          ) : (
            <NotSupportedPane task={task} />
          )}
        </motion.div>

        {/* T5 side */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-2xl p-6 border-l-4 border-accent-coral"
        >
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral">
              encoder-decoder
            </p>
            <h3 className="font-display font-bold text-2xl text-accent-coral">T5</h3>
            <p className="text-xs font-mono text-ink-400 mt-1">
              t5-small · prompt:{" "}
              <span className="text-accent-amber">
                &quot;{taskInfo.prefix}
                {input.length > 32 ? input.slice(0, 32) + "…" : input}&quot;
              </span>
            </p>
          </div>
          <T5Pane state={t5.state} />
        </motion.div>
      </div>

      {/* takeaway */}
      <div className="mt-12 grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan mb-2">
            BERT is great at
          </p>
          <ul className="space-y-1.5 text-sm text-ink-200">
            <li>Sentence classification (sentiment, NLI, topic)</li>
            <li>Token-level tagging (NER, POS, span QA)</li>
            <li>Sentence-pair tasks (paraphrase, entailment)</li>
            <li>Embeddings for retrieval / similarity</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral mb-2">
            T5 is great at
          </p>
          <ul className="space-y-1.5 text-sm text-ink-200">
            <li>Translation (any language pair, given training data)</li>
            <li>Abstractive summarization</li>
            <li>Question answering as generation</li>
            <li>Any task you can frame as text-in, text-out</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

function T5Pane({ state }: { state: ReturnType<typeof useT5>["state"] }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400">output</p>
      <div className="rounded-lg p-4 bg-accent-coral/10 border-l-4 border-accent-coral min-h-[80px]">
        {state.status === "running" && !state.streaming && !state.result?.text && (
          <p className="text-ink-400 font-mono text-xs">generating…</p>
        )}
        {(state.streaming || state.result?.text) && (
          <p className="text-ink-50 text-base leading-relaxed">
            {state.streaming || state.result?.text}
            {state.status === "running" && (
              <span className="inline-block w-2 h-4 ml-1 bg-accent-coral animate-pulse-soft align-middle" />
            )}
          </p>
        )}
        {state.status === "error" && (
          <p className="text-accent-coral font-mono text-xs">{state.error}</p>
        )}
      </div>
      {state.result && (
        <div className="flex gap-4 text-[10px] font-mono text-ink-400">
          <span>
            tokens: <span className="text-ink-100">{state.result.numTokens}</span>
          </span>
          <span>
            latency: <span className="text-ink-100">{state.result.elapsedMs.toFixed(0)}ms</span>
          </span>
          <span>
            tok/s: <span className="text-ink-100">{state.result.tokPerSec.toFixed(1)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function ClassifierPane({ state }: { state: ReturnType<typeof useClassifier>["state"] }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400">predictions</p>
      <div className="space-y-2">
        {state.status === "running" && (
          <p className="text-ink-400 font-mono text-xs">classifying…</p>
        )}
        {state.labels.map((l, i) => {
          const isPos = l.label.toLowerCase().includes("pos");
          const color = isPos ? "#5ee4d4" : "#ff6f91";
          return (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{ background: color + "12", borderLeft: "3px solid " + color }}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm" style={{ color }}>
                  {l.label}
                </span>
                <span className="font-mono text-xs text-ink-300">
                  {(l.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 mt-2 rounded-full bg-ink-800 overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${l.score * 100}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {state.status === "ready" && (
        <p className="text-[10px] font-mono text-ink-400">
          latency: <span className="text-ink-100">{state.elapsedMs.toFixed(0)}ms</span>
        </p>
      )}
      {state.status === "error" && (
        <p className="text-accent-coral font-mono text-xs">{state.error}</p>
      )}
    </div>
  );
}

function NotSupportedPane({ task }: { task: Task }) {
  const label = task === "summarize" ? "summarization" : "translation";
  return (
    <div className="space-y-3">
      <div className="rounded-lg p-4 bg-ink-800/40 border-l-4 border-ink-500">
        <p className="text-[10px] uppercase tracking-wider font-mono text-ink-400 mb-1">
          best you can do
        </p>
        <p className="text-sm text-ink-100">
          {label === "translation" ? (
            <>
              Take the <span className="font-mono text-accent-cyan">[CLS]</span> vector and feed
              it to a translation head — except <em>there is no translation head</em>. BERT only
              produces token embeddings. To translate you need a decoder, and BERT has none.
            </>
          ) : (
            <>
              Best case: extractive summarization — pick the {label === "translation" ? "" : ""}
              most-attended sentences using BERT&apos;s [CLS] scores. <em>Abstractive</em>{" "}
              summarization (paraphrasing, novel wording) requires a generative decoder.
            </>
          )}
        </p>
      </div>
      <p className="text-xs font-mono text-ink-400">
        See <a href="/why-not-bert" className="text-accent-coral hover:underline">/why-not-bert</a>{" "}
        for the architectural reasons.
      </p>
    </div>
  );
}
