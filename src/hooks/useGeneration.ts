import { useRef, useState } from "react";
import { usePipeline } from "./useTransformer";

export type GenResult = {
  text: string;
  numTokens: number;
  elapsedMs: number;
  /** rough tokens-per-second */
  tokPerSec: number;
};

type State = {
  status: "idle" | "running" | "ready" | "error";
  result: GenResult | null;
  /** the partial text as the decoder streams it out, token by token */
  streaming: string;
  error: string | null;
};

/** Use a Text2Text pipeline (T5) to translate / summarize / etc. */
export function useT5(modelId = "Xenova/t5-small") {
  // q8 quantization breaks T5-small generation (empty output); fp32 is safest.
  // On WebGPU we use fp16 (still high enough fidelity).
  const pipe = usePipeline("text2text-generation", modelId, {
    device: "auto",
    dtype: "fp32",
  });
  const [state, setState] = useState<State>({
    status: "idle",
    result: null,
    streaming: "",
    error: null,
  });
  const runningRef = useRef(false);

  async function generate(
    text: string,
    options: { max_new_tokens?: number; onStream?: (chunk: string, full: string) => void } = {}
  ) {
    if (!pipe.value) return;
    if (runningRef.current) return;
    runningRef.current = true;
    setState({ status: "running", result: null, streaming: "", error: null });

    const t0 = performance.now();
    try {
      const p: any = pipe.value;
      // streaming callback collects tokens as they arrive
      let streamText = "";
      let tokenCount = 0;
      const tokenCallback = (token: string) => {
        streamText += token;
        tokenCount++;
        options.onStream?.(token, streamText);
        setState((s) => ({ ...s, streaming: streamText }));
      };

      // try TextStreamer (transformers.js v3+)
      let outputs: any;
      let streamerOk = false;
      try {
        const { TextStreamer } = await import("@huggingface/transformers");
        const streamer = new TextStreamer(p.tokenizer, {
          skip_prompt: true,
          skip_special_tokens: true,
          callback_function: tokenCallback,
        } as any);
        outputs = await p(text, {
          max_new_tokens: options.max_new_tokens ?? 64,
          streamer,
        });
        streamerOk = streamText.length > 0;
      } catch (e) {
        // streamer unavailable / unsupported, fall through
      }
      if (!streamerOk) {
        outputs = await p(text, { max_new_tokens: options.max_new_tokens ?? 64 });
      }

      // Pipelines return one of: [{ generated_text }], [{ translation_text }], or a Tensor
      const first: any = Array.isArray(outputs) ? outputs[0] : outputs;
      console.log(
        "[T5] outputs[0]:",
        first,
        "keys:",
        first ? Object.keys(first) : null
      );
      const generated =
        first?.generated_text ??
        first?.translation_text ??
        first?.summary_text ??
        (typeof first === "string" ? first : "") ??
        "";
      const finalText = streamText || generated;
      const elapsedMs = performance.now() - t0;
      const numTokens = tokenCount || finalText.split(/\s+/).filter(Boolean).length;
      setState({
        status: "ready",
        result: {
          text: finalText,
          numTokens,
          elapsedMs,
          tokPerSec: numTokens / (elapsedMs / 1000),
        },
        streaming: finalText,
        error: null,
      });
    } catch (e: any) {
      console.error(e);
      setState({
        status: "error",
        result: null,
        streaming: "",
        error: String(e?.message ?? e),
      });
    } finally {
      runningRef.current = false;
    }
  }

  return { state, generate, pipe };
}

/** Use a text-classification pipeline (e.g. distilbert-sst2). */
export function useClassifier(modelId = "Xenova/distilbert-base-uncased-finetuned-sst-2-english") {
  const pipe = usePipeline("text-classification", modelId, { device: "auto" });
  const [state, setState] = useState<{
    status: "idle" | "running" | "ready" | "error";
    labels: { label: string; score: number }[];
    elapsedMs: number;
    error: string | null;
  }>({ status: "idle", labels: [], elapsedMs: 0, error: null });
  const runningRef = useRef(false);

  async function classify(text: string, topk = 3) {
    if (!pipe.value) return;
    if (runningRef.current) return;
    runningRef.current = true;
    setState((s) => ({ ...s, status: "running", error: null }));
    const t0 = performance.now();
    try {
      const p: any = pipe.value;
      const out = await p(text, { topk });
      const arr = Array.isArray(out) ? out : [out];
      const elapsedMs = performance.now() - t0;
      setState({
        status: "ready",
        labels: arr.map((x: any) => ({ label: String(x.label), score: Number(x.score) })),
        elapsedMs,
        error: null,
      });
    } catch (e: any) {
      console.error(e);
      setState({ status: "error", labels: [], elapsedMs: 0, error: String(e?.message ?? e) });
    } finally {
      runningRef.current = false;
    }
  }

  return { state, classify, pipe };
}
