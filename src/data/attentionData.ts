/**
 * Pre-computed (synthesized for teaching) attention matrices for sample sentences.
 * 12 heads x N x N, where N is the number of tokens.
 *
 * Each head is given a "specialization" that's known from the literature
 * (Clark et al. 2019, "What Does BERT Look At?"):
 *   - diagonal: self-token
 *   - previous: attends to the previous token
 *   - next: attends to the next token
 *   - first: attends to [CLS]
 *   - last: attends to [SEP]
 *   - dispersed: roughly uniform
 *   - syntactic: lexically motivated edges (handwritten per sentence)
 *
 * These are illustrative — not output from a specific checkpoint. The goal is to
 * make the *patterns* recognizable, not to reproduce a particular run.
 */

export type AttentionSample = {
  id: string;
  label: string;
  tokens: string[];
  /** heads[h][i][j] = attention from token i to token j */
  heads: number[][][];
  /** semantic notes per head, for the side panel */
  headNotes: string[];
};

type Pattern =
  | "self"
  | "prev"
  | "next"
  | "first"
  | "last"
  | "dispersed"
  | "broad-left"
  | "broad-right";

function buildHead(n: number, pattern: Pattern, jitter = 0.05): number[][] {
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let v = 0.02;
      switch (pattern) {
        case "self":
          v = i === j ? 0.9 : 0.02;
          break;
        case "prev":
          v = j === i - 1 ? 0.8 : i === 0 && j === 0 ? 0.6 : 0.03;
          break;
        case "next":
          v = j === i + 1 ? 0.8 : i === n - 1 && j === n - 1 ? 0.6 : 0.03;
          break;
        case "first":
          v = j === 0 ? 0.75 : 0.03;
          break;
        case "last":
          v = j === n - 1 ? 0.75 : 0.03;
          break;
        case "dispersed":
          v = 1 / n + (Math.sin((i + j) * 1.7) + 1) * 0.04;
          break;
        case "broad-left":
          v = j <= i ? 0.9 / (i + 1) : 0.02;
          break;
        case "broad-right":
          v = j >= i ? 0.9 / (n - i) : 0.02;
          break;
      }
      m[i][j] = Math.max(0, v + (Math.random() - 0.5) * jitter);
    }
    // renormalize each row
    const sum = m[i].reduce((a, b) => a + b, 0) || 1;
    for (let j = 0; j < n; j++) m[i][j] /= sum;
  }
  return m;
}

function buildSyntacticHead(n: number, edges: [number, number][]): number[][] {
  // edges: list of (from, to) pairs that should receive strong attention
  const m = Array.from({ length: n }, () => Array(n).fill(0.04));
  for (const [i, j] of edges) {
    if (i < n && j < n) m[i][j] = 0.7;
  }
  for (let i = 0; i < n; i++) {
    const sum = m[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < n; j++) m[i][j] /= sum;
  }
  return m;
}

const SAMPLES: AttentionSample[] = [
  (() => {
    const tokens = ["[CLS]", "the", "cat", "sat", "on", "the", "mat", "[SEP]"];
    const n = tokens.length;
    return {
      id: "cat-mat",
      label: "The cat sat on the mat.",
      tokens,
      heads: [
        buildHead(n, "self"),
        buildHead(n, "prev"),
        buildHead(n, "next"),
        buildHead(n, "first"),
        buildHead(n, "last"),
        buildSyntacticHead(n, [
          [3, 2],
          [3, 6],
          [4, 3],
          [5, 6],
          [6, 5],
        ]),
        buildHead(n, "broad-left"),
        buildHead(n, "broad-right"),
        buildSyntacticHead(n, [
          [2, 1],
          [2, 3],
          [6, 5],
          [6, 4],
        ]),
        buildHead(n, "dispersed"),
        buildSyntacticHead(n, [
          [1, 2],
          [4, 6],
          [5, 6],
        ]),
        buildHead(n, "self", 0.15),
      ],
      headNotes: [
        "Diagonal: each token attends to itself.",
        "Previous: each token looks one step back.",
        "Next: each token looks one step forward.",
        "First-token sink: everything attends to [CLS].",
        "Last-token sink: everything attends to [SEP].",
        "Subject–verb–object: dependency-like edges.",
        "Broad left: cumulative leftward context.",
        "Broad right: cumulative rightward context.",
        "Noun phrase head detection.",
        "Dispersed / nearly uniform — a low-information head.",
        "Content-word focus.",
        "Self-attention with noise — a less-specialized head.",
      ],
    };
  })(),

  (() => {
    const tokens = ["[CLS]", "she", "opened", "the", "door", "quickly", "[SEP]"];
    const n = tokens.length;
    return {
      id: "door-quickly",
      label: "She opened the door quickly.",
      tokens,
      heads: [
        buildHead(n, "self"),
        buildHead(n, "prev"),
        buildHead(n, "next"),
        buildHead(n, "first"),
        buildHead(n, "last"),
        buildSyntacticHead(n, [
          [2, 1],
          [2, 4],
          [5, 2],
          [4, 3],
        ]),
        buildHead(n, "broad-left"),
        buildHead(n, "broad-right"),
        buildSyntacticHead(n, [
          [1, 2],
          [4, 2],
          [5, 2],
        ]),
        buildHead(n, "dispersed"),
        buildSyntacticHead(n, [
          [3, 4],
          [4, 3],
        ]),
        buildHead(n, "self", 0.2),
      ],
      headNotes: [
        "Diagonal.",
        "Previous token.",
        "Next token.",
        "Sink: [CLS].",
        "Sink: [SEP].",
        "Verb anchors arguments (she, door, quickly).",
        "Broad-left context.",
        "Broad-right context.",
        "Everything points back at the verb.",
        "Dispersed.",
        "Det–noun pairing (the ↔ door).",
        "Noisy self.",
      ],
    };
  })(),

  (() => {
    const tokens = ["[CLS]", "translate", ":", "good", "morning", "[SEP]"];
    const n = tokens.length;
    return {
      id: "translate-prefix",
      label: "translate: good morning",
      tokens,
      heads: [
        buildHead(n, "self"),
        buildHead(n, "prev"),
        buildHead(n, "next"),
        buildHead(n, "first"),
        buildHead(n, "last"),
        buildSyntacticHead(n, [
          [3, 1],
          [4, 1],
          [3, 4],
          [4, 3],
        ]),
        buildHead(n, "broad-left"),
        buildHead(n, "broad-right"),
        buildSyntacticHead(n, [
          [3, 4],
          [4, 3],
        ]),
        buildHead(n, "dispersed"),
        buildSyntacticHead(n, [
          [1, 2],
          [2, 1],
        ]),
        buildHead(n, "self", 0.15),
      ],
      headNotes: [
        "Diagonal.",
        "Previous.",
        "Next.",
        "[CLS] sink.",
        "[SEP] sink.",
        "Task prefix anchors content tokens.",
        "Broad-left.",
        "Broad-right.",
        "Bigram (good ↔ morning).",
        "Dispersed.",
        "Punctuation grouping.",
        "Noisy self.",
      ],
    };
  })(),
];

export default SAMPLES;
