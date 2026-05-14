import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePipeline } from "./useTransformer";
import { pca2d, cosine } from "../lib/transformers";

export type WordVector = {
  word: string;
  vec: Float32Array;
  /** projected (x, y) in [0, 1] */
  x: number;
  y: number;
  /** an editorial group for color */
  category?: string;
};

type State = {
  status: "idle" | "running" | "ready" | "error";
  result: WordVector[];
  error: string | null;
};

/**
 * Embed a list of words through MiniLM and project to 2-D via PCA.
 * Real embeddings; PCA re-fits whenever the word set changes.
 */
export function useEmbeddings(modelId = "Xenova/all-MiniLM-L6-v2") {
  const pipe = usePipeline("feature-extraction", modelId, { device: "auto" });
  const [state, setState] = useState<State>({ status: "idle", result: [], error: null });
  const runningRef = useRef(false);
  const vecCacheRef = useRef<Map<string, Float32Array>>(new Map());

  async function embed(words: { word: string; category?: string }[]) {
    if (!pipe.value || words.length === 0) return;
    if (runningRef.current) return;
    runningRef.current = true;
    setState((s) => ({ ...s, status: "running", error: null }));

    try {
      const p: any = pipe.value;
      // batch only the new ones to keep latency low
      const newWords = words.filter((w) => !vecCacheRef.current.has(w.word));
      if (newWords.length > 0) {
        const out: any = await p(
          newWords.map((w) => w.word),
          { pooling: "mean", normalize: true }
        );
        // out is a Tensor of shape [N, hidden]; out.data is a flat Float32Array
        const dims = out.dims;
        const hidden = dims[dims.length - 1];
        const data = out.data as Float32Array;
        for (let i = 0; i < newWords.length; i++) {
          const v = new Float32Array(hidden);
          for (let j = 0; j < hidden; j++) v[j] = data[i * hidden + j];
          vecCacheRef.current.set(newWords[i].word, v);
        }
      }

      // pull vectors for all requested words (in input order)
      const vecs: Float32Array[] = [];
      const ordered: { word: string; category?: string }[] = [];
      for (const w of words) {
        const v = vecCacheRef.current.get(w.word);
        if (v) {
          vecs.push(v);
          ordered.push(w);
        }
      }

      // 768-d -> 2-D via PCA
      const projected = pca2d(vecs.map((v) => Array.from(v)));
      const result: WordVector[] = ordered.map((w, i) => ({
        word: w.word,
        category: w.category,
        vec: vecs[i],
        x: projected[i]?.x ?? 0.5,
        y: projected[i]?.y ?? 0.5,
      }));

      setState({ status: "ready", result, error: null });
    } catch (e: any) {
      console.error(e);
      setState({ status: "error", result: [], error: String(e?.message ?? e) });
    } finally {
      runningRef.current = false;
    }
  }

  /** real cosine NN over the cached vectors */
  const neighbors = useCallback((word: string, k = 5): { word: string; sim: number }[] => {
    const target = vecCacheRef.current.get(word);
    if (!target) return [];
    const out: { word: string; sim: number }[] = [];
    for (const [other, v] of vecCacheRef.current.entries()) {
      if (other === word) continue;
      out.push({ word: other, sim: cosine(Array.from(target), Array.from(v)) });
    }
    return out.sort((a, b) => b.sim - a.sim).slice(0, k);
  }, []);

  /** vector arithmetic: a - b + c, return nearest word in the cache */
  const analogy = useCallback(
    (a: string, b: string, c: string): { word: string; sim: number } | null => {
      const va = vecCacheRef.current.get(a);
      const vb = vecCacheRef.current.get(b);
      const vc = vecCacheRef.current.get(c);
      if (!va || !vb || !vc) return null;
      const target = new Float32Array(va.length);
      for (let i = 0; i < va.length; i++) target[i] = va[i] - vb[i] + vc[i];
      // L2-normalize for cosine
      let n = 0;
      for (let i = 0; i < target.length; i++) n += target[i] * target[i];
      const inv = 1 / (Math.sqrt(n) + 1e-9);
      for (let i = 0; i < target.length; i++) target[i] *= inv;
      let best = { word: "", sim: -Infinity };
      for (const [other, v] of vecCacheRef.current.entries()) {
        if (other === a || other === b || other === c) continue;
        const sim = cosine(Array.from(target), Array.from(v));
        if (sim > best.sim) best = { word: other, sim };
      }
      return best.sim > -Infinity ? best : null;
    },
    []
  );

  return { state, embed, neighbors, analogy, pipe };
}

/**
 * Convenience: auto-embed a static seed list once the model is ready.
 */
export function useAutoEmbeddings(
  seed: { word: string; category?: string }[],
  modelId?: string
) {
  const emb = useEmbeddings(modelId);
  const seedKey = useMemo(() => seed.map((s) => s.word).join("|"), [seed]);
  const lastKey = useRef("");
  useEffect(() => {
    if (emb.pipe.status !== "ready") return;
    if (seedKey === lastKey.current) return;
    lastKey.current = seedKey;
    emb.embed(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey, emb.pipe.status]);
  return emb;
}
