/**
 * Pre-computed 2D word "embeddings" — hand-placed to demonstrate the *structure*
 * a learned embedding space carries. Real word2vec/BERT embeddings live in 300-768
 * dimensions; what we plot is a stylized PCA-like projection.
 *
 * Coordinates are chosen so that:
 *   - semantic neighbors cluster together
 *   - king − man + woman ≈ queen works (the canonical analogy)
 *   - verbs / nouns / places land in distinct regions
 */

export type WordVec = {
  word: string;
  x: number;
  y: number;
  category: WordCategory;
};

export type WordCategory =
  | "royalty"
  | "animals"
  | "food"
  | "places"
  | "verbs"
  | "tech"
  | "emotions"
  | "numbers"
  | "people";

export const categoryColor: Record<WordCategory, string> = {
  royalty: "#ffc857",
  animals: "#5ee4d4",
  food: "#ff6f91",
  places: "#a472ff",
  verbs: "#9aa3c0",
  tech: "#5ee4d4",
  emotions: "#ff6f91",
  numbers: "#ffc857",
  people: "#a472ff",
};

export const categoryLabel: Record<WordCategory, string> = {
  royalty: "Royalty",
  animals: "Animals",
  food: "Food",
  places: "Places",
  verbs: "Verbs",
  tech: "Tech",
  emotions: "Emotions",
  numbers: "Numbers",
  people: "People",
};

export const WORDS: WordVec[] = [
  // royalty / gender axis: x roughly encodes gender (man=+x, woman=-x)
  { word: "king", x: 0.65, y: 0.85, category: "royalty" },
  { word: "queen", x: 0.35, y: 0.85, category: "royalty" },
  { word: "prince", x: 0.7, y: 0.78, category: "royalty" },
  { word: "princess", x: 0.3, y: 0.78, category: "royalty" },
  { word: "monarch", x: 0.5, y: 0.92, category: "royalty" },

  // people — gender axis is preserved for the analogy
  { word: "man", x: 0.78, y: 0.55, category: "people" },
  { word: "woman", x: 0.22, y: 0.55, category: "people" },
  { word: "boy", x: 0.82, y: 0.45, category: "people" },
  { word: "girl", x: 0.18, y: 0.45, category: "people" },
  { word: "father", x: 0.86, y: 0.6, category: "people" },
  { word: "mother", x: 0.14, y: 0.6, category: "people" },

  // animals
  { word: "cat", x: 0.55, y: 0.3, category: "animals" },
  { word: "dog", x: 0.62, y: 0.32, category: "animals" },
  { word: "horse", x: 0.7, y: 0.28, category: "animals" },
  { word: "cow", x: 0.66, y: 0.22, category: "animals" },
  { word: "bird", x: 0.5, y: 0.36, category: "animals" },
  { word: "fish", x: 0.46, y: 0.22, category: "animals" },

  // food
  { word: "bread", x: 0.2, y: 0.2, category: "food" },
  { word: "pizza", x: 0.16, y: 0.26, category: "food" },
  { word: "rice", x: 0.24, y: 0.16, category: "food" },
  { word: "apple", x: 0.3, y: 0.22, category: "food" },
  { word: "banana", x: 0.34, y: 0.16, category: "food" },

  // places — clustered together
  { word: "paris", x: 0.85, y: 0.05, category: "places" },
  { word: "london", x: 0.92, y: 0.1, category: "places" },
  { word: "tokyo", x: 0.88, y: 0.18, category: "places" },
  { word: "delhi", x: 0.9, y: 0.0, category: "places" },
  { word: "karachi", x: 0.95, y: 0.05, category: "places" },
  { word: "berlin", x: 0.82, y: 0.15, category: "places" },

  // verbs
  { word: "run", x: 0.05, y: 0.7, category: "verbs" },
  { word: "walk", x: 0.08, y: 0.74, category: "verbs" },
  { word: "eat", x: 0.12, y: 0.66, category: "verbs" },
  { word: "sleep", x: 0.0, y: 0.65, category: "verbs" },
  { word: "write", x: 0.04, y: 0.82, category: "verbs" },
  { word: "read", x: 0.07, y: 0.86, category: "verbs" },

  // tech
  { word: "computer", x: 0.4, y: 0.05, category: "tech" },
  { word: "model", x: 0.42, y: 0.0, category: "tech" },
  { word: "code", x: 0.36, y: 0.08, category: "tech" },
  { word: "data", x: 0.44, y: 0.12, category: "tech" },
  { word: "algorithm", x: 0.48, y: 0.02, category: "tech" },
  { word: "network", x: 0.38, y: 0.14, category: "tech" },

  // emotions
  { word: "happy", x: 0.6, y: 0.95, category: "emotions" },
  { word: "sad", x: 0.66, y: 0.92, category: "emotions" },
  { word: "angry", x: 0.7, y: 0.97, category: "emotions" },
  { word: "love", x: 0.56, y: 0.92, category: "emotions" },
  { word: "fear", x: 0.62, y: 0.99, category: "emotions" },

  // numbers
  { word: "one", x: 0.06, y: 0.05, category: "numbers" },
  { word: "two", x: 0.12, y: 0.04, category: "numbers" },
  { word: "three", x: 0.18, y: 0.07, category: "numbers" },
  { word: "ten", x: 0.04, y: 0.12, category: "numbers" },
  { word: "hundred", x: 0.1, y: 0.14, category: "numbers" },
];

/* Euclidean distance in normalized coords */
export function distance(a: WordVec, b: WordVec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function neighbors(word: string, k = 5): WordVec[] {
  const target = WORDS.find((w) => w.word === word);
  if (!target) return [];
  return WORDS.filter((w) => w.word !== word)
    .map((w) => ({ w, d: distance(target, w) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map(({ w }) => w);
}

/* vector arithmetic in 2D space (for the analogy demo) */
export function analogy(a: string, b: string, c: string): { result: WordVec | null; predicted: { x: number; y: number } | null } {
  const wa = WORDS.find((w) => w.word === a);
  const wb = WORDS.find((w) => w.word === b);
  const wc = WORDS.find((w) => w.word === c);
  if (!wa || !wb || !wc) return { result: null, predicted: null };
  const predicted = { x: wa.x - wb.x + wc.x, y: wa.y - wb.y + wc.y };
  let best: WordVec | null = null;
  let bestD = Infinity;
  for (const w of WORDS) {
    if (w.word === a || w.word === b || w.word === c) continue;
    const dx = w.x - predicted.x;
    const dy = w.y - predicted.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = w;
    }
  }
  return { result: best, predicted };
}
