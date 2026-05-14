/**
 * Thin wrapper around @huggingface/transformers. We import the package directly
 * so Vite can resolve and pre-bundle it; the WASM runtime is loaded on demand by
 * transformers.js itself when the first model is requested.
 */
import {
  AutoTokenizer,
  AutoModel,
  pipeline,
  env,
  type PreTrainedTokenizer,
  type PreTrainedModel,
} from "@huggingface/transformers";

let _envConfigured = false;
function configureEnv() {
  if (_envConfigured) return;
  env.allowRemoteModels = true;
  env.allowLocalModels = false;
  _envConfigured = true;
}

let _webgpuChecked = false;
let _hasWebGPU = false;
export async function hasWebGPU(): Promise<boolean> {
  if (_webgpuChecked) return _hasWebGPU;
  _webgpuChecked = true;
  try {
    if (typeof navigator === "undefined") return false;
    // @ts-expect-error WebGPU may not be in TS lib yet
    const gpu = navigator.gpu;
    if (!gpu) {
      _hasWebGPU = false;
      return false;
    }
    const adapter = await gpu.requestAdapter();
    _hasWebGPU = !!adapter;
  } catch {
    _hasWebGPU = false;
  }
  return _hasWebGPU;
}

export type Device = "webgpu" | "wasm";

export async function pickDevice(prefer: Device | "auto" = "auto"): Promise<Device> {
  if (prefer === "wasm") return "wasm";
  if (prefer === "webgpu") return "webgpu";
  return (await hasWebGPU()) ? "webgpu" : "wasm";
}

export type ProgressEvent = {
  status: "initiate" | "download" | "progress" | "done" | "ready";
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
};

export type ProgressCallback = (e: ProgressEvent) => void;

const tokenizerCache = new Map<string, Promise<PreTrainedTokenizer>>();
const modelCache = new Map<string, Promise<PreTrainedModel>>();
const pipelineCache = new Map<string, Promise<any>>();

export async function loadTokenizer(id: string, onProgress?: ProgressCallback) {
  configureEnv();
  if (!tokenizerCache.has(id)) {
    tokenizerCache.set(
      id,
      AutoTokenizer.from_pretrained(id, { progress_callback: onProgress as any })
    );
  }
  return tokenizerCache.get(id)!;
}

export async function loadModel(
  id: string,
  options: { dtype?: "fp32" | "fp16" | "q8" | "q4"; device?: Device | "auto"; output_attentions?: boolean } = {},
  onProgress?: ProgressCallback
) {
  configureEnv();
  const device = await pickDevice(options.device ?? "auto");
  // fp16 is great on webgpu, q8 is the safe default on wasm
  const dtype = options.dtype ?? (device === "webgpu" ? "fp16" : "q8");
  const key = id + ":" + device + ":" + dtype;
  if (!modelCache.has(key)) {
    modelCache.set(
      key,
      AutoModel.from_pretrained(id, {
        device,
        dtype,
        progress_callback: onProgress as any,
      } as any)
    );
  }
  return modelCache.get(key)!;
}

export async function loadPipeline(
  task: string,
  modelId: string,
  options: { dtype?: "fp32" | "fp16" | "q8" | "q4"; device?: Device | "auto" } = {},
  onProgress?: ProgressCallback
) {
  configureEnv();
  const device = await pickDevice(options.device ?? "auto");
  const dtype = options.dtype ?? (device === "webgpu" ? "fp16" : "q8");
  const key = task + ":" + modelId + ":" + device + ":" + dtype;
  if (!pipelineCache.has(key)) {
    pipelineCache.set(
      key,
      pipeline(task as any, modelId, {
        device,
        dtype,
        progress_callback: onProgress as any,
      } as any) as Promise<any>
    );
  }
  return pipelineCache.get(key)!;
}

/* simple PCA — used to project 768-d embeddings to 2-D. */
export function pca2d(vectors: number[][]): { x: number; y: number }[] {
  const n = vectors.length;
  if (n === 0) return [];
  const d = vectors[0].length;

  // mean-center
  const mean = new Array(d).fill(0);
  for (const v of vectors) for (let i = 0; i < d; i++) mean[i] += v[i];
  for (let i = 0; i < d; i++) mean[i] /= n;
  const X = vectors.map((v) => v.map((x, i) => x - mean[i]));

  // power-iteration for top 2 principal components
  const pc1 = powerIteration(X, d, 80);
  const X2 = X.map((row) => {
    const proj = dot(row, pc1);
    return row.map((x, i) => x - proj * pc1[i]);
  });
  const pc2 = powerIteration(X2, d, 80);

  // project
  const coords = X.map((row) => ({ x: dot(row, pc1), y: dot(row, pc2) }));

  // normalize to [0, 1]
  const xs = coords.map((c) => c.x);
  const ys = coords.map((c) => c.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rx = maxX - minX || 1;
  const ry = maxY - minY || 1;
  return coords.map((c) => ({
    x: (c.x - minX) / rx,
    y: (c.y - minY) / ry,
  }));
}

function powerIteration(X: number[][], d: number, iters: number): number[] {
  let v = new Array(d).fill(0).map(() => Math.random() - 0.5);
  v = normalize(v);
  for (let k = 0; k < iters; k++) {
    const Xv = X.map((row) => dot(row, v));
    const next = new Array(d).fill(0);
    for (let i = 0; i < X.length; i++) {
      const w = Xv[i];
      const row = X[i];
      for (let j = 0; j < d; j++) next[j] += row[j] * w;
    }
    v = normalize(next);
  }
  return v;
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function normalize(v: number[]) {
  const n = Math.sqrt(dot(v, v)) || 1;
  return v.map((x) => x / n);
}

export function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}
