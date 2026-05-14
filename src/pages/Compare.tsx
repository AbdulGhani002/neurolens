import { useState } from "react";
import PageShell from "../components/PageShell";
import TaskOutput from "../components/graphics/TaskOutput";

type Scenario = {
  id: string;
  label: string;
  input: string;
  tokens: string[];
  bert: { task: string; outputs: { label: string; value: string; meta?: string }[] };
  t5: { task: string; outputs: { label: string; value: string; meta?: string }[] };
};

const SCENARIOS: Scenario[] = [
  {
    id: "sentiment",
    label: "Sentiment",
    input: "The lab was amazing!",
    tokens: ["[CLS]", "the", "lab", "was", "amazing", "!", "[SEP]"],
    bert: {
      task: "classify ([CLS] vector → softmax over labels)",
      outputs: [
        { label: "predicted", value: "POSITIVE", meta: "confidence 0.94" },
        { label: "alt", value: "NEGATIVE — 0.05" },
        { label: "alt", value: "NEUTRAL — 0.01" },
      ],
    },
    t5: {
      task: "text-to-text: \"sst2 sentence: <input>\"",
      outputs: [
        { label: "generated", value: '"positive"', meta: "decoded greedily" },
      ],
    },
  },
  {
    id: "translation",
    label: "Translation",
    input: "Good morning.",
    tokens: ["good", "morning", "."],
    bert: {
      task: "NOT SUPPORTED — no decoder",
      outputs: [
        {
          label: "best you can do",
          value: "768-d vector per token — useless for generation",
          meta: "BERT cannot produce a target sequence",
        },
      ],
    },
    t5: {
      task: "\"translate English to German: Good morning.\"",
      outputs: [
        { label: "generated", value: "Guten Morgen.", meta: "11 decoder steps, [EOS] at t=11" },
      ],
    },
  },
  {
    id: "summarization",
    label: "Summarization",
    input: "The model learns to attend to important words via multi-head attention, layer after layer.",
    tokens: ["...model", "...attend", "...attention", "...layer"],
    bert: {
      task: "NOT SUPPORTED — encoder-only, no generative head",
      outputs: [
        {
          label: "best you can do",
          value: "Extractive only: rank existing tokens by importance",
          meta: "Abstractive summarization needs a decoder",
        },
      ],
    },
    t5: {
      task: "\"summarize: <input>\"",
      outputs: [
        {
          label: "generated",
          value: "Multi-head attention helps the model focus on key words.",
          meta: "18 decoder steps",
        },
      ],
    },
  },
  {
    id: "ner",
    label: "NER (token tagging)",
    input: "Imran works at NUTECH Islamabad.",
    tokens: ["imran", "works", "at", "nutech", "islamabad", "."],
    bert: {
      task: "tag each token (linear head on per-token vectors)",
      outputs: [
        { label: "tags", value: "Imran=B-PER · NUTECH=B-ORG · Islamabad=B-LOC", meta: "natural fit for BERT" },
      ],
    },
    t5: {
      task: "\"ner: <input>\"",
      outputs: [
        {
          label: "generated",
          value: "Imran [PER]; NUTECH [ORG]; Islamabad [LOC]",
          meta: "framed as a generation task",
        },
      ],
    },
  },
];

export default function Compare() {
  const [sc, setSc] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === sc)!;

  return (
    <PageShell
      eyebrow="Module · 05"
      title="BERT vs T5"
      subtitle="Same input. Two architectures. Where each shines, and where the encoder-only model gives up."
    >
      <div className="flex flex-wrap gap-2 mb-8">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSc(s.id)}
            className={
              "px-4 py-2 rounded-lg text-sm font-mono transition " +
              (sc === s.id
                ? "bg-accent-cyan text-ink-950"
                : "glass text-ink-200 hover:text-ink-50")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-strong rounded-2xl p-5 mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-400">input</p>
        <p className="font-mono text-lg text-ink-50 mt-1">&ldquo;{scenario.input}&rdquo;</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-strong rounded-2xl p-6 border-l-4 border-accent-cyan">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
              encoder-only
            </p>
            <h3 className="font-display font-bold text-2xl text-accent-cyan">BERT</h3>
          </div>
          <TaskOutput
            task={scenario.bert.task}
            inputs={scenario.tokens}
            outputs={scenario.bert.outputs}
            accent="cyan"
          />
        </div>

        <div className="glass-strong rounded-2xl p-6 border-l-4 border-accent-coral">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral">
              encoder-decoder
            </p>
            <h3 className="font-display font-bold text-2xl text-accent-coral">T5</h3>
          </div>
          <TaskOutput
            task={scenario.t5.task}
            inputs={scenario.tokens}
            outputs={scenario.t5.outputs}
            accent="coral"
          />
        </div>
      </div>

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
