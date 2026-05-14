/**
 * Architecture block descriptions for BERT and T5.
 * Each block has an id, label, short description, and a deeper explanation
 * shown in the side panel when selected.
 */

export type ArchBlock = {
  id: string;
  label: string;
  short: string;
  detail: string;
  math?: string;
  category: "input" | "embed" | "attn" | "ffn" | "norm" | "output" | "decoder";
};

export const bertBlocks: ArchBlock[] = [
  {
    id: "bert-input",
    label: "Input tokens",
    short: "WordPiece-tokenized text with [CLS] and [SEP] markers.",
    detail:
      "BERT receives sub-word tokens produced by WordPiece. [CLS] is prepended for classification tasks; [SEP] separates sentence pairs. Token IDs index into the embedding table.",
    category: "input",
  },
  {
    id: "bert-embed",
    label: "Embeddings",
    short: "Token + Segment + Positional embeddings summed element-wise.",
    detail:
      "Three learned embeddings are summed: token (vocab × 768), segment (which sentence A/B), and absolute positional (max 512 positions). Result: a (sequence_len × 768) matrix that feeds the encoder.",
    math: "E = E_token + E_segment + E_position",
    category: "embed",
  },
  {
    id: "bert-attn",
    label: "Multi-head self-attention",
    short: "Every token attends to every other token — bidirectional.",
    detail:
      "12 heads × 64-dim each. Each head computes Q, K, V projections and softmax(QKᵀ/√d)V. Crucially, the attention mask is NOT causal — every token can see every other token (left and right). That's why BERT is great at understanding, bad at generating.",
    math: "Attn(Q,K,V) = softmax(QKᵀ/√d_k) · V",
    category: "attn",
  },
  {
    id: "bert-norm1",
    label: "Add & LayerNorm",
    short: "Residual + LayerNorm after attention.",
    detail:
      "The attention output is added to its input (residual connection), then layer-normalized along the feature axis. Stabilizes training and lets gradients flow through deep stacks.",
    math: "LN(x + Sublayer(x))",
    category: "norm",
  },
  {
    id: "bert-ffn",
    label: "Feed-forward",
    short: "Two linear layers with GELU between, per-position.",
    detail:
      "Applied independently to each position. 768 → 3072 → 768. The non-linearity that lets each layer mix and re-project the representation. About two-thirds of the trainable parameters live here.",
    math: "FFN(x) = GELU(xW₁ + b₁)W₂ + b₂",
    category: "ffn",
  },
  {
    id: "bert-norm2",
    label: "Add & LayerNorm",
    short: "Residual + LayerNorm after FFN.",
    detail:
      "Same pattern as the post-attention norm. Closes one encoder layer; the output is the input to the next layer.",
    category: "norm",
  },
  {
    id: "bert-stack",
    label: "× 12 encoder layers",
    short: "12 identical encoder blocks stacked.",
    detail:
      "BERT-base has 12 layers, 768 hidden, 12 heads (110M params). BERT-large has 24/1024/16 (340M). Each layer reads all positions and writes new representations for all positions.",
    category: "embed",
  },
  {
    id: "bert-output",
    label: "Contextual outputs",
    short: "One vector per input token + a special [CLS] vector.",
    detail:
      "The [CLS] embedding is used for sentence-level tasks (classification, NSP). The per-token embeddings are used for token-level tasks (NER, QA span prediction). NOTE: there is no decoder — BERT cannot generate sequences.",
    category: "output",
  },
];

