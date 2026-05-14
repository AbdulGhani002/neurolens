import { useEffect, useRef, useState } from "react";
import { useTokenizer, usePipeline } from "./useTransformer";
import type { Device } from "../lib/transformers";

export type AttentionResult = {
  tokens: string[];
  /** attentions[layer][head][i][j] — one "head" wrapping the similarity matrix */
  attentions: number[][][][];
  modelId: string;
  device: Device;
  elapsedMs: number;
  /** true when we use cosine-of-hidden-states instead of raw softmax(QKᵀ/√d) */
  derivedFromHidden: boolean;
  hiddenDim: number;
};

type State = {
  status: "idle" | "running" | "ready" | "error";
  result: AttentionResult | null;
  error: string | null;
};

/**
 * Real-BERT visualizer: tokenize, run through bert-base via the
 * feature-extraction pipeline, get per-token hidden vectors, derive a token×token
 * similarity matrix. Honest signal — every number comes out of the real model.
 *
 * Why similarity and not raw attention weights? The ONNX export of bert-base
 * only exposes "logits" (the masked-LM head). To get the actual
 * softmax(QKᵀ/√d) tensors we'd need a re-exported model that lists
 * "attentions" as a graph output. The feature-extraction pipeline does expose
 * real last-layer hidden states, so we use those and softmax-normalize their
 * cosine similarities. This is the same signal used in many BERTology
 * interpretability papers.
 */
export function useAttention(modelId = "Xenova/all-MiniLM-L6-v2") {
  const tokenizer = useTokenizer(modelId);
  const extractor = usePipeline("feature-extraction", modelId, { device: "auto" });
  const [state, setState] = useState<State>({ status: "idle", result: null, error: null });
  const runningRef = useRef(false);

  const ready = tokenizer.status === "ready" && extractor.status === "ready";
  const loading = tokenizer.status === "loading" || extractor.status === "loading";
  const failed = tokenizer.status === "error" || extractor.status === "error";

  async function run(text: string) {
    if (!ready || !tokenizer.value || !extractor.value) return;
    if (runningRef.current) return;
    runningRef.current = true;
    setState((s) => ({ ...s, status: "running", error: null }));
    const t0 = performance.now();

    try {
      const pipe: any = extractor.value;
      // pooling: 'none' returns per-token hidden states; normalize off (we do our own)
      const features = await pipe(text, { pooling: "none", normalize: false });
      // features.dims = [1, seq_len, hidden_dim]
      const dims: number[] = features.dims;
      const seq = dims[dims.length - 2];
      const hidden = dims[dims.length - 1];

      const head = softmaxCosineFromHidden(features.data, seq, hidden);

      const inputs = await tokenizer.value(text, { return_tensors: "pt" } as any);
      const ids = Array.from((inputs.input_ids?.data ?? inputs.input_ids) as Iterable<bigint | number>).map((n) =>
        typeof n === "bigint" ? Number(n) : n
      );
      const tokens = idsToSurfaceTokens(tokenizer.value, ids);

      const elapsedMs = performance.now() - t0;
      const device = (((extractor.value as any).model ?? extractor.value).device ?? "wasm") as Device;
      setState({
        status: "ready",
        error: null,
        result: {
          tokens,
          attentions: [[head]], // one layer, one "head" wrapping the matrix
          modelId,
          device,
          elapsedMs,
          derivedFromHidden: true,
          hiddenDim: hidden,
        },
      });
    } catch (e: any) {
      console.error(e);
      setState({ status: "error", result: null, error: String(e?.message ?? e) });
    } finally {
      runningRef.current = false;
    }
  }

  return { state, run, loading, failed, ready, tokenizer, model: extractor };
}

export function useAutoAttention(
  text: string,
  options: { modelId?: string; debounceMs?: number } = {}
) {
  const att = useAttention(options.modelId);
  const lastTextRef = useRef("");
  useEffect(() => {
    if (!att.ready) return;
    if (!text.trim()) return;
    if (text === lastTextRef.current) return;
    const t = setTimeout(() => {
      lastTextRef.current = text;
      att.run(text);
    }, options.debounceMs ?? 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, att.ready]);
  return att;
}

/**
 * Robustly convert token IDs to their on-screen surface forms across the
 * various paths transformers.js exposes (versions differ on whether
 * convert_ids_to_tokens lives on the tokenizer, its model, or only via decode).
 */
function idsToSurfaceTokens(tok: any, ids: number[]): string[] {
  // 1) tokenizer.model.convert_ids_to_tokens
  try {
    if (tok?.model?.convert_ids_to_tokens) {
      const arr = tok.model.convert_ids_to_tokens(ids);
      if (arr && arr.length === ids.length) return arr;
    }
  } catch {}
  // 2) tokenizer.convert_ids_to_tokens
  try {
    if (tok?.convert_ids_to_tokens) {
      const arr = tok.convert_ids_to_tokens(ids);
      if (arr && arr.length === ids.length) return arr;
    }
  } catch {}
  // 3) decode each ID individually (loses sub-word markers like ##/▁ but works)
  return ids.map((id) => {
    try {
      return String(tok.decode([id], { skip_special_tokens: false }));
    } catch {
      return String(id);
    }
  });
}

/**
 * Compute the token×token softmax-normalised cosine-similarity matrix from a
 * flat [seq, hidden] hidden-state buffer.
 */
function softmaxCosineFromHidden(
  raw: ArrayLike<number>,
  seq: number,
  hidden: number
): number[][] {
  const rows: Float32Array[] = [];
  for (let i = 0; i < seq; i++) {
    const r = new Float32Array(hidden);
    const base = i * hidden;
    let norm = 0;
    for (let j = 0; j < hidden; j++) {
      r[j] = raw[base + j] as number;
      norm += r[j] * r[j];
    }
    const inv = 1 / (Math.sqrt(norm) + 1e-9);
    for (let j = 0; j < hidden; j++) r[j] *= inv;
    rows.push(r);
  }

  const T = 0.08; // temperature: lower = sharper attention pattern
  const head: number[][] = [];
  for (let i = 0; i < seq; i++) {
    const logits = new Float32Array(seq);
    for (let j = 0; j < seq; j++) {
      let dot = 0;
      for (let k = 0; k < hidden; k++) dot += rows[i][k] * rows[j][k];
      logits[j] = dot / T;
    }
    let mx = -Infinity;
    for (let j = 0; j < seq; j++) if (logits[j] > mx) mx = logits[j];
    let sum = 0;
    const row: number[] = new Array(seq);
    for (let j = 0; j < seq; j++) {
      row[j] = Math.exp(logits[j] - mx);
      sum += row[j];
    }
    for (let j = 0; j < seq; j++) row[j] /= sum;
    head.push(row);
  }
  return head;
}
