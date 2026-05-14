/**
 * Simplified, in-browser implementations of WordPiece, SentencePiece, and BPE.
 * These reproduce the *shape* of each algorithm — enough to teach the difference
 * — without shipping a full vocab file.
 *
 * For an actual model you'd load:
 *  - bert-base-uncased    → WordPiece, 30,522 tokens
 *  - t5-base              → SentencePiece, 32,128 tokens
 *  - gpt-2                → BPE, 50,257 tokens
 */

export type Token = {
  text: string;
  isContinuation: boolean;
  /** the raw character span this token covers in the original string */
  raw: string;
};

export type TokResult = {
  tokens: Token[];
  vocabHits: number;
  vocabSize: number;
  algorithm: string;
};

/* --- a small handwritten vocab to teach the shapes --- */

const COMMON_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "and", "or", "but", "if", "then", "so", "because", "for", "to", "of", "in", "on",
  "at", "by", "with", "from", "as", "this", "that", "these", "those",
  "cat", "dog", "mat", "sat", "ran", "house", "door", "good", "morning",
  "open", "opened", "close", "quick", "quickly", "translate", "summarize",
  "lab", "fun", "model", "models", "see", "inside", "nlp",
  "hello", "world", "love", "code", "data", "image", "text", "video",
]);

const SUBWORDS = new Set([
  "ing", "ed", "ly", "tion", "er", "est", "able", "ment", "ness", "ful",
  "un", "re", "pre", "dis", "non", "ization", "ative",
  "kind", "ness", "happy", "sad", "play", "work", "run", "walk",
]);

/* ---------- WordPiece (BERT) ---------- */
/**
 * WordPiece rule: a word that isn't in vocab gets split into the longest known
 * prefix, then the remainder is prefixed with "##" and re-tokenized.
 */
export function tokenizeWordPiece(input: string): TokResult {
  const out: Token[] = [];
  let hits = 0;
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s.,!?]/g, " ")
    .split(/(\s+|[.,!?])/)
    .filter((s) => s && !/^\s+$/.test(s));

  for (const word of words) {
    if (word === ".") {
      out.push({ text: ".", isContinuation: false, raw: "." });
      hits++;
      continue;
    }
    if (COMMON_WORDS.has(word)) {
      out.push({ text: word, isContinuation: false, raw: word });
      hits++;
      continue;
    }
    // greedy-longest-prefix split
    let i = 0;
    let isStart = true;
    while (i < word.length) {
      let j = word.length;
      let matched = "";
      while (j > i) {
        const cand = word.slice(i, j);
        const lookup = isStart ? cand : cand;
        const inVocab = isStart
          ? COMMON_WORDS.has(lookup) || SUBWORDS.has(lookup)
          : SUBWORDS.has(lookup);
        if (inVocab) {
          matched = cand;
          break;
        }
        j--;
      }
      if (!matched) {
        // single-char fallback
        matched = word[i];
      }
      out.push({
        text: isStart ? matched : "##" + matched,
        isContinuation: !isStart,
        raw: matched,
      });
      if (COMMON_WORDS.has(matched) || SUBWORDS.has(matched)) hits++;
      i += matched.length;
      isStart = false;
    }
  }
  return {
    tokens: out,
    vocabHits: hits,
    vocabSize: COMMON_WORDS.size + SUBWORDS.size,
    algorithm: "WordPiece (BERT)",
  };
}

/* ---------- SentencePiece (T5) ---------- */
/**
 * SentencePiece treats whitespace as a regular character, marked with "▁".
 * Word-starts get the ▁ prefix; internal pieces don't.
 */