export const t5Blocks: ArchBlock[] = [
  {
    id: "t5-input",
    label: "Source tokens",
    short: "SentencePiece-tokenized input prefixed with the task name.",
    detail:
      "T5 frames every task as text-to-text. The input might be \"translate English to German: Hello world\" or \"summarize: <article>\". SentencePiece tokenizes treating whitespace as a regular character.",
    category: "input",
  },
  {
    id: "t5-enc-embed",
    label: "Embeddings (shared)",
    short: "Token embeddings only — relative positions are added inside attention.",
    detail:
      "Unlike BERT, T5 uses no absolute positional embedding. Position information enters through a learned relative-position bias added to the attention logits. The token embedding matrix is shared between encoder, decoder, and the output projection.",
    category: "embed",
  },
  {
    id: "t5-enc-attn",
    label: "Encoder self-attention",
    short: "Bidirectional attention with relative-position bias.",
    detail:
      "Same bidirectional pattern as BERT — every source token attends to every other source token. The relative-position bias gives the model a sense of distance without needing absolute coordinates.",
    math: "Attn = softmax(QKᵀ/√d + bias_rel)V",
    category: "attn",
  },
  {
    id: "t5-enc-ffn",
    label: "Encoder feed-forward",
    short: "Two-layer MLP, ReLU (T5 v1.0) or GeGLU (T5 v1.1).",
    detail:
      "Same shape as BERT's FFN. T5 v1.1 swaps in gated activations (GeGLU/SwiGLU) for better quality at the same parameter budget.",
    category: "ffn",
  },
  {
    id: "t5-enc-stack",
    label: "× N encoder layers",
    short: "N stacked encoder blocks produce a memory tensor.",
    detail:
      "The encoder output (sequence_len × d_model) is the \"memory\" — the decoder reads from it via cross-attention. After this point, the encoder is done; the decoder takes over.",
    category: "embed",
  },
  {
    id: "t5-dec-input",
    label: "Decoder shifted target",
    short: "Previously generated tokens, shifted right by one.",
    detail:
      "During training, the decoder receives the target sequence shifted right by one position, with a special start token. At inference time, tokens are generated one at a time and fed back into the decoder.",
    category: "input",
  },
  {
    id: "t5-dec-self",
    label: "Masked self-attention",
    short: "Causal attention — each token sees only previous tokens.",
    detail:
      "The decoder's self-attention applies a causal mask: token at position i can only attend to positions ≤ i. This is what makes generation possible — without the mask, the model could trivially copy the answer.",
    math: "mask[i,j] = -∞ if j > i else 0",
    category: "attn",
  },
  {
    id: "t5-dec-cross",
    label: "Encoder-decoder cross-attention",
    short: "Decoder queries the encoder's output.",
    detail:
      "The decoder reads the encoder's memory: Q comes from the decoder, K and V come from the encoder output. This is how source information enters the generation process — and it's what BERT lacks entirely.",
    math: "Q = decoder, K = V = encoder",
    category: "attn",
  },
  {
    id: "t5-dec-ffn",
    label: "Decoder feed-forward",
    short: "Same shape as encoder FFN.",
    detail:
      "Identical structure to the encoder FFN. Lets the decoder mix information from its self-attention and cross-attention into a new representation.",
    category: "ffn",
  },
  {
    id: "t5-dec-stack",
    label: "× N decoder layers",
    short: "Stacked decoder blocks; each refines the next-token distribution.",
    detail:
      "After the stack, each decoder position has a vector that, projected through the (tied) embedding matrix, gives a probability over the vocabulary for the next token.",
    category: "decoder",
  },
  {
    id: "t5-output",
    label: "Output token (softmax)",
    short: "argmax / sampling over the vocab — one token at a time.",
    detail:
      "The decoder output is projected through the embedding matrix (weight-tied) to produce logits over the vocabulary. Greedy / beam-search / sampling picks the next token, which is fed back into the decoder for the next step.",
    math: "P(yₜ) = softmax(h_t · Eᵀ)",
    category: "output",
  },
];

export const categoryStyle: Record<ArchBlock["category"], { fill: string; stroke: string; label: string }> = {
  input: { fill: "rgba(154,163,192,0.10)", stroke: "#9aa3c0", label: "Input" },
  embed: { fill: "rgba(255,200,87,0.10)", stroke: "#ffc857", label: "Embedding" },
  attn: { fill: "rgba(94,228,212,0.12)", stroke: "#5ee4d4", label: "Attention" },
  ffn: { fill: "rgba(164,114,255,0.12)", stroke: "#a472ff", label: "Feed-forward" },
  norm: { fill: "rgba(154,163,192,0.08)", stroke: "#6a7497", label: "Add & Norm" },
  output: { fill: "rgba(255,111,145,0.12)", stroke: "#ff6f91", label: "Output" },
  decoder: { fill: "rgba(255,111,145,0.10)", stroke: "#ff6f91", label: "Decoder" },
};
