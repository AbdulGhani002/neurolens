/**
 * Real architecture configs for the BERT and T5 families. Numbers are pulled
 * straight from the model cards on Hugging Face — same hyper-parameters every
 * researcher cites.
 */

export type ModelFamily = "bert" | "t5";

export type ModelConfig = {
  id: string;
  display: string;
  family: ModelFamily;
  /** number of encoder layers (BERT) or encoder layers (T5) */
  encoderLayers: number;
  /** decoder layers (T5 only) */
  decoderLayers?: number;
  hidden: number;
  heads: number;
  ffnHidden: number;
  vocab: number;
  maxPositions: number;
  paramsM: number;
  /** total trainable parameters in millions */
  notes?: string;
};

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "bert-base",
    display: "BERT-base · uncased",
    family: "bert",
    encoderLayers: 12,
    hidden: 768,
    heads: 12,
    ffnHidden: 3072,
    vocab: 30522,
    maxPositions: 512,
    paramsM: 110,
    notes: "Original Devlin et al. 2018 model. 110M params, ~440MB at fp32.",
  },
  {
    id: "bert-large",
    display: "BERT-large · uncased",
    family: "bert",
    encoderLayers: 24,
    hidden: 1024,
    heads: 16,
    ffnHidden: 4096,
    vocab: 30522,
    maxPositions: 512,
    paramsM: 340,
    notes: "3x bigger. Sets the original GLUE SOTA in 2018.",
  },
  {
    id: "distilbert-base",
    display: "DistilBERT-base",
    family: "bert",
    encoderLayers: 6,
    hidden: 768,
    heads: 12,
    ffnHidden: 3072,
    vocab: 30522,
    maxPositions: 512,
    paramsM: 66,
    notes: "Half the layers of BERT-base, distilled from it. 60% faster, ~97% of accuracy.",
  },
  {
    id: "minilm-l6",
    display: "all-MiniLM-L6-v2",
    family: "bert",
    encoderLayers: 6,
    hidden: 384,
    heads: 12,
    ffnHidden: 1536,
    vocab: 30522,
    maxPositions: 512,
    paramsM: 22,
    notes: "Used by NeuroLens for the attention + embedding modules. Small, fast, browser-friendly.",
  },
  {
    id: "t5-small",
    display: "T5-small",
    family: "t5",
    encoderLayers: 6,
    decoderLayers: 6,
    hidden: 512,
    heads: 8,
    ffnHidden: 2048,
    vocab: 32128,
    maxPositions: 1024,
    paramsM: 60,
    notes: "Used by NeuroLens for translation + summarization. 60M params, ~240MB at fp32.",
  },
  {
    id: "t5-base",
    display: "T5-base",
    family: "t5",
    encoderLayers: 12,
    decoderLayers: 12,
    hidden: 768,
    heads: 12,
    ffnHidden: 3072,
    vocab: 32128,
    maxPositions: 1024,
    paramsM: 220,
    notes: "The Goldilocks T5: ~220M params, what most papers run as default.",
  },
  {
    id: "t5-large",
    display: "T5-large",
    family: "t5",
    encoderLayers: 24,
    decoderLayers: 24,
    hidden: 1024,
    heads: 16,
    ffnHidden: 4096,
    vocab: 32128,
    maxPositions: 1024,
    paramsM: 770,
    notes: "Best accuracy of the public T5 family. 770M params; too big for browser inference.",
  },
];

/**
 * Per-block parameter budget (in millions, approximate) for a single
 * transformer layer of a given config. Lets the Architecture page show the
 * realistic breakdown — "feed-forward eats ~2/3 of the params, attention is
 * the rest" — for any model.
 */
export function blockParams(c: ModelConfig) {
  const d = c.hidden;
  const ff = c.ffnHidden;
  const heads = c.heads;
  // self-attention: Q, K, V, O each = d*d
  const selfAttnPerLayer = 4 * d * d;
  // feed-forward: d*ff + ff*d (+ small biases)
  const ffnPerLayer = 2 * d * ff;
  // layer norm: 2 * d per norm, two norms per layer
  const lnPerLayer = 4 * d;
  // embeddings: vocab*d + maxPos*d (for BERT, plus segment*d but tiny)
  const embeddings = c.vocab * d + c.maxPositions * d;

  const perEncoderLayer = selfAttnPerLayer + ffnPerLayer + lnPerLayer;
  // decoder layers also have cross-attention = 4*d*d more
  const perDecoderLayer = perEncoderLayer + 4 * d * d;

  const layers = c.encoderLayers + (c.decoderLayers ?? 0);
  const layerSubtotal =
    c.encoderLayers * perEncoderLayer + (c.decoderLayers ?? 0) * perDecoderLayer;

  return {
    embeddings,
    selfAttnPerLayer,
    ffnPerLayer,
    lnPerLayer,
    perEncoderLayer,
    perDecoderLayer,
    layers,
    total: embeddings + layerSubtotal,
    headDim: d / heads,
  };
}

export function fmtParams(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}