export function tokenizeSentencePiece(input: string): TokResult {
  const out: Token[] = [];
  let hits = 0;
  const SPC = "▁"; // ▁

  // pre-tokenize: split on whitespace but preserve word-start info
  const text = input.toLowerCase().replace(/[^a-z0-9\s.,!?:]/g, " ");
  const words = text.split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (".,!?:".includes(word[0]) && word.length === 1) {
      out.push({ text: word, isContinuation: false, raw: word });
      hits++;
      continue;
    }
    // try whole word with leading ▁
    const whole = SPC + word;
    if (COMMON_WORDS.has(word)) {
      out.push({ text: whole, isContinuation: false, raw: word });
      hits++;
      continue;
    }
    // otherwise split into pieces. First piece carries ▁; rest don't.
    let i = 0;
    let isStart = true;
    while (i < word.length) {
      let j = word.length;
      let matched = "";
      while (j > i) {
        const cand = word.slice(i, j);
        if (COMMON_WORDS.has(cand) || SUBWORDS.has(cand)) {
          matched = cand;
          break;
        }
        j--;
      }
      if (!matched) matched = word[i];
      out.push({
        text: isStart ? SPC + matched : matched,
        isContinuation: !isStart,
        raw: matched,
      });
      if (COMMON_WORDS.has(matched) || SUBWORDS.has(matched)) hits++;
      i += matched.length;
      isStart = false;
    }
  }
  return {
    tokens: out,
    vocabHits: hits,
    vocabSize: COMMON_WORDS.size + SUBWORDS.size,
    algorithm: "SentencePiece (T5)",
  };
}

/* ---------- BPE (GPT-2 style) ---------- */
/**
 * BPE merges the most frequent adjacent byte pairs iteratively.
 * Here we use a tiny hand-built merge table to demonstrate the effect.
 */
const BPE_MERGES: [string, string][] = [
  ["t", "h"],
  ["th", "e"],
  ["i", "n"],
  ["in", "g"],
  ["e", "r"],
  ["a", "n"],
  ["o", "u"],
  ["s", "t"],
  ["e", "d"],
  ["l", "y"],
  ["a", "t"],
  ["o", "n"],
  ["i", "s"],
  ["o", "f"],
  ["q", "u"],
  ["qu", "i"],
  ["qui", "ck"],
  ["c", "k"],
  ["o", "p"],
  ["op", "en"],
];

const MERGE_RANK = new Map<string, number>();
BPE_MERGES.forEach(([a, b], i) => MERGE_RANK.set(a + " " + b, i));

export function tokenizeBPE(input: string): TokResult {
  const out: Token[] = [];
  let hits = 0;
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s.,!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (let widx = 0; widx < words.length; widx++) {
    const word = words[widx];
    // start: split into characters (with leading space marker except for the very first word)
    let pieces: string[] = word.split("");
    if (widx > 0) pieces[0] = "Ġ" + pieces[0]; // GPT-2 leading-space marker

    // iteratively merge the lowest-rank pair
    let didMerge = true;
    while (didMerge && pieces.length > 1) {
      didMerge = false;
      let bestRank = Infinity;
      let bestIdx = -1;
      for (let i = 0; i < pieces.length - 1; i++) {
        // strip GPT-2 marker for rank lookup
        const a = pieces[i].replace(/^Ġ/, "");
        const b = pieces[i + 1];
        const r = MERGE_RANK.get(a + " " + b);
        if (r != null && r < bestRank) {
          bestRank = r;
          bestIdx = i;
        }
      }
      if (bestIdx !== -1) {
        const marker = pieces[bestIdx].startsWith("Ġ") ? "Ġ" : "";
        const merged = marker + pieces[bestIdx].replace(/^Ġ/, "") + pieces[bestIdx + 1];
        pieces.splice(bestIdx, 2, merged);
        didMerge = true;
      }
    }

    pieces.forEach((p, i) => {
      out.push({
        text: p,
        isContinuation: i > 0 && !p.startsWith("Ġ"),
        raw: p.replace(/^Ġ/, ""),
      });
      hits += COMMON_WORDS.has(p.replace(/^Ġ/, "")) ? 1 : 0;
    });
  }

  return {
    tokens: out,
    vocabHits: hits,
    vocabSize: BPE_MERGES.length * 30, // illustrative
    algorithm: "BPE (GPT-2 style)",
  };
}
